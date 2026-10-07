import { defineMiddleware } from 'astro:middleware';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Middleware de protección para rutas administrativas (/admin/*)
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);

  // Proteger todas las rutas bajo /admin (excepto si estuviera en login)
  if (url.pathname.startsWith('/admin')) {
    // Verificar token en cookies o headers
    const accessToken = context.cookies.get('sb-access-token')?.value;
    const refreshToken = context.cookies.get('sb-refresh-token')?.value;

    if (!accessToken && !refreshToken) {
      // Redirigir a login si no hay sesión
      return context.redirect(`/login?redirect=${encodeURIComponent(url.pathname)}`);
    }

    // Modo Demo Local si Supabase aún no está configurado con claves en producción
    if (!isSupabaseConfigured && accessToken === 'demo-admin-token') {
      context.locals.user = {
        id: 'demo-admin-id',
        email: 'admin@zairenlab.com',
        user_metadata: { full_name: 'Zairen Admin' },
      };
      return next();
    }

    try {
      if (accessToken) {
        // Validación con getUser de Supabase (sin efectos secundarios de sesión de servidor)
        const { data: { user }, error } = await supabase.auth.getUser(accessToken);

        if (!error && user) {
          context.locals.user = user;
          return next();
        }

        // Si falló o expiró el access token pero hay refresh token, intentar refrescar
        if (refreshToken) {
          const { data: refData, error: refError } = await supabase.auth.refreshSession({
            refresh_token: refreshToken,
          });
          if (!refError && refData.session) {
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
      return context.redirect(`/login?redirect=${encodeURIComponent(url.pathname)}`);
    } catch (e) {
      return context.redirect(`/login?redirect=${encodeURIComponent(url.pathname)}`);
    }
  }

  return next();
});
