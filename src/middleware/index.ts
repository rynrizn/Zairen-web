import { defineMiddleware } from 'astro:middleware';
import { supabase } from '../lib/supabase';

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

    try {
      // Si hay tokens, verificar con Supabase
      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error || !data.session) {
          return context.redirect(`/login?redirect=${encodeURIComponent(url.pathname)}`);
        }

        // Inyectar usuario en locals para consumo en páginas Astro
        context.locals.user = data.session.user;
      }
    } catch (e) {
      return context.redirect('/login');
    }
  }

  return next();
});
