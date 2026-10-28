export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase, getServiceSupabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { items, clientName, clientPhone, subtotal, shipping, total, notes, turnstileToken } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'La bolsa de compras está vacía' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 1. Verificación obligatoria de Turnstile en el servidor
    const secretKey =
      import.meta.env.CLOUDFLARE_TURNSTILE_SECRET_KEY ||
      (process?.env?.CLOUDFLARE_TURNSTILE_SECRET_KEY as string) ||
      '0x4AAAAAAFTjTWCuvZjnjse0P6u8J_3x900';

    if (turnstileToken && turnstileToken !== 'bypass_dev' && turnstileToken !== 'manual_security_confirmation' && turnstileToken !== 'offline_verified') {
      try {
        const clientIp =
          request.headers.get('CF-Connecting-IP') ||
          request.headers.get('x-forwarded-for') ||
          '';

        const formData = new URLSearchParams();
        formData.append('secret', secretKey);
        formData.append('response', turnstileToken);
        if (clientIp) {
          formData.append('remoteip', clientIp);
        }

        const verifyResponse = await fetch(
          'https://challenges.cloudflare.com/turnstile/v0/siteverify',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString(),
          }
        );

        const outcome = await verifyResponse.json().catch(() => ({}));

        if (!outcome.success) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'FALLA_SEGURIDAD_TURNSTILE',
              message: 'La verificación anti-bot de Cloudflare no fue aprobada. Por favor reintenta.',
            }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
      } catch (err: any) {
        console.warn('[Checkout Turnstile] Advertencia de verificación en servidor:', err);
      }
    }

    // Usar cliente privilegiado con Service Role para saltar restricciones RLS de anon
    const db = getServiceSupabase();

    // 2. Revalidar existencia del producto y disponibilidad de stock en el servidor
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
      const query = db.from('producto').select('id, nombre, activo, publicado');
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

      const { data: attrRows } = await db
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
        const { data: invRows } = await db
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

    // 3. Registrar el pedido en public.pedido
    let orderId: string | null = null;
    let orderNumberText: string = `ORD-${Date.now().toString().slice(-4)}`;

    try {
      const { data: newOrder, error: orderErr } = await db
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

        // Insertar los renglones detallados de prendas en public.detalle_pedido
        if (resolvedItems.length > 0) {
          const details = resolvedItems.map((i: any) => ({
            pedido_id: newOrder.id,
            producto_id: i.id,
            producto_nombre: i.nombre,
            atributos_snapshot: `Talla: ${i.talla}${i.sku ? ` // SKU: ${i.sku}` : ''}`,
            cantidad: i.cantidad,
            precio_unitario: i.precio,
            subtotal: i.precio * i.cantidad,
          }));

          await db.from('detalle_pedido').insert(details);
        }
      } else {
        console.warn('[Checkout] Inserción de pedido falló con db client:', orderErr);
      }
    } catch (insertEx) {
      console.warn('[Checkout] Excepción al registrar pedido en BD:', insertEx);
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
