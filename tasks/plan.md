# Implementation Plan: Solución de Login Admin, Catálogo en Portada, Detalle de Producto y Seguridad Anti-Bot

## Overview
Resolver el problema de autenticación y bloqueo en `/admin` causado por el conflicto de prerenderizado y middleware en Astro 5; transformar la portada (`/`) para que el catálogo de prendas sea la primera pantalla sin hero superior; trasladar el contenido editorial a `/info`; añadir botón de retorno y diseño consistente a las páginas de producto; y blindar la aplicación contra accesos por consola DevTools y ataques de spam en pedidos mediante verificación anti-bot multicapa.

## Architecture Decisions
- **Rutas Admin Dinámicas en Servidor**: Añadir `export const prerender = false` a todas las rutas bajo `src/pages/admin/` para resolver la advertencia `Astro.request.headers` y evitar bloqueos en el dev server.
- **Middleware Stateless con Timeout**: Instanciar un cliente Supabase específico para servidor en `src/middleware/index.ts` sin persistencia de almacenamiento y con un timeout estricto de 3500ms para garantizar que nunca se quede colgada la terminal.
- **Guard de Seguridad Criptográfico (Anti-Console)**: En `AdminLayout.astro`, no confiar en la existencia de strings en cookies. Validar la sesión con `supabase.auth.getUser()` y verificar que el usuario tenga rol `ADMIN` o `SUPERADMIN` en `public.perfil`. Tokens manipulados en la consola son purgados inmediatamente.
- **Home como Catálogo Principal**: Integrar `CatalogoGrid` directamente en `src/pages/index.astro`. Retirar el `HeroPortada` antiguo. Mover manifiesto, líneas textiles y módulo de contacto a `src/pages/info.astro`.
- **Navegación Intuitiva de Producto**: En `DetalleProducto.tsx`, añadir botón `← Volver al catálogo` con `history.back()` / fallback seguro a `/` y optimizar la disposición de información técnica de la prenda.
- **Anti-Bot Multicapa para Pedidos**: Combinar Cloudflare Turnstile nativo + fallback de validación interactiva "Slide to Verify" + campo honeypot invisible (`website_url`) + rate limiting de 15s para blindar el checkout de WhatsApp contra bots de spam.

## Task List

### Phase 1: Seguridad y Corrección de Login Admin
- [ ] Task 1: Configurar rutas `/admin` dinámicas (`prerender = false`) y adaptar `astro.config.mjs`
- [ ] Task 2: Refactorizar `src/middleware/index.ts` con cliente Supabase stateless resiliente y timeout
- [ ] Task 3: Blindar `AdminLayout.astro` y `login.astro` contra bypass por consola con validación de roles en Supabase

### Checkpoint: Autenticación Admin
- [ ] Login admin funciona sin trabar la terminal
- [ ] No aparece la advertencia `Astro.request.headers`
- [ ] Intento de bypass por consola en DevTools es expulsado a `/login`

### Phase 2: Rediseño de Página Principal y Nueva Vista `/info`
- [ ] Task 4: Crear `src/pages/info.astro` con Manifiesto, Líneas, Especificaciones y Contacto
- [ ] Task 5: Rediseñar `src/pages/index.astro` para que el catálogo sea la primera pantalla sin hero
- [ ] Task 6: Actualizar enlaces en `Navbar.astro` y `BottomNavMobile.tsx`

### Checkpoint: Navegación y Portada
- [ ] Portada muestra el catálogo de prendas inmediatamente
- [ ] `/info` carga el contenido editorial completo
- [ ] Navegación móvil y desktop es fluida y coherente

### Phase 3: Detalle de Producto y Verificación Anti-Bot
- [ ] Task 7: Añadir botón "Volver atrás" y pulir diseño consistente en `DetalleProducto.tsx`
- [ ] Task 8: Implementar widget anti-bot híbrido en `TurnstileWidget.tsx` (Turnstile + Slide to verify)
- [ ] Task 9: Implementar honeypot invisible y rate limiting en `CarritoDrawer.tsx`

### Checkpoint: Finalización y Calidad
- [ ] Botón volver atrás funciona en todos los productos
- [ ] Pedidos requieren verificación humana activa
- [ ] `pnpm build` y `pnpm check` compilan con 0 errores

## Risks and Mitigations
| Riesgo | Impacto | Mitigación |
|---|---|---|
| Latencia de red o cuelgue de Supabase en middleware | Alto | Timeout de 3.5s con `Promise.race`; si expira, redirige a login sin bloquear el stream |
| Usuario sin conexión o bloqueador de anuncios bloquea Turnstile | Medio | Fallback interactivo de deslizamiento ("Slide to verify") integrado directamente en React |
| Enlaces antiguos a `/catalogo` quedan huérfanos | Bajo | Mantener `src/pages/catalogo.astro` como vista funcional o alias canónico a `/` |

## Open Questions
- ¿Deseas que la nueva página de información se llame `/info` o prefieres `/nosotros` o `/marca`? (Por defecto configurada como `/info` con redirección amigable).
