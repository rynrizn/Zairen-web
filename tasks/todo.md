# Task List: Zairen Lab // Admin Login, Home Catalog, Product Polish & Anti-Bot Security

## Task 1: Configurar rutas `/admin` dinámicas y adaptar `astro.config.mjs`
**Description:** Configurar el adaptador de Astro o modo híbrido y declarar `export const prerender = false` en las páginas administrativas para que Astro 5 no intente prerenderizarlas estáticamente ni emita advertencias de headers.

**Acceptance criteria:**
- [ ] Todas las páginas de `src/pages/admin/*.astro` tienen `export const prerender = false`
- [ ] `astro.config.mjs` maneja adecuadamente las rutas dinámicas sin errores de build
- [ ] La advertencia `[WARN] Astro.request.headers was used when rendering route` desaparece por completo

**Verification:**
- [ ] Build succeeds: `pnpm build`
- [ ] Manual check: Acceder a `/admin` y verificar en la consola que no se emite el aviso de headers

**Dependencies:** None
**Files likely touched:**
- `astro.config.mjs`
- `src/pages/admin/*.astro`
**Estimated scope:** M (3-5 files)

---

## Task 2: Refactorizar `src/middleware/index.ts` con cliente Supabase stateless resiliente y timeout
**Description:** Reescribir la validación de tokens en el middleware para usar un cliente Supabase específico de servidor sin persistencia local, con timeout de 3.5 segundos (`Promise.race`) y manejo de errores limpio que impida loops de redirección o cuelgues del proceso.

**Acceptance criteria:**
- [ ] El middleware utiliza una instancia limpia de Supabase (`persistSession: false`, `autoRefreshToken: false`)
- [ ] Las peticiones a Supabase tienen un límite de tiempo estricto que aborta tras 3500ms si la red cuelga
- [ ] Si el token no es válido o está expirado, redirige a `/login` sin congelar el servidor dev

**Verification:**
- [ ] Manual check: Probar petición con token inexistente y verificar respuesta 302 instantánea (<100ms)
- [ ] Terminal check: La terminal no se queda trabada

**Dependencies:** Task 1
**Files likely touched:**
- `src/middleware/index.ts`
- `src/lib/supabase.ts`
**Estimated scope:** S (1-2 files)

---

## Task 3: Blindar `AdminLayout.astro` y `login.astro` contra bypass por consola y validar roles
**Description:** Eliminar la validación client-side vulnerable de cookies en `AdminLayout.astro`. Reemplazarla por una verificación criptográfica con `supabase.auth.getUser()` y consulta a la tabla `perfil` para certificar que el usuario posee rol `ADMIN` o `SUPERADMIN`. Ocultar el contenido con un skeleton de carga de seguridad mientras se verifica.

**Acceptance criteria:**
- [ ] Modificar una cookie en la consola de DevTools (`sb-access-token=xyz`) NO permite acceder al panel
- [ ] Si la sesión no es válida en Supabase, se borran las cookies y se redirige a `/login`
- [ ] El panel sólo se renderiza cuando el usuario está verificado con rol activo en la base de datos

**Verification:**
- [ ] Manual check: Inyectar `document.cookie = 'sb-access-token=fake'` en consola y refrescar `/admin`; comprobar que es expulsado a `/login`
- [ ] Manual check: Iniciar sesión con credenciales válidas y comprobar que entra al panel en < 1 segundo

**Dependencies:** Task 2
**Files likely touched:**
- `src/layouts/AdminLayout.astro`
- `src/pages/login.astro`
**Estimated scope:** S (2 files)

---

## Checkpoint: Autenticación Admin
- [ ] Todas las pruebas de login funcionan
- [ ] No hay cuelgues de terminal
- [ ] Intento de hack por consola es bloqueado

---

## Task 4: Crear `src/pages/info.astro` para Manifiesto, Líneas, Especificaciones y Contacto
**Description:** Crear una nueva página dedicada `/info` que aloje el contenido de marca, el manifiesto editorial de taller (`BrandManifestoGrid`), las 3 líneas de confección, las especificaciones textiles (280-420 GSM) y el módulo de contacto por WhatsApp.

**Acceptance criteria:**
- [ ] Ruta `/info` accesible y completamente estilizada con los componentes de diseño de Zairen Lab
- [ ] Incluye `BrandManifestoGrid`, sección de líneas textiles, blueprint de taller y `WhatsAppContactModule`
- [ ] Metadatos SEO y diseño responsivo adaptado

**Verification:**
- [ ] Manual check: Abrir `http://localhost:4321/info` y verificar renderizado perfecto

**Dependencies:** None
**Files likely touched:**
- `src/pages/info.astro`
**Estimated scope:** S (1 file)

---

## Task 5: Rediseñar `src/pages/index.astro` para que el catálogo sea la primera pantalla sin hero
**Description:** Transformar la página principal (`src/pages/index.astro`) para que el catálogo de prendas sea la primera pantalla que ve el usuario al ingresar. Eliminar el `HeroPortada` y bloques secundarios redundantes.

**Acceptance criteria:**
- [ ] Al entrar a `/`, la primera pantalla muestra el catálogo (`CatalogoGrid`) con sus filtros y productos
- [ ] El hero anterior y su bloque superior ya no están presentes
- [ ] Se mantienen el Navbar, CarritoDrawer y Footer globales
- [ ] Carga productos reales de Supabase con respaldo mock rápido

**Verification:**
- [ ] Manual check: Visitar `/` y confirmar que el catálogo es lo primero que se ve de inmediato

**Dependencies:** Task 4
**Files likely touched:**
- `src/pages/index.astro`
- `src/pages/catalogo.astro`
**Estimated scope:** S (2 files)

---

## Task 6: Actualizar enlaces en `Navbar.astro` y `BottomNavMobile.tsx`
**Description:** Adaptar los menús de navegación para reflejar la nueva arquitectura del sitio: "Catálogo" apunta a `/`, se añade "Info & Taller" apuntando a `/info`, y se optimizan los enlaces de navegación móvil.

**Acceptance criteria:**
- [ ] `Navbar.astro` enlaza "Catálogo / Tienda" a `/` e "Info / Manifiesto" a `/info`
- [ ] `BottomNavMobile.tsx` tiene enlaces coherentes y sin rutas rotas
- [ ] Estado activo visual resalta la página actual correctamente

**Verification:**
- [ ] Manual check: Probar clics de navegación en desktop y móvil

**Dependencies:** Task 5
**Files likely touched:**
- `src/components/common/Navbar.astro`
- `src/components/common/BottomNavMobile.tsx`
**Estimated scope:** S (2 files)

---

## Checkpoint: Navegación y Portada
- [ ] Catálogo es la pantalla de inicio
- [ ] Información de la marca está en `/info`
- [ ] Navegación limpia y responsiva

---

## Task 7: Añadir botón "Volver atrás" y pulir diseño en `DetalleProducto.tsx`
**Description:** Mejorar la vista de producto individual (`src/pages/producto/[id].astro` y `DetalleProducto.tsx`) agregando un botón interactivo "← Volver al catálogo", armonizando los paddings, badges de stock y fichas técnicas de la prenda para un look profesional consistente.

**Acceptance criteria:**
- [ ] Botón claro "← Volver al catálogo" visible en la parte superior del detalle de producto
- [ ] Soporte para acción de retroceso inteligente en navegador con fallback a `/`
- [ ] Ficha técnica legible (algodón 280 GSM, corte boxy, guía de tallas)
- [ ] Consistencia de diseño con la paleta Tokyo/Crimson

**Verification:**
- [ ] Manual check: Entrar a un producto, hacer clic en "Volver al catálogo" y verificar que regresa a la tienda
- [ ] Manual check: Probar en móvil y verificar que los elementos se ven ordenados y atractivos

**Dependencies:** None
**Files likely touched:**
- `src/components/catalogo/DetalleProducto.tsx`
- `src/styles/detail-bento.css`
**Estimated scope:** M (2 files)

---

## Task 8: Implementar widget anti-bot híbrido en `TurnstileWidget.tsx`
**Description:** Implementar verificación humana real contra bots de spam. Si existe clave de Cloudflare Turnstile, cargar el widget oficial; si no está disponible o es bloqueado por un adblocker, ofrecer un desafío interactivo "Desliza para verificar que eres humano" que requiere interacción física antes de desbloquear el pedido.

**Acceptance criteria:**
- [ ] Turnstile oficial se ejecuta si `PUBLIC_TURNSTILE_SITE_KEY` está presente
- [ ] Desafío interactivo de deslizamiento ("Slide to verify") funciona de forma accesible y fluida como fallback
- [ ] El widget emite el token de validación únicamente tras interacción humana genuina

**Verification:**
- [ ] Manual check: Probar el widget en el drawer y verificar que no se auto-valida falsamente

**Dependencies:** None
**Files likely touched:**
- `src/components/common/TurnstileWidget.tsx`
**Estimated scope:** S (1 file)

---

## Task 9: Implementar honeypot invisible y rate limiting en `CarritoDrawer.tsx`
**Description:** Blindar el flujo de checkout en `CarritoDrawer.tsx` agregando un campo trampa honeypot invisible para bots (`website_url`), control de cooldown de 15 segundos entre pedidos para evitar spam de WhatsApp/DB, y bloqueo del botón hasta completar la verificación humana.

**Acceptance criteria:**
- [ ] Botón de checkout está deshabilitado hasta que `turnstileVerified` sea verdadero
- [ ] Campo honeypot oculto para humanos pero visible para bots; si se llena, se descarta el pedido
- [ ] Rate limit previene múltiples envíos sucesivos de pedidos accidentales o automáticos

**Verification:**
- [ ] Manual check: Intentar finalizar pedido sin verificar -> botón bloqueado; tras verificar -> abre WhatsApp con el pedido correctamente formateado
- [ ] Build check: `pnpm check` y `pnpm build` sin errores

**Dependencies:** Task 8
**Files likely touched:**
- `src/components/catalogo/CarritoDrawer.tsx`
**Estimated scope:** S (1 file)

---

## Checkpoint: Finalización y Calidad
- [ ] Todos los criterios de aceptación cumplidos
- [ ] `pnpm build` compila con éxito en 0 errores
- [ ] Verificación manual completada
