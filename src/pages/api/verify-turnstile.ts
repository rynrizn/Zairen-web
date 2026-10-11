export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const token = body?.token;

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token no proporcionado' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const secretKey =
      import.meta.env.CLOUDFLARE_TURNSTILE_SECRET_KEY ||
      (process?.env?.CLOUDFLARE_TURNSTILE_SECRET_KEY as string) ||
      '0x4AAAAAAFTjTWCuvZjnjse0P6u8J_3x900';

    // Obtener IP del cliente si está disponible mediante headers de Cloudflare
    const clientIp =
      request.headers.get('CF-Connecting-IP') ||
      request.headers.get('x-forwarded-for') ||
      '';

    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (clientIp) {
      formData.append('remoteip', clientIp);
    }

    const verifyResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      }
    );

    const outcome = await verifyResponse.json();

    if (outcome.success) {
      return new Response(
        JSON.stringify({ success: true, timestamp: outcome.challenge_ts }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Verificación Turnstile fallida',
          'error-codes': outcome['error-codes'] || [],
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || 'Error interno del servidor de verificación',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
