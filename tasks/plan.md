# Implementation Plan: Estética Ortogonal Zairen Lab, Moneda Dinámica, Mejoras Admin y Rediseño de Navegación

## Overview
Implementar la segunda fase de modernización y consistencia para Zairen Lab:
1. Unificación estética estricta hacia esquinas rectas y diseño ortogonal/brutalista-zen (`rounded-none`, 0px border-radius) en todo el sistema (Admin, Catálogo, Producto, Modales y QR).
2. Optimización de la experiencia del catálogo: reemplazo de texto redundante por el logotipo SVG oficial con gradiente en el encabezado.
3. Seguridad y control en credenciales: campo de contraseña con selector interactivo de visibilidad (ojito) en `UsuariosManager` y `login.astro`.
4. Navegación y Footer: menú móvil superior de 3 líneas horizontales (hamburguesa) sin barra inferior; retiro de enlaces redundantes ("Marca & Drops" y botón WhatsApp en navbar); reemplazo del formulario de newsletter por redes sociales oficiales con icono y nombre; y discreción total del enlace de acceso administrativo en el footer.
5. Calidad visual en modos Claro y Oscuro en login, navbar y componentes globales.
6. Configuraciones de negocio en Admin:
   - Control de costo de envío y activación/desactivación explícita de la promoción de envío gratis.
   - Modal flotante para creación/edición de productos en inventario (dejando la tabla en pantalla completa con tipografía ampliada).
   - Eliminación del ítem duplicado "Usuarios y Roles" en el sidebar para Superadmin.
   - Gestión de múltiples sucursales.
   - Sistema de moneda unificada (`BOB` vs `USD` con tipo de cambio manual configurable) aplicado uniformemente a todos los productos.
7. Guía completa de variables de entorno y despliegue en Cloudflare Pages desde GitHub.

## Architecture Decisions
- **Estética Ortogonal Global (Design Token Sharp)**: Reemplazar clases `rounded-*` por `rounded-none` en componentes de catálogo, modales, drawers, cards de administración e inputs. En `detail-bento.css`, forzar `border-radius: 0px` en todas las celdas, miniaturas, badges y selectores.
- **Modal Flotante de Producto (Portal UI)**: `ProductoEditor.tsx` se renderiza como un modal flotante con backdrop oscuro, liberando a `InventarioManager.tsx` para mostrar la tabla de productos a 12 columnas completas con tipografía legible en escritorio.
- **Sistema de Moneda Unificada**: Configuración reactiva en `site.ts` y persistida en `localStorage` (`zairen_currency_config`). Si el admin elige `USD`, `formatCurrency(monto)` calcula `(monto / tasa)` y muestra `$ XX.XX USD`. Si elige `BOB`, muestra `Bs XX.XX`. Garantiza que todos los productos se visualicen en una sola moneda uniforme.
- **Navegación Móvil Superior Unificada**: Eliminar `BottomNavMobile.tsx` en favor de un menú móvil drawer/dropdown integrado en la barra superior con gatillo de 3 barras horizontales.
- **Control de Visibilidad de Contraseña**: Componente reutilizable o inputs con estado `showPassword` y botón toggle con icono SVG de ojo / ojo tachado.

## Task List

### Phase 1: Estética Ortogonal Global, Modales y Detalle de Producto
- [x] Task 1.1: Quitar bordes redondeados y duplicados en `AdminSidebar.tsx` (corregir doble ítem de usuarios).
- [x] Task 1.2: Rediseñar `InventarioManager.tsx` (tabla a ancho completo, tipografía desktop aumentada `text-sm/base`, `rounded-none`) y convertir `ProductoEditor.tsx` en modal flotante.
- [x] Task 1.3: Convertir a esquinas rectas (`rounded-none`) los módulos admin restantes (`POSTerminal.tsx`, `PedidosTable.tsx`, `ClientesTable.tsx`, `UsuariosManager.tsx`).
- [x] Task 1.4: En `CatalogoGrid.tsx`, quitar el párrafo de descripción y reemplazarlo por el logotipo SVG oficial con degradado sin caja. Convertir filtros y buscador a `rounded-none`.
- [x] Task 1.5: En `detail-bento.css` y `DetalleProducto.tsx`, aplicar esquinas en punta (`border-radius: 0px`, `rounded-none`) en todas las celdas, badges, botones de tallas y modales.
- [x] Task 1.6: En `ShareWebModal.tsx`, estilizar el marco del código QR y el modal con esquinas rectas (`rounded-none`) y proporciones óptimas.

### Checkpoint: Estética Ortogonal y Modales
- [x] Todas las pantallas (Admin, Catálogo, Detalle, Modales, QR) muestran esquinas rectas ortogonales.
- [x] No hay ítems duplicados en el menú lateral de administración.
- [x] Al presionar "+ AGREGAR PRENDA" o editar en inventario, se abre un modal flotante sin reducir la tabla.

### Phase 2: Autenticación, Ojito de Contraseña y Soporte de Modo Claro
- [x] Task 2.1: En `UsuariosManager.tsx`, incorporar campo de contraseña y botón para ver/ocultar contraseña (ojito).
- [x] Task 2.2: En `login.astro`, añadir botón de ver/ocultar contraseña (ojito), esquinas rectas y corregir estilos en modo claro para máxima legibilidad.
- [x] Task 2.3: Ajustar `global.css` para que las superficies, inputs y textos en `html.light` tengan contraste nítido y consistente.

### Checkpoint: Autenticación y Contraste
- [x] En login y en creación de usuarios es posible alternar la visibilidad de la contraseña.
- [x] Modo claro es perfectamente legible en el formulario de inicio de sesión y catálogo.

### Phase 3: Navegación del Cliente, Menú Móvil Hamburger y Rediseño del Footer
- [x] Task 3.1: En `Navbar.astro`, remover enlace a "Marca & Drops" y botón redundante de WhatsApp. Dejar enlaces a Catálogo y Contacto.
- [x] Task 3.2: Reemplazar navegación móvil inferior por un menú hamburguesa superior de 3 líneas horizontales que despliega el menú de navegación del cliente.
- [x] Task 3.3: Ajustar contraste y apariencia de `Navbar.astro` en modo claro.
- [x] Task 3.4: En `Footer.astro`, reemplazar el formulario de newsletter por las redes sociales oficiales con icono SVG y nombre legible.
- [x] Task 3.5: En `Footer.astro`, retirar el acceso visible a admin de la columna de canales y reubicarlo como link discreto `// SYS` en el copyright.

### Checkpoint: Navegación y Footer
- [x] Navbar en móvil tiene botón de 3 líneas arriba y despliega el menú correctamente.
- [x] No hay botón redundante de WhatsApp en la navbar.
- [x] El footer muestra redes con iconos y nombres sin formulario de correo, y el link de admin está protegido/discreto.

### Phase 4: Configuración de Envíos, Sucursales y Selector de Moneda Unificada
- [x] Task 4.1: En `ConfiguracionWeb.tsx`, añadir controles para costo de envío, interruptor para envío gratis y umbral condicional.
- [x] Task 4.2: En `CarritoDrawer.tsx`, ocultar por completo la barra y textos de envío gratis si la promoción está desactivada.
- [x] Task 4.3: En `ConfiguracionWeb.tsx`, añadir módulo de gestión de sucursales (listado + agregar nueva sucursal).
- [x] Task 4.4: En `ConfiguracionWeb.tsx`, añadir selector de moneda (`BOB` / `USD`) con ingreso manual de tasa de cambio.
- [x] Task 4.5: En `src/config/site.ts`, actualizar `formatCurrency` y utilidades de moneda para formatear dinámicamente según la moneda y tasa configurada.

### Checkpoint: Ajustes de Negocio
- [x] El carrito oculta el envío gratis cuando está desactivado.
- [x] Se pueden añadir sucursales en la configuración web.
- [x] Si se cambia la moneda a USD con tipo de cambio (ej. 6.96), todos los productos de la tienda se muestran en USD uniformemente.

### Phase 5: Compilación, Despliegue en Cloudflare Pages y Git Workflow
- [x] Task 5.1: Ejecutar `pnpm build` para asegurar 0 errores en compilación de rutas estáticas y SSR.
- [x] Task 5.2: Ejecutar `graphify update .` para sincronizar el grafo de conocimiento.
- [x] Task 5.3: Realizar commits atómicos por fases y unificarlos en `main`.
- [x] Task 5.4: Redactar la guía completa de variables de entorno y pasos para subir a Cloudflare Pages desde GitHub.

## Risks and Mitigations
| Riesgo | Impacto | Mitigación |
|---|---|---|
| Inconsistencias de moneda en productos | Alto | Centralizar la conversión en `formatCurrency` y crear un hook/evento de sincronización de moneda para reactivar los componentes al guardar la configuración |
| Desbordamiento del modal flotante de inventario en pantallas pequeñas | Medio | Diseñar el modal flotante con `max-h-[90vh] overflow-y-auto` y clases responsivas |
| Desalineación de estilos en modo claro | Medio | Probar exhaustivamente tanto `html.light` como modo oscuro con variables CSS directas |
