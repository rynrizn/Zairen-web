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

    const queryParams = new URLSearchParams({
      max_results: String(limit),
      type: 'upload',
    });
    if (nextCursor) {
      queryParams.set('next_cursor', nextCursor);
    }
    if (prefix) {
      queryParams.set('prefix', prefix);
    }

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?${queryParams.toString()}`;

    const cldResponse = await fetch(cloudinaryUrl, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${basicCredentials}`,
        Accept: 'application/json',
      },
    });

    if (!cldResponse.ok) {
      const errJson = await cldResponse.json().catch(() => ({}));
      return new Response(
        JSON.stringify({
          success: false,
          error: errJson?.error?.message || `Error ${cldResponse.status} de Cloudinary Admin API`,
          diag: {
            cloudNameConfigured: Boolean(cloudName),
            apiKeyConfigured: Boolean(apiKey),
            apiSecretConfigured: Boolean(apiSecret),
            cldStatus: cldResponse.status,
          },
        }),
        {
          status: cldResponse.status,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        }
      );
    }

    const cldData = await cldResponse.json();

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

    const mappedResources = (cldData.resources || []).map((res: any) => ({
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
        next_cursor: cldData.next_cursor || null,
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
