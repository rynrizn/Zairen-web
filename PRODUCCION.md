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

### ✅ Fase 7: Corrección Visual del Modo Claro en Admin (Skill Impeccable)
- **Corrección de iconos**: Resuelto el fallo donde aparecían ambos iconos (`dark_mode` y `light_mode`) simultáneamente en `AdminLayout.astro`. Ahora solo es visible el icono que permite alternar al modo opuesto.
- **Contraste y Legibilidad en Modo Claro**:
  - Corrección del selector `.text-white` en `src/styles/global.css`: Se preserva el color blanco puro en botones carmesí (`#dc143c`), insignias de estado y alertas, evitando textos oscuros sobre fondo rojo.
  - Mapeo de superficies para modo claro: fondos tipo papel japonés washi (`#F6F4EE`, `#FFFFFF`, `#F7F5F0`), bordes sutiles (`#E2DDD3`), tipografía color grafito (`#0A0A0B`) y gris cálido (`#5C5852`).
  - Formularios, tablas e inputs optimizados con bordes y enfoques carmesí de alta legibilidad.

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
