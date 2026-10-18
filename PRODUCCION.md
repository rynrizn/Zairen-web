# ⛩️ ZAIREN LAB // ESTADO DE PRODUCCIÓN Y DESPLIEGUE

Documento de entrega y especificación técnica de las modificaciones realizadas en la rama `feature/produccion-real-v1` para la puesta en producción en Cloudflare Pages (`zairenlab.pages.dev`).

---

## 1. Resumen de lo que se hizo

### ✅ Fase 1: Cloudflare Turnstile Real (Anti-Bot Server-Side)
- **Endpoint Backend**: Creado endpoint SSR en `src/pages/api/verify-turnstile.ts` que valida el token criptográfico directamente contra los servidores de Cloudflare (`https://challenges.cloudflare.com/turnstile/v0/siteverify`).
- **TurnstileWidget**: Widget real en `src/components/common/TurnstileWidget.tsx` que ejecuta el desafío Cloudflare Turnstile y valida el resultado con el servidor. Se eliminaron por completo el slider falso y las simulaciones de prueba.
- **Carrito de Compras**: `src/components/catalogo/CarritoDrawer.tsx` requiere verificación Turnstile válida antes de habilitar el botón de checkout hacia WhatsApp.
- **Login Administrativo**: `src/pages/login.astro` integra el widget Turnstile. El botón de acceso permanece deshabilitado hasta que Cloudflare aprueba la interacción. Se eliminaron las credenciales demo en texto plano.

### ✅ Fase 2: Migración de Logos y Assets a Cloudinary CDN
- **Logo Oficial (.webp)**: `https://res.cloudinary.com/ds4qnoypm/image/upload/v1791690155/zairen_logo_oficial_nehjev.webp`
- **Logotipo Horizontal (.svg)**: `https://res.cloudinary.com/ds4qnoypm/image/upload/v1791689848/zairen_logotipo_horizontal_nrfkp8.svg`
- Actualizadas todas las referencias en:
  - `src/components/common/Navbar.astro`
  - `src/components/common/Footer.astro`
  - `src/components/common/SplashLoader.astro`
  - `src/components/admin/layout/AdminSidebar.tsx` (4 ocurrencias)
  - `src/components/catalogo/CatalogoGrid.tsx`
  - `src/components/home/HeroPortada.astro`
  - `src/layouts/Layout.astro` (apple-touch-icon)
  - `src/pages/marca.astro`

### ✅ Fase 3: Carrito — Guardado silencioso sin auto-apertura
- En `src/stores/cartStore.ts`, se eliminó la instrucción `$isDrawerOpen.set(true)` dentro de `addItem()`.
- Al agregar una prenda desde el catálogo, el producto se guarda en el carrito y se actualiza el contador visual en el Navbar sin interrumpir la navegación del usuario.

### ✅ Fase 4: Splash Loader — Solo isotipo
- En `src/components/common/SplashLoader.astro`, se removieron los textos de marca y subtítulos.
- Ahora muestra únicamente el isotipo oficial animado alojado en Cloudinary con barra de progreso minimalista.

### ✅ Fase 5: Persistencia de Ajustes Web en Supabase
- Conexión completa de `src/components/admin/settings/ConfiguracionWeb.tsx` con la tabla `public.configuracion` en Supabase (registro singleton `id = 1`).
- Eliminado el botón duplicado de guardar al final de la página (permanece únicamente el botón superior).
- Sincronización client-side y SSR en `src/components/common/Footer.astro` para ocultar o mostrar dinámicamente las redes sociales según la base de datos (por ejemplo, si se desactiva X, se oculta inmediatamente en la tienda web).
- Módulo `src/lib/configuracion.ts` para caché y lectura centralizada de configuraciones.

### ✅ Fase 6: Catálogo 100% Conectado a Supabase (Eliminación de Mocks)
- Eliminado archivo `src/data/mockProducts.ts`.
- `src/pages/index.astro`: Carga productos reales desde la vista `vw_catalogo_publico` y colecciones activas desde `public.coleccion`. Si no hay productos, renderiza el catálogo limpio esperando la primera carga.
- `src/pages/producto/[id].astro`: Configurado con SSR (`export const prerender = false;`) para consultar en tiempo real cualquier producto por su ID o Slug.
- `src/components/admin/inventario/InventarioManager.tsx`: Conectado a Supabase para listar productos reales y colecciones dinámicas. Muestra estado vacío elegante cuando la tienda no tiene prendas aún.
- `src/components/admin/inventario/ProductoEditor.tsx`: Al guardar una prenda, persiste directamente en Supabase:
  1. Registra o asocia la colección en `public.coleccion`.
  2. Inserta o actualiza el producto en `public.producto`.
  3. Guarda las fotos en `public.imagen` (marcando la portada).
  4. Guarda las tallas en `public.atributo_producto`.
  5. Asigna el stock físico en `public.inventario` (almacén CENTRAL).
  6. Permite eliminar prendas existentes de la base de datos.

### ✅ Fase 7: Corrección Visual Integral del Modo Claro (Catálogo Público & Panel Admin)
- **Eliminación del Conflicto de Selección Global**: Se descubrió que la clase `selection:bg-[#dc143c]` en el `<body>` causaba que selectores de atributo como `[class*="bg-[#dc143c]"] *` coincidieran con el cuerpo entero del documento, forzando texto blanco sobre fondos blancos en modo claro. Se desacopló la selección nativa a CSS (`::selection`) y se eliminaron los selectores de subcadena.
- **Contraste y Legibilidad Impeccable (Catálogo y Admin)**:
  - Textos principales (`text-white`, `text-[#FAF9F6]`, `text-[#e5e2e1]`) mapeados a grafito sumi-iro (`#0A0A0B`).
  - Textos secundarios y metadatos (`text-[#8F8F8C]`, `text-[#ac8888]`) mapeados a gris piedra cálido (`#5C5852`, contraste WCAG AA > 4.5:1).
  - Textos destacados en rosa pálido (`text-[#ffb3b3]`, `text-[#e6bdbc]`) adaptados a carmesí nítido (`#dc143c`) en modo claro.
  - Botones y badges coloreados (`bg-[#dc143c]`, `bg-[#ff2d55]`, `bg-[#047857]`, etc.) preservan texto blanco puro (`#FFFFFF !important`).
  - Botones interactivos con hover (`hover:text-white`) en contenedores claros preservan legibilidad oscura en lugar de volverse invisibles.
  - Insignias de estado en tablas y dashboards (Pendiente, Confirmado, Entregado, Cancelado) optimizadas con fondos pastel suaves y tipografía contrastante de alta legibilidad.
- **Logotipo de Cabecera del Catálogo Entero & Sin Cortes**:
  - En `src/components/catalogo/CatalogoGrid.tsx`, se retiró el `overflow-hidden` restrictivo del encabezado y se ajustaron las proporciones del isotipo watermark oficial (`h-28 w-28 md:h-36 md:w-36` con `object-contain` y `p-1`).
  - Ahora el logo se aprecia de forma 100% íntegra, mostrando perfectamente las puntas superior e inferior sin ningún tipo de recorte.
- **Auditoría de Restricciones (CONSTRAINTS.md)**:
  - Eliminación definitiva de menciones residuales de términos restringidos en archivos legados (`StatementMarquee.astro`, `HeroPortada.astro` y array de cobertura en `ConfiguracionWeb.tsx`).


### ✅ Fase 8: Limpieza de Imágenes Locales
- Eliminadas las carpetas `public/brand/` y `public/editorial/`.
- Eliminado `public/favicon.svg`.
- El **único archivo estático** preservado en `public/` es `favicon.ico`. Todas las demás imágenes operan vía Cloudinary CDN y Supabase.

---

## 2. Variables de Entorno para Cloudflare Pages

Debes agregar las siguientes variables en el panel de **Cloudflare Pages** (`Settings` → `Environment variables` → `Production`):

| Variable | Valor | Tipo |
|---|---|---|
| `PUBLIC_TURNSTILE_SITE_KEY` | `0x4AAAAAAFTjTa89HLCIKoL8` | Text (Plain) |
| `CLOUDFLARE_TURNSTILE_SECRET_KEY` | `0x4AAAAAAFTjTWCuvZjnjse0P6u8J_3x900` | Encrypted |
| `PUBLIC_SUPABASE_URL` | `https://lczfqmjadkwuuuppcwdi.supabase.co` | Text (Plain) |
| `PUBLIC_SUPABASE_ANON_KEY` | *(Tu Supabase anon/public key)* | Text (Plain) |
| `SUPABASE_SERVICE_ROLE_KEY` | *(Tu Supabase service_role key - opcional para scripts)* | Encrypted |
| `PUBLIC_CLOUDINARY_CLOUD_NAME` | `ds4qnoypm` | Text (Plain) |
| `PUBLIC_CLOUDINARY_UPLOAD_PRESET` | `zairen_uploads` | Text (Plain) |

---

## 3. ¿Qué falta por hacer? (Próximos pasos del usuario)

1. **Ingresar al Admin y registrar la primera prenda**:
   - Ir a `/login` desde el footer o navegador.
   - Completar el desafío Turnstile e ingresar con tu correo y contraseña registrados en Supabase Auth.
   - Ir a la pestaña **Inventario** (`/admin/inventario`).
   - Hacer clic en **+ AGREGAR PRENDA**.
   - Colocar el nombre, precio, tallas, seleccionar o escribir una nueva colección, y pegar o subir la URL de la imagen (vía Cloudinary).
   - Guardar: Se creará automáticamente en Supabase y aparecerá de inmediato en el catálogo público `/`.

2. **Ajustar redes sociales y envíos**:
   - Ir a `/admin/interfaz-web`.
   - Modificar las URLs de Instagram, TikTok, WhatsApp y activar/desactivar las deseadas.
   - Guardar configuración: Se persistirá en la tabla `configuracion` de Supabase.

3. **Fusión a Producción (Pull Request)**:
   - Todo el trabajo está en la rama `feature/produccion-real-v1`.
   - Realizar la unión o Pull Request hacia `main` cuando se desee desplegar automáticamente en `zairenlab.pages.dev`.
