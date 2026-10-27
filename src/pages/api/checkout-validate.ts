export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { items, clientName, clientPhone, subtotal, shipping, total, notes } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'La bolsa de compras está vacía' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 1. Revalidar existencia del producto y disponibilidad de stock en el servidor
    const conflicts: Array<{
      id: string;
      nombre: string;
      talla: string;
      disponible: number;
      solicitado: number;
    }> = [];

    const resolvedItems: any[] = [];

    for (const item of items) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id);
      const query = supabase.from('producto').select('id, nombre, activo, publicado');
      const { data: prodData } = isUuid
        ? await query.eq('id', item.id).maybeSingle()
        : await query.eq('slug', item.id).maybeSingle();

      // Si el producto fue eliminado, archivado o no está publicado
      if (!prodData || !prodData.activo || !prodData.publicado) {
        conflicts.push({
          id: item.id,
          nombre: item.nombre,
          talla: item.talla,
          disponible: 0,
          solicitado: item.cantidad,
        });
        continue;
      }

      const realId = prodData.id;
      resolvedItems.push({
        ...item,
        id: realId,
        nombre: prodData.nombre || item.nombre,
      });

      const { data: attrRows } = await supabase
        .from('atributo_producto')
        .select('valor')
        .eq('producto_id', realId)
        .ilike('clave', `stock_${item.talla}`)
        .maybeSingle();

      let stockReal = 0;
      if (attrRows && attrRows.valor) {
        stockReal = parseInt(attrRows.valor, 10) || 0;
      } else {
        // Fallback a inventario total
        const { data: invRows } = await supabase
          .from('inventario')
          .select('cantidad, cantidad_reservada')
          .eq('producto_id', realId)
          .maybeSingle();
        if (invRows) {
          stockReal = Math.max(0, (invRows.cantidad || 0) - (invRows.cantidad_reservada || 0));
        }
      }

      if (stockReal < item.cantidad) {
        conflicts.push({
          id: item.id,
          nombre: item.nombre,
          talla: item.talla,
          disponible: stockReal,
          solicitado: item.cantidad,
        });
      }
    }

    if (conflicts.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'STOCK_INSUFICIENTE',
          conflictos: conflicts,
          message: conflicts
            .map(
              (c) =>
                `La talla ${c.talla} de "${c.nombre}" ${
                  c.disponible === 0
                    ? 'ya no está disponible'
                    : `solo tiene ${c.disponible} unidad(es) disponible(s)`
                }`
            )
            .join('. '),
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Intentar ejecutar la función RPC transaccional procesar_checkout_pedido
    let orderId: string | null = null;
    let orderNumberText: string = `ORD-${Date.now().toString().slice(-4)}`;

    try {
      const rpcPayload = {
        p_cliente_nombre: clientName || 'Cliente Web',
        p_cliente_telefono: clientPhone || '',
        p_items: resolvedItems.map((i: any) => ({
          producto_id: i.id,
          nombre: i.nombre,
          talla: i.talla,
          cantidad: i.cantidad,
          precio: i.precio,
          sku: i.sku || 'ZRN',
        })),
        p_subtotal: subtotal || 0,
        p_envio: shipping || 0,
        p_total: total || 0,
        p_observacion: notes || 'Pedido iniciado desde Carrito Web',
      };

      const { data: rpcRes, error: rpcErr } = await supabase.rpc(
        'procesar_checkout_pedido',
        rpcPayload
      );

      if (!rpcErr && rpcRes && rpcRes.pedido_id) {
        orderId = rpcRes.pedido_id;
      }
    } catch (rpcEx) {
      console.warn('RPC procesar_checkout_pedido no disponible aún, usando fallback:', rpcEx);
    }

    // Fallback: Si la función RPC aún no fue migrada en la BD remota, registrar directamente en tablas
    if (!orderId) {
      const { data: newOrder, error: orderErr } = await supabase
        .from('pedido')
        .insert({
          origen: 'CATALOGO_WEB',
          estado: 'PENDIENTE',
          subtotal: subtotal || 0,
          envio: shipping || 0,
          total: total || 0,
          observacion: notes || 'Pedido iniciado desde Carrito Web',
        })
        .select('id, numero_orden')
        .single();

      if (!orderErr && newOrder) {
        orderId = newOrder.id;
        if (newOrder.numero_orden) {
          orderNumberText = `ORD-${String(newOrder.numero_orden).padStart(4, '0')}`;
        }

        // Insertar renglones de detalle_pedido
        const details = resolvedItems.map((i: any) => ({
          pedido_id: newOrder.id,
          producto_id: i.id,
          producto_nombre: i.nombre,
          atributos_snapshot: `Talla: ${i.talla}${i.sku ? ` // SKU: ${i.sku}` : ''}`,
          cantidad: i.cantidad,
          precio_unitario: i.precio,
          subtotal: i.precio * i.cantidad,
        }));

        await supabase.from('detalle_pedido').insert(details);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId,
        orderNumber: orderNumberText,
        message: 'Stock verificado y pedido registrado en estado PENDIENTE',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || 'Error al validar el pedido en el servidor',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
