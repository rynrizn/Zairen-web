export const prerender = false;

import type { APIRoute } from 'astro';
import { getServerSupabase } from '../../lib/supabase';

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // 1. Validar sesión del administrador mediante JWT en Authorization
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Acceso no autorizado: Token requerido' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const serverSupabase = getServerSupabase(token);
    const { data: authData, error: authError } = await serverSupabase.auth.getUser(token);

    if (authError || !authData?.user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Sesión no válida o expirada' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Extraer parámetros de paginación y filtrado
    const url = new URL(request.url);
    const nextCursor = url.searchParams.get('next_cursor') || undefined;
    const limitParam = parseInt(url.searchParams.get('limit') || '30', 10);
    const limit = Math.min(Math.max(limitParam, 10), 100);
    const prefixParam = url.searchParams.get('prefix');
    // Si prefixParam es 'all' o '', no se filtra por prefijo para ver toda la cuenta
    // Si no se especifica, por defecto busca en 'zairen/'
    const prefix = prefixParam === 'all' || prefixParam === '' ? '' : (prefixParam ?? 'zairen/');

    // 3. Obtener variables de entorno (Cloudflare Worker runtime, import.meta.env o Node)
    const cfEnv = (locals as any)?.runtime?.env || {};

    // Soporte para URL completa estándar de Cloudinary: cloudinary://<key>:<secret>@<cloud_name>
    const cldUrl =
      cfEnv.CLOUDINARY_URL ||
      cfEnv.PUBLIC_CLOUDINARY_URL ||
      import.meta.env.CLOUDINARY_URL ||
      import.meta.env.PUBLIC_CLOUDINARY_URL ||
      process?.env?.CLOUDINARY_URL;

    let parsedApiKey = '';
    let parsedApiSecret = '';
    let parsedCloudName = '';

    if (cldUrl && typeof cldUrl === 'string') {
      const match = cldUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
      if (match) {
        parsedApiKey = match[1];
        parsedApiSecret = match[2];
        parsedCloudName = match[3];
      }
    }

    const cloudName =
      parsedCloudName ||
      cfEnv.CLOUDINARY_CLOUD_NAME ||
      cfEnv.PUBLIC_CLOUDINARY_CLOUD_NAME ||
      import.meta.env.CLOUDINARY_CLOUD_NAME ||
      import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME ||
      process?.env?.CLOUDINARY_CLOUD_NAME ||
      'ds4qnoypm';

    // Soporte flexible para nombres directos o con prefijo PUBLIC_
    const apiKey =
      parsedApiKey ||
      cfEnv.CLOUDINARY_API_KEY ||
      cfEnv.PUBLIC_CLOUDINARY_API_KEY ||
      cfEnv.CLOUDINARY_KEY ||
      cfEnv.PUBLIC_CLOUDINARY_KEY ||
      import.meta.env.CLOUDINARY_API_KEY ||
      import.meta.env.PUBLIC_CLOUDINARY_API_KEY ||
      process?.env?.CLOUDINARY_API_KEY;

    const apiSecret =
      parsedApiSecret ||
      cfEnv.CLOUDINARY_API_SECRET ||
      cfEnv.PUBLIC_CLOUDINARY_API_SECRET ||
      cfEnv.CLOUDINARY_SECRET ||
      cfEnv.PUBLIC_CLOUDINARY_SECRET ||
      import.meta.env.CLOUDINARY_API_SECRET ||
      import.meta.env.PUBLIC_CLOUDINARY_API_SECRET ||
      process?.env?.CLOUDINARY_API_SECRET;

    // 4. Si faltan credenciales secretas de Cloudinary, consultar imágenes de la BD como contingencia
    if (!apiKey || !apiSecret) {
      const { data: dbImages } = await serverSupabase
        .from('imagen')
        .select('id, url_imagen, public_id, producto_id, tipo, es_portada')
        .order('id', { ascending: false })
        .limit(limit);

      const items = (dbImages || []).map((img) => ({
        public_id: img.public_id || img.url_imagen.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'zairen_img',
        secure_url: img.url_imagen,
        format: 'webp',
        width: 800,
        height: 1000,
        bytes: 0,
        created_at: new Date().toISOString(),
        used_count: 1,
      }));

      const warningDetail = !apiKey && !apiSecret
        ? 'CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET no están configuradas en las variables de entorno de Cloudflare Pages.'
        : !apiKey
        ? 'CLOUDINARY_API_KEY no está configurada en las variables de entorno.'
        : 'CLOUDINARY_API_SECRET no está configurada en las variables de entorno.';

      return new Response(
        JSON.stringify({
          success: true,
          resources: items,
          next_cursor: null,
          warning: `${warningDetail} Mostrando ${items.length} fotos recuperadas de la base de datos local.`,
          diag: {
            cloudNameConfigured: Boolean(cloudName),
            apiKeyConfigured: Boolean(apiKey),
            apiSecretConfigured: Boolean(apiSecret),
          },
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        }
      );
    }

    // 5. Consultar Cloudinary Admin API mediante fetch estándar con Basic Auth
    const basicCredentials =
      typeof btoa !== 'undefined'
        ? btoa(`${apiKey}:${apiSecret}`)
        : Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

    let cldResources: any[] = [];
    let nextCursorReturned: string | null = null;

    if (prefixParam === 'all') {
      // 5.1 Búsqueda general en toda la cuenta de Cloudinary
      const queryParams = new URLSearchParams({
        max_results: String(limit),
        type: 'upload',
      });
      if (nextCursor) queryParams.set('next_cursor', nextCursor);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?${queryParams.toString()}`;
      const cldResponse = await fetch(cloudinaryUrl, {
        headers: {
          Authorization: `Basic ${basicCredentials}`,
          Accept: 'application/json',
        },
      });

      if (cldResponse.ok) {
        const cldData = await cldResponse.json();
        cldResources = cldData.resources || [];
        nextCursorReturned = cldData.next_cursor || null;
      }
    } else {
      // 5.2 Búsqueda exhaustiva en carpeta de productos (Zairen/products, zairen/products, zairen)
      let searchOk = false;
      try {
        const searchUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`;
        const searchExpr = 'folder:"Zairen/products"* OR folder:"zairen/products"* OR folder:"Zairen"* OR folder:"zairen"* OR asset_folder:"Zairen/products"* OR asset_folder:"zairen/products"* OR asset_folder:"Zairen"* OR asset_folder:"zairen"* OR public_id:"Zairen/products"* OR public_id:"zairen"*';
        const searchResp = await fetch(searchUrl, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${basicCredentials}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            expression: searchExpr,
            max_results: limit,
            sort_by: [{ created_at: 'desc' }],
            ...(nextCursor ? { next_cursor: nextCursor } : {}),
          }),
        });

        if (searchResp.ok) {
          const searchData = await searchResp.json();
          cldResources = searchData.resources || [];
          nextCursorReturned = searchData.next_cursor || null;
          searchOk = true;
        }
      } catch (searchErr) {
        console.warn('Search API fallback:', searchErr);
      }

      // Si Search API no arrojó o no está disponible, consultar endpoints por carpeta y asset_folder en paralelo
      if (!searchOk || cldResources.length === 0) {
        const folderCandidates = ['Zairen/products', 'zairen/products', 'Zairen', 'zairen'];
        const fetchPromises: Promise<any>[] = [];

        for (const f of folderCandidates) {
          // A) Por prefix en resources/image
          fetchPromises.push(
            fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image?type=upload&max_results=50&prefix=${encodeURIComponent(f)}`, {
              headers: { Authorization: `Basic ${basicCredentials}`, Accept: 'application/json' },
            }).then(r => r.ok ? r.json() : { resources: [] }).catch(() => ({ resources: [] }))
          );

          // B) Por Dynamic Asset Folder
          fetchPromises.push(
            fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/by_asset_folder?asset_folder=${encodeURIComponent(f)}&max_results=50`, {
              headers: { Authorization: `Basic ${basicCredentials}`, Accept: 'application/json' },
            }).then(r => r.ok ? r.json() : { resources: [] }).catch(() => ({ resources: [] }))
          );
        }

        const results = await Promise.allSettled(fetchPromises);
        const resourceMap = new Map<string, any>();

        for (const res of results) {
          if (res.status === 'fulfilled' && res.value?.resources) {
            for (const item of res.value.resources) {
              const key = item.public_id || item.secure_url;
              if (key && !resourceMap.has(key)) {
                resourceMap.set(key, item);
              }
            }
          }
        }

        cldResources = Array.from(resourceMap.values()).sort((a, b) => {
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });
      }
    }

    // 6. Consultar imágenes en uso en la base de datos para marcar cuáles están activas
    const { data: activeImages } = await serverSupabase
      .from('imagen')
      .select('url_imagen, public_id, producto_id');

    const usageCountMap: Record<string, number> = {};
    if (activeImages) {
      activeImages.forEach((img) => {
        if (img.public_id) usageCountMap[img.public_id] = (usageCountMap[img.public_id] || 0) + 1;
        if (img.url_imagen) usageCountMap[img.url_imagen] = (usageCountMap[img.url_imagen] || 0) + 1;
      });
    }

    const mappedResources = cldResources.map((res: any) => ({
      public_id: res.public_id,
      secure_url: res.secure_url,
      format: res.format,
      width: res.width,
      height: res.height,
      bytes: res.bytes,
      created_at: res.created_at,
      used_count: usageCountMap[res.public_id] || usageCountMap[res.secure_url] || 0,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        resources: mappedResources,
        next_cursor: nextCursorReturned,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': mappedResources.length > 0
          ? 'private, max-age=60, s-maxage=60'
          : 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || 'Error interno al consultar la mediateca',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
