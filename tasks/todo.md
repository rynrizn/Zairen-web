# Task List: Zairen Lab // Estética Ortogonal, Moneda Unificada, Ajustes Admin y Navegación

## Phase 1: Estética Ortogonal Global, Modales y Detalle de Producto

### Task 1.1: Limpieza y ortogonalidad en `AdminSidebar.tsx`
**Description:** Eliminar la duplicación de "Usuarios y Roles" en `navItems` para Superadmin. Cambiar todos los bordes redondeados a esquinas rectas (`rounded-none`).
**Acceptance criteria:**
- [x] No aparece duplicado "Usuarios y Roles" en el sidebar.
- [x] Todos los botones, iconos contenedores y estados activos usan `rounded-none`.
**Verification:**
- [x] Build succeeds: `pnpm build`
- [x] Manual check: Verificar en `/admin` que el sidebar muestra cada ítem una sola vez y con esquinas rectas.
**Dependencies:** None
**Files likely touched:** `src/components/admin/layout/AdminSidebar.tsx`
**Estimated scope:** S (1 file)

### Task 1.2: Modal flotante para productos y tabla de inventario a pantalla completa en `InventarioManager.tsx`
**Description:** En lugar de dividir la pantalla y achicar la tabla a 5 columnas, `InventarioManager` muestra la tabla a pantalla completa (12 columnas) con tipografía aumentada (`text-sm` y `text-base` en desktop) y esquinas rectas (`rounded-none`). El formulario de añadir/editar prenda se abre en un modal flotante centrado con backdrop.
**Acceptance criteria:**
- [x] La tabla de inventario ocupa todo el ancho y no se comprime al abrir el editor.
- [x] El tamaño de fuente en la tabla de inventario en escritorio es más grande y nítido.
- [x] Al pulsar "+ AGREGAR PRENDA" o editar un ítem se despliega un modal flotante centrado.
- [x] Todas las tarjetas, botones y badges usan `rounded-none`.
**Verification:**
- [x] Manual check: Abrir `/admin/inventario`, verificar ancho completo y probar abrir el modal flotante.
**Dependencies:** Task 1.1
**Files likely touched:**
- `src/components/admin/inventario/InventarioManager.tsx`
- `src/components/admin/inventario/ProductoEditor.tsx`
**Estimated scope:** M (2 files)

### Task 1.3: Ortogonalidad en módulos admin restantes
**Description:** Actualizar `POSTerminal.tsx`, `PedidosTable.tsx`, `ClientesTable.tsx` y `UsuariosManager.tsx` para eliminar `rounded-xl`, `rounded-2xl` y `rounded-full`, unificando a `rounded-none`.
**Acceptance criteria:**
- [x] Todas las tablas, inputs, tarjetas y botones en módulos administrativos tienen esquinas rectas.
**Verification:**
- [x] Manual check: Navegar por `/admin/ventas`, `/admin/pedidos`, `/admin/clientes` y `/admin/usuarios`.
**Dependencies:** Task 1.2
**Files likely touched:**
- `src/components/admin/pos/POSTerminal.tsx`
- `src/components/admin/pedidos/PedidosTable.tsx`
- `src/components/admin/clientes/ClientesTable.tsx`
- `src/components/admin/usuarios/UsuariosManager.tsx`
**Estimated scope:** M (4 files)

### Task 1.4: Header del catálogo con logo SVG y filtros ortogonales en `CatalogoGrid.tsx`
**Description:** Remover el párrafo de texto redundante en el encabezado del catálogo. En su lugar, colocar el logotipo oficial SVG con sutil gradiente sin caja contenedora. Reemplazar los chips `rounded-full` de colección y estado por botones rectangulares ortogonales `rounded-none`.
**Acceptance criteria:**
- [x] Se elimina el texto "Cortes oversized diseñados...".
- [x] Se muestra el logo SVG limpio y sin marco cuadrado.
- [x] Todos los filtros de colección, estado, buscador y select de orden tienen `rounded-none`.
**Verification:**
- [x] Manual check: Verificar la portada `/` y comprobar el encabezado y los filtros.
**Dependencies:** None
**Files likely touched:** `src/components/catalogo/CatalogoGrid.tsx`
**Estimated scope:** S (1 file)

### Task 1.5: Esquinas en punta en la vista de producto y `detail-bento.css`
**Description:** Actualizar `detail-bento.css` y `DetalleProducto.tsx` para que todas las celdas del bento grid, botones de tallas, badges, miniaturas y modales tengan `border-radius: 0px` (`rounded-none`).
**Acceptance criteria:**
- [x] Celdas bento, badge de estado, botones de tallas y botones de WhatsApp/bolsa tienen esquinas rectas.
- [x] Lightbox y modal de compartir producto tienen esquinas rectas.
**Verification:**
- [x] Manual check: Abrir `/producto/samurai-mecha-kanji-oversized-tee` y verificar esquinas ortogonales.
**Dependencies:** None
**Files likely touched:**
- `src/styles/detail-bento.css`
- `src/components/catalogo/DetalleProducto.tsx`
**Estimated scope:** S (2 files)

### Task 1.6: Marco del QR y modal ortogonal en `ShareWebModal.tsx`
**Description:** Corregir el marco del código QR y el modal exterior en `ShareWebModal.tsx` para que tenga esquinas rectas `rounded-none` con estética técnica Zairen Lab.
**Acceptance criteria:**
- [x] Marco del código QR tiene esquinas rectas sin bordes redondeados.
- [x] El contenedor del modal tiene `rounded-none`.
**Verification:**
- [x] Manual check: Abrir modal de compartir QR en la web y verificar puntas rectas.
**Dependencies:** None
**Files likely touched:** `src/components/common/ShareWebModal.tsx`
**Estimated scope:** XS (1 file)

## Checkpoint 1: Estética Ortogonal y Modales
- [x] Todas las esquinas redondeadas han sido reemplazadas por esquinas rectas (`rounded-none`).
- [x] `InventarioManager` no se achica al editar prendas (modal flotante funcional).
- [x] Encabezado del catálogo muestra el logo SVG sin texto redundante.

---

## Phase 2: Autenticación, Visibilidad de Contraseña y Soporte Modo Claro

### Task 2.1: Campo de contraseña y selector de visibilidad (ojito) en `UsuariosManager.tsx`
**Description:** Añadir campo de contraseña en el modal de usuario (creación/edición) con botón interactivo con icono de ojo para ver/ocultar la contraseña.
**Acceptance criteria:**
- [x] El formulario de usuario incluye campo de contraseña.
- [x] Botón de ojo alterna entre ver y ocultar contraseña (`password` vs `text`).
**Verification:**
- [x] Manual check: Crear/editar usuario en `/admin/usuarios` y probar el botón de visibilidad.
**Dependencies:** Task 1.3
**Files likely touched:** `src/components/admin/usuarios/UsuariosManager.tsx`
**Estimated scope:** S (1 file)

### Task 2.2: Visibilidad de contraseña (ojito), diseño ortogonal y contraste en `login.astro`
**Description:** Añadir botón de ojo para ver/ocultar la contraseña en `login.astro`. Cambiar la tarjeta y los inputs a `rounded-none`. Corregir el contraste en modo claro (`html.light`) para que textos, fondo e inputs sean perfectamente legibles.
**Acceptance criteria:**
- [x] El input de contraseña en login tiene botón de ojito funcional.
- [x] En modo claro, la tarjeta de login, textos y placeholders tienen alto contraste.
- [x] Esquinas rectas `rounded-none`.
**Verification:**
- [x] Manual check: Probar login en modo oscuro y claro, alternando visibilidad de contraseña.
**Dependencies:** None
**Files likely touched:**
- `src/pages/login.astro`
- `src/styles/global.css`
**Estimated scope:** S (2 files)

## Checkpoint 2: Autenticación y Contraste
- [x] En login y en gestión de usuarios se puede ver y ocultar la contraseña con el botón de ojo.
- [x] Modo claro en login es completamente legible y de alto contraste.

---

## Phase 3: Navegación del Cliente, Menú Móvil Hamburger y Rediseño del Footer

### Task 3.1: Simplificación de `Navbar.astro` y soporte modo claro
**Description:** Remover el enlace "Marca & Drops" y el botón redundante de WhatsApp de la barra superior. Dejar enlaces a "Catálogo" y "Contacto". Pulir la apariencia en modo claro para que la navbar use fondo y bordes claros elegantes.
**Acceptance criteria:**
- [x] No aparece enlace "Marca & Drops" en la navbar.
- [x] No aparece botón de WhatsApp en la navbar.
- [x] Modo claro muestra fondo blanco/marfil translúcido con bordes y tipografía oscuros de alto contraste.
**Verification:**
- [x] Manual check: Probar navbar en escritorio tanto en modo oscuro como en modo claro.
**Dependencies:** None
**Files likely touched:** `src/components/common/Navbar.astro`
**Estimated scope:** S (1 file)

### Task 3.2: Menú superior móvil con 3 barras horizontales (hamburguesa)
**Description:** Retirar la barra inferior flotante `BottomNavMobile.tsx`. En la navbar móvil, incluir botón superior con 3 líneas horizontales que despliega el menú de navegación del cliente.
**Acceptance criteria:**
- [x] La navegación móvil reside en la barra superior con botón de 3 líneas horizontales.
- [x] Al presionar el botón se despliega el menú móvil con accesos a Catálogo, Contacto, Compartir QR y Cambio de Tema.
- [x] Se retira la barra inferior redundante en móviles.
**Verification:**
- [x] Manual check: Probar en viewport móvil (iPhone/Android responsive) y abrir menú hamburguesa.
**Dependencies:** Task 3.1
**Files likely touched:**
- `src/components/common/Navbar.astro`
- `src/components/common/BottomNavMobile.tsx`
**Estimated scope:** S (2 files)

### Task 3.3: Rediseño del Footer: redes sociales con iconos y acceso admin discreto en `Footer.astro`
**Description:** En la sección "ÚNETE AL ARCHIVO // SEÑALES DE DROP", retirar el formulario de suscripción por correo y colocar las redes sociales oficiales de la marca (TikTok, Instagram, WhatsApp, etc.) con sus iconos SVG y nombres legibles. Retirar la columna visible de "SISTEMA" al lado de canales y mover el enlace de acceso a admin a un discreto enlace `// SYS` en el copyright.
**Acceptance criteria:**
- [x] No hay formulario de email en el footer; en su lugar están las redes con icono y nombre.
- [x] No hay columna expuesta de admin al lado de canales.
- [x] Enlace discreto a `/login` al final de la página.
**Verification:**
- [x] Manual check: Inspeccionar el footer y verificar redes sociales y enlace discreto de admin.
**Dependencies:** None
**Files likely touched:** `src/components/common/Footer.astro`
**Estimated scope:** S (1 file)

## Checkpoint 3: Navegación y Footer
- [x] Menú móvil opera desde la barra superior con 3 barras horizontales.
- [x] Footer limpio con redes sociales sin formulario de correo.
- [x] Acceso a admin no está expuesto en columnas públicas.

---

## Phase 4: Configuración de Envíos, Sucursales y Selector de Moneda Unificada

### Task 4.1: Configuración de envío y desactivación limpia de envío gratis
**Description:** En `ConfiguracionWeb.tsx`, añadir controles para costo de envío y un interruptor On/Off para la promoción de envío gratis. En `CarritoDrawer.tsx`, si la promoción está desactivada, no mostrar ninguna barra de progreso ni mensaje de envío gratis.
**Acceptance criteria:**
- [x] El admin puede editar el costo base de envío y activar/desactivar la promoción de envío gratis.
- [x] El carrito de compras no muestra referencias a envío gratis cuando está desactivado.
**Verification:**
- [x] Manual check: Desactivar envío gratis en `/admin/interfaz-web` y abrir el carrito para confirmar que no aparece la barra.
**Dependencies:** None
**Files likely touched:**
- `src/components/admin/settings/ConfiguracionWeb.tsx`
- `src/components/catalogo/CarritoDrawer.tsx`
**Estimated scope:** S (2 files)

### Task 4.2: Gestión de sucursales en `ConfiguracionWeb.tsx`
**Description:** Añadir sección para gestionar sucursales: ver sucursales existentes (por defecto 1 central activa) y formulario/modal para registrar nuevas sucursales con persistencia.
**Acceptance criteria:**
- [x] Muestra listado de sucursales con estado activo.
- [x] Botón para registrar nueva sucursal con campos: Nombre, Ciudad/Ubicación, Teléfono.
**Verification:**
- [x] Manual check: Añadir una nueva sucursal en configuración y verificar que se guarda en la lista.
**Dependencies:** Task 4.1
**Files likely touched:** `src/components/admin/settings/ConfiguracionWeb.tsx`
**Estimated scope:** S (1 file)

### Task 4.3: Selector de moneda unificada (`BOB` vs `USD`) con tasa manual
**Description:** En `ConfiguracionWeb.tsx`, añadir selector de moneda (`BOB` o `USD`) y entrada manual de tipo de cambio (`1 USD = X BOB`). Actualizar `src/config/site.ts` para que `formatCurrency` convierta automáticamente todos los precios de la tienda a la moneda seleccionada de manera unificada.
**Acceptance criteria:**
- [x] El admin puede alternar la moneda de la tienda entre Bs y USD, ingresando el valor del dólar en Bs.
- [x] Todos los productos en catálogo, detalle, carrito y checkout muestran los precios en la moneda seleccionada de forma homogénea.
**Verification:**
- [x] Manual check: Cambiar la moneda a USD con tasa 6.96; verificar que un producto de Bs 140 pasa a mostrarse como `$ 20.11 USD` en catálogo, ficha y carrito.
**Dependencies:** Task 4.1
**Files likely touched:**
- `src/components/admin/settings/ConfiguracionWeb.tsx`
- `src/config/site.ts`
- `src/stores/cartStore.ts`
**Estimated scope:** M (3 files)

## Checkpoint 4: Negocio y Moneda Unificada
- [x] Control de envío y envío gratis sincronizado con el carrito.
- [x] Gestión de sucursales funcional.
- [x] Moneda unificada en toda la tienda (BOB o USD) con tipo de cambio manual.

---

## Phase 5: Verificación, Guía Cloudflare Pages y Git Workflow

### Task 5.1: Verificación de compilación completa
**Description:** Ejecutar `pnpm build` para asegurar 0 errores de build tanto en páginas prerenderizadas como en rutas dinámicas de Cloudflare.
**Acceptance criteria:**
- [x] `pnpm build` finaliza con código 0.
**Verification:**
- [x] Build output: Complete!
**Dependencies:** All previous tasks
**Estimated scope:** S (0 code files)

### Task 5.2: Actualización de Graphify
**Description:** Ejecutar `graphify update .` conforme a la regla del proyecto para mantener el grafo AST sincronizado.
**Acceptance criteria:**
- [x] Grafo actualizado en `graphify-out`.
**Verification:**
- [x] `graphify update .` exit code 0.
**Dependencies:** Task 5.1
**Estimated scope:** S (0 code files)

### Task 5.3: Commits atómicos y Git Push
**Description:** Crear commits semánticos por cada fase (`feat(design): ...`, `feat(auth): ...`, `feat(nav): ...`, `feat(currency): ...`) y subirlos a `origin main`.
**Acceptance criteria:**
- [x] Commits limpios en `main`.
- [x] `git push origin main` exitoso.
**Dependencies:** Task 5.2
**Estimated scope:** S (0 code files)

### Task 5.4: Documentación de Variables de Entorno y Despliegue en Cloudflare Pages
**Description:** Redactar la guía detallada con todas las variables de entorno necesarias y los pasos exactos para conectar el repositorio de GitHub con Cloudflare Pages.
**Acceptance criteria:**
- [x] Lista exhaustiva de variables de entorno con descripciones claras.
- [x] Pasos numerados paso a paso para desplegar en Cloudflare Pages.
**Dependencies:** Task 5.3
**Estimated scope:** S (Documentación)
