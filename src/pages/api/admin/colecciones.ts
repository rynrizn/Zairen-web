export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase, getServerSupabase, getServiceSupabase } from '../../../lib/supabase';

export const GET: APIRoute = async ({ request }) => {
  try {
    // 1. Obtener todas las colecciones
    const { data: cols, error: colErr } = await supabase
      .from('coleccion')
      .select('id, nombre, slug, activa, orden')
      .order('orden', { ascending: true })
      .order('nombre', { ascending: true });

    if (colErr || !cols) {
      return new Response(
        JSON.stringify({ success: false, error: 'Error al obtener colecciones' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Obtener productos e inventario agrupados
    const { data: prods } = await supabase
      .from('producto')
      .select(`
        id,
        nombre,
        coleccion_id,
        inventario:inventario (cantidad, cantidad_reservada)
      `);

    const colMap = new Map<string, {
      id: string;
      nombre: string;
      slug: string;
      activa: boolean;
      orden: number;
      totalProductos: number;
      productosConStock: number;
      stockTotal: number;
      productosDisponiblesDetalle: Array<{ id: string; nombre: string; stock: number }>;
    }>();

    cols.forEach((c) => {
      colMap.set(c.id, {
        id: c.id,
        nombre: c.nombre,
        slug: c.slug,
        activa: Boolean(c.activa),
        orden: Number(c.orden) || 0,
        totalProductos: 0,
        productosConStock: 0,
        stockTotal: 0,
        productosDisponiblesDetalle: [],
      });
    });

    let sinColeccionCount = 0;

    (prods || []).forEach((p: any) => {
      const stockDisp = (p.inventario || []).reduce(
        (acc: number, inv: any) => acc + Math.max(0, (inv.cantidad || 0) - (inv.cantidad_reservada || 0)),
        0
      );

      if (!p.coleccion_id || !colMap.has(p.coleccion_id)) {
        sinColeccionCount++;
        return;
      }

      const colData = colMap.get(p.coleccion_id)!;
      colData.totalProductos++;
      colData.stockTotal += stockDisp;
      if (stockDisp > 0) {
        colData.productosConStock++;
        colData.productosDisponiblesDetalle.push({
          id: p.id,
          nombre: p.nombre,
          stock: stockDisp,
        });
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        colecciones: Array.from(colMap.values()),
        sinColeccionCount,
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

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const { id } = body;

    if (!id || typeof id !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'ID de colección no especificado' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 1. Validar autenticación
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim();
    const dbClient = token ? getServerSupabase(token) : getServiceSupabase();

    // 2. Intentar ejecutar función RPC si existe en BD
    try {
      const { data: rpcRes, error: rpcErr } = await dbClient.rpc('eliminar_coleccion_segura', {
        p_coleccion_id: id,
      });

      if (!rpcErr && rpcRes) {
        const statusCode = rpcRes.success ? 200 : 409;
        return new Response(JSON.stringify(rpcRes), {
          status: statusCode,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch (e) {
      // Fallback a lógica de servidor si RPC aún no fue creada
    }

    // 3. Lógica de contingencia en servidor (replica exactamente la función RPC)
    const { data: colData } = await dbClient
      .from('coleccion')
      .select('id, nombre')
      .eq('id', id)
      .maybeSingle();

    if (!colData) {
      return new Response(
        JSON.stringify({ success: false, error: 'La colección no existe' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Evaluar productos asociados
    const { data: prods } = await dbClient
      .from('producto')
      .select('id, nombre, inventario:inventario (cantidad, cantidad_reservada)')
      .eq('coleccion_id', id);

    const prodsConStock: Array<{ id: string; nombre: string; stock: number }> = [];
    (prods || []).forEach((p: any) => {
      const stock = (p.inventario || []).reduce(
        (acc: number, inv: any) => acc + Math.max(0, (inv.cantidad || 0) - (inv.cantidad_reservada || 0)),
        0
      );
      if (stock > 0) {
        prodsConStock.push({ id: p.id, nombre: p.nombre, stock });
      }
    });

    // Regla 1: Bloquear si hay productos con stock > 0
    if (prodsConStock.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'TIENE_PRODUCTOS_DISPONIBLES',
          coleccion: colData.nombre,
          productosConStock: prodsConStock.length,
          detalles: prodsConStock,
          message: `No se puede eliminar la colección "${colData.nombre}" porque contiene ${prodsConStock.length} producto(s) con existencias disponibles. Mueve estos productos a otra colección primero.`,
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Regla 2: Desvincular productos sin stock a "Sin colección"
    let desvinculados = 0;
    if (prods && prods.length > 0) {
      const { error: updErr } = await dbClient
        .from('producto')
        .update({ coleccion_id: null })
        .eq('coleccion_id', id);

      if (!updErr) {
        desvinculados = prods.length;
      }
    }

    // Regla 3: Eliminar la colección
    const { error: delErr } = await dbClient
      .from('coleccion')
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
        coleccion: colData.nombre,
        productosDesvinculados: desvinculados,
        message: `La colección "${colData.nombre}" ha sido eliminada. ${desvinculados} prenda(s) sin existencias pasaron a "Sin colección".`,
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
