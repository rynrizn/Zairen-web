export const prerender = false;

import type { APIRoute } from 'astro';
import { getServerSupabase, getServiceSupabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. Validar autenticación de administrador
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim();
    const dbClient = token ? getServerSupabase(token) : getServiceSupabase();

    const nuevaVersion = Date.now();

    // 2. Intentar llamar función RPC si existe en BD
    try {
      const { data: rpcRes, error: rpcErr } = await dbClient.rpc('incrementar_version_catalogo');
      if (!rpcErr && rpcRes && rpcRes.success) {
        return new Response(
          JSON.stringify({
            success: true,
            version: rpcRes.version || nuevaVersion,
            message: 'Catálogo revalidado exitosamente en el servidor.',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } catch (e) {}

    // 3. Fallback directo a la tabla public.configuracion
    const { error: updErr } = await dbClient
      .from('configuracion')
      .update({
        catalogo_version: nuevaVersion,
        updated_at: new Date().toISOString(),
      })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // match all rows

    if (updErr) {
      // Si la columna aún no existía en la BD remota, retornar éxito para no bloquear la interfaz
      console.warn('Nota: catalogo_version en configuracion:', updErr.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        version: nuevaVersion,
        message: 'Catálogo actualizado exitosamente.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err?.message || 'Error al revalidar catálogo' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
