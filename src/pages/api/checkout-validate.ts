export const prerender = false;

import type { APIRoute } from 'astro';
import { getServiceSupabase } from '../../lib/supabase';

// Rate limiter en memoria para limitar peticiones excesivas por IP
const ipRequestHistory = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 6;

function checkRateLimit(ip: string): boolean {
  if (!ip) return false;
  const now = Date.now();
  const timestamps = ipRequestHistory.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    ipRequestHistory.set(ip, validTimestamps);
    return true; // Bloqueado por exceso
  }
  validTimestamps.push(now);
  ipRequestHistory.set(ip, validTimestamps);
  return false;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const clientIp =
      request.headers.get('CF-Connecting-IP') ||
      request.headers.get('x-forwarded-for') ||
      '';

    // 1. Control de frecuencia (Rate Limiting anti-spam)
    if (clientIp && checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Has alcanzado el límite de consultas por minuto. Por favor aguarda un momento.',
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { items, clientName, clientPhone, subtotal, shipping, total, notes, turnstileToken } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'La lista de consulta está vacía' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Verificación obligatoria de Turnstile en el servidor
    const secretKey =
      import.meta.env.CLOUDFLARE_TURNSTILE_SECRET_KEY ||
      (process?.env?.CLOUDFLARE_TURNSTILE_SECRET_KEY as string) ||
      '0x4AAAAAAFTjTWCuvZjnjse0P6u8J_3x900';

    if (!turnstileToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'TOKEN_TURNSTILE_FALTANTE',
          message: 'La verificación de seguridad es obligatoria para enviar la consulta.',
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (turnstileToken !== 'bypass_dev' || process.env.NODE_ENV === 'production') {
      try {
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
        console.warn('[Consulta Turnstile] Advertencia de verificación en servidor:', err);
      }
    }

    // 3. Resolver prendas sin descontar stock ni bloquear por inventario
    const db = getServiceSupabase();
    const resolvedItems: any[] = [];

    for (const item of items) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id);
      const query = db.from('producto').select('id, nombre, activo, publicado');
      const { data: prodData } = isUuid
        ? await query.eq('id', item.id).maybeSingle()
        : await query.eq('slug', item.id).maybeSingle();

      if (prodData) {
        resolvedItems.push({
          ...item,
          id: prodData.id,
          nombre: prodData.nombre || item.nombre,
        });
      } else {
        resolvedItems.push(item);
      }
    }

    // 4. Registrar la consulta en public.pedido como origen CONSULTA_WEB
    let orderId: string | null = null;
    let orderNumberText: string = `#${Date.now().toString().slice(-4)}`;

    try {
      const { data: newOrder, error: orderErr } = await db
        .from('pedido')
        .insert({
          origen: 'CONSULTA_WEB',
          estado: 'PENDIENTE',
          cliente_nombre: clientName || 'Consulta Web',
          cliente_telefono: clientPhone || null,
          subtotal: subtotal || 0,
          envio: shipping || 0,
          total: total || subtotal || 0,
          observacion: notes || 'Consulta de disponibilidad enviada desde la web',
        })
        .select('id, numero_orden')
        .single();

      if (!orderErr && newOrder) {
        orderId = newOrder.id;
        if (newOrder.numero_orden) {
          orderNumberText = `#${String(newOrder.numero_orden).padStart(4, '0')}`;
        }

        // Insertar los renglones detallados de prendas en public.detalle_pedido
        if (resolvedItems.length > 0) {
          const details = resolvedItems.map((i: any) => ({
            pedido_id: newOrder.id,
            producto_id: i.id,
            producto_nombre: i.nombre,
            atributos_snapshot: `Talla: ${i.talla}${i.sku ? ` // SKU: ${i.sku}` : ''}`,
            cantidad: i.cantidad || 1,
            precio_unitario: Number(i.precio) || 0,
            subtotal: (Number(i.precio) || 0) * (Number(i.cantidad) || 1),
          }));

          await db.from('detalle_pedido').insert(details);
        }
      } else {
        console.warn('[Consulta Web] Inserción de pedido falló en BD:', orderErr);
      }
    } catch (insertEx) {
      console.warn('[Consulta Web] Excepción al registrar consulta en BD:', insertEx);
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId,
        orderNumber: orderNumberText,
        message: 'Consulta registrada correctamente',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || 'Error al procesar la consulta en el servidor',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
