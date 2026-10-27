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
    const prefix = url.searchParams.get('prefix') || 'zairen/';

    // 3. Obtener variables de entorno (Cloudflare Worker runtime o Node)
    const cfEnv = (locals as any)?.runtime?.env || {};
    const cloudName =
      cfEnv.CLOUDINARY_CLOUD_NAME ||
      import.meta.env.CLOUDINARY_CLOUD_NAME ||
      import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME ||
      process?.env?.CLOUDINARY_CLOUD_NAME ||
      'ds4qnoypm';

    const apiKey =
      cfEnv.CLOUDINARY_API_KEY ||
      import.meta.env.CLOUDINARY_API_KEY ||
      process?.env?.CLOUDINARY_API_KEY;

    const apiSecret =
      cfEnv.CLOUDINARY_API_SECRET ||
      import.meta.env.CLOUDINARY_API_SECRET ||
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

      return new Response(
        JSON.stringify({
          success: true,
          resources: items,
          next_cursor: null,
          warning: 'CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET no configuradas. Mostrando recursos de BD.',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'private, max-age=30',
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
        }),
        { status: cldResponse.status, headers: { 'Content-Type': 'application/json' } }
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
          'Cache-Control': 'private, max-age=60, s-maxage=60',
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
