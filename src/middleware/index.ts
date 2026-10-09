import { defineMiddleware } from 'astro:middleware';
import { getServerSupabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Middleware de protección para rutas administrativas (/admin/*)
 * - Ejecución stateless y no bloqueante
 * - Timeout estricto de 3500ms para evitar cuelgues del dev server o Cloudflare Workers
 * - Limpieza de cookies corruptas y redirección limpia
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);

  // Excluir rutas no administrativas
  if (!url.pathname.startsWith('/admin')) {
    return next();
  }

  const accessToken = context.cookies.get('sb-access-token')?.value;
  const refreshToken = context.cookies.get('sb-refresh-token')?.value;

  if (!accessToken && !refreshToken) {
    return context.redirect(`/login?redirect=${encodeURIComponent(url.pathname)}`);
  }

  // Soporte de modo Demo Local
  if ((!isSupabaseConfigured || accessToken === 'demo-admin-token') && accessToken === 'demo-admin-token') {
    context.locals.user = {
      id: 'demo-admin-id',
      email: 'admin@zairenlab.com',
      user_metadata: { full_name: 'Zairen Admin' },
    };
    return next();
  }

  const serverSupabase = getServerSupabase(accessToken);

  try {
    if (accessToken) {
      // Timeout protector de 3500ms contra cuelgues de red
      const timeoutPromise = new Promise<{ data: { user: null }; error: Error }>((_, reject) => {
        setTimeout(() => reject(new Error('Supabase Auth Timeout')), 3500);
      });

      const { data: { user }, error } = await Promise.race([
        serverSupabase.auth.getUser(accessToken),
        timeoutPromise,
      ]);

      if (!error && user) {
        context.locals.user = user;
        return next();
      }

      // Si el access token expiró pero hay refresh token, intentar refresco rápido
      if (refreshToken) {
        const { data: refData, error: refError } = await Promise.race([
          serverSupabase.auth.refreshSession({ refresh_token: refreshToken }),
          timeoutPromise,
        ]);

        if (!refError && refData?.session) {
          context.cookies.set('sb-access-token', refData.session.access_token, {
            path: '/',
            maxAge: 604800,
            sameSite: 'lax',
          });
          context.cookies.set('sb-refresh-token', refData.session.refresh_token, {
            path: '/',
            maxAge: 604800,
            sameSite: 'lax',
          });
          context.locals.user = refData.session.user;
          return next();
        }
      }
    }

    // Token inválido o sesión caducada: limpiar cookies corruptas
    context.cookies.delete('sb-access-token', { path: '/' });
    context.cookies.delete('sb-refresh-token', { path: '/' });
    return context.redirect(`/login?redirect=${encodeURIComponent(url.pathname)}`);
  } catch (err) {
    // En caso de timeout o error de conexión, redirigir sin congelar el proceso
    console.warn('[Admin Middleware] Error o timeout en validación:', err);
    return context.redirect(`/login?redirect=${encodeURIComponent(url.pathname)}`);
  }
});
