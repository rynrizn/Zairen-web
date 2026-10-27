export const prerender = false;

import type { APIRoute } from 'astro';
import { getServerSupabase, getServiceSupabase } from '../../../lib/supabase';

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const { id, forzarArchivo } = body;

    if (!id || typeof id !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'ID de producto no especificado' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 1. Validar autenticación
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim();
    const dbClient = token ? getServerSupabase(token) : getServiceSupabase();

    // 2. Intentar ejecutar función RPC si existe en BD
    try {
      const { data: rpcRes, error: rpcErr } = await dbClient.rpc('eliminar_o_archivar_producto', {
        p_producto_id: id,
        p_forzar_archivo: Boolean(forzarArchivo),
      });

      if (!rpcErr && rpcRes) {
        const statusCode = rpcRes.success ? 200 : 409;
        return new Response(JSON.stringify(rpcRes), {
          status: statusCode,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch (e) {}

    // 3. Lógica de contingencia en servidor
    const { data: prodData } = await dbClient
      .from('producto')
      .select('id, nombre')
      .eq('id', id)
      .maybeSingle();

    if (!prodData) {
      return new Response(
        JSON.stringify({ success: false, error: 'El producto no existe' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar si aparece en pedidos
    const { count: pedidosCount } = await dbClient
      .from('detalle_pedido')
      .select('id', { count: 'exact', head: true })
      .eq('producto_id', id);

    const totalPedidos = pedidosCount || 0;

    // Regla 1: Si aparece en pedidos anteriores -> NO borrar físicamente
    if (totalPedidos > 0) {
      if (forzarArchivo) {
        const { error: updErr } = await dbClient
          .from('producto')
          .update({ activo: false, publicado: false })
          .eq('id', id);

        if (updErr) {
          return new Response(
            JSON.stringify({ success: false, error: updErr.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            accion: 'ARCHIVADO',
            nombre: prodData.nombre,
            pedidosAsociados: totalPedidos,
            message: `La prenda "${prodData.nombre}" fue archivada con éxito para preservar el historial de sus ${totalPedidos} pedido(s) asociados.`,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      } else {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'REQUIERE_ARCHIVO',
            nombre: prodData.nombre,
            pedidosAsociados: totalPedidos,
            message: `La prenda "${prodData.nombre}" aparece en ${totalPedidos} pedido(s) anteriores. Para proteger el historial contable de ventas, debe ser Archivada en lugar de eliminada físicamente.`,
          }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Regla 2: Sin pedidos -> Eliminar dependencias y producto
    await dbClient.from('atributo_producto').delete().eq('producto_id', id);
    await dbClient.from('inventario').delete().eq('producto_id', id);
    await dbClient.from('imagen').delete().eq('producto_id', id);

    const { error: delErr } = await dbClient
      .from('producto')
      .delete()
      .eq('id', id);

    if (delErr) {
      return new Response(
        JSON.stringify({ success: false, error: delErr.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        accion: 'ELIMINADO',
        nombre: prodData.nombre,
        message: `La prenda "${prodData.nombre}" y sus datos de inventario fueron eliminados definitivamente.`,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err?.message || 'Error del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
