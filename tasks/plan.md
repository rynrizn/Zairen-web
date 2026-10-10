# Implementation Plan: Rediseño Zen Catálogo, Modo Claro/Oscuro, Mejoras Admin y Métricas Independientes

## Overview
Esta entrega ejecuta la actualización estética y funcional de Zairen Lab basándose en el estándar visual y las funcionalidades de `CatalogoV0`:
1. **Catálogo Zen:** Header con logotipo vectorial oficial limpio como watermark en el lateral derecho detrás del texto, secciones de productos colapsables por colección, scroll horizontal refinado para filtros en móvil y eliminación de la etiqueta "ESTADO:".
2. **Sistema de Fondos y Tema Claro/Oscuro:** Integración de la paleta Washi/Sumi-iro de `CatalogoV0` con textura de ruido zen suave, eliminando degradados oscuros artificiales en catálogo y admin. Adaptación de contraste completa en `CarritoDrawer`, `DetalleProducto` y `TarjetaPolera`.
3. **Footer Minimalista:** Retiro de texto redundante y de las columnas "Catálogo" y "Marca", equilibrando el espacio y asegurando el acceso directo a administración al final de la página.
4. **Admin Refinado:** Eliminación de la vista innecesaria "Vista Catálogo", corrección del interruptor de visibilidad de prendas, logo limpio sin cajas contenedoras en el sidebar, topbar administrativa con cambio de tema claro/oscuro y ampliación de `ConfiguracionWeb`.
5. **Métricas Independientes:** Pantalla dedicada de analíticas y productos más vendidos (`/admin/metricas`) con selector de rango (1 semana / 1 mes) y exportación a CSV/PDF, aligerando el panel general.
6. **Datos Reales de Supabase e Inventario Cloudinary:** Preparación para descarte de mocks y tabla de imágenes locales para reemplazo en Cloudinary.

---

## Architecture & Design Decisions
- **Fondo Dual Zen (Washi & Sumi-iro):** En lugar de fondos negros planos con degradados rígidos, adoptamos variables CSS semánticas (`--z-mesh-base`, `--z-glass-bg`, `--z-text-primary`) con soporte para `html.light` y `html.dark`, complementado con un overlay de grano sutil `.bg-noise`.
- **Secciones Colapsables por Colección:** En `CatalogoGrid.tsx`, cuando se selecciona la vista general o se exploran colecciones, los productos se agrupan en contenedores colapsables con header estilizado, indicador de cantidad de prendas y toggle animado, emulando la navegación del catálogo anterior.
- **Scrollbar Interactiva Táctil/Cursor:** En los chips de filtro móvil, aplicamos una clase `.scrollbar-thin-hover` con altura inicial de 2px a 3px y expansión a 6px al pasar el cursor o interactuar, facilitando el deslizamiento sin ensuciar la interfaz.
- **Métricas Aisladas para Alto Rendimiento:** Extraer los gráficos de `VentasChart` y `TopVendidos` de la página inicial de `/admin` y ubicarlos en `/admin/metricas`. Esto elimina llamadas pesadas y renderizados de Chart en el dashboard principal.
- **Switch Nativo Estilizado:** En `ProductoEditor.tsx`, reemplazar el checkbox defectuoso por un switch de palanca estándar (`peer-checked:translate-x-5`) con alineación simétrica.

---

## Task List by Phases

### Phase 1: Catálogo Zen — Header, Secciones Colapsables, Scrollbar y Filtros Ampliados
- [ ] Task 1.1: Header de catálogo con logo vectorial oficial sin letras como watermark lateral derecho detrás del texto.
- [ ] Task 1.2: Retirar la etiqueta "ESTADO:" de los filtros comerciales y hacer los chips responsivos.
- [ ] Task 1.3: Scroll horizontal para colecciones con barra de scroll fina interactiva (`scrollbar-thin-hover`).
- [ ] Task 1.4: Ampliar opciones de ordenamiento (Más Recientes, Menor Precio, Mayor Precio, Alfabético A-Z, Alfabético Z-A).
- [ ] Task 1.5: Implementar estructura de secciones colapsables por colección en `CatalogoGrid.tsx` con conteo de prendas y animación suave (sin QR por sección).

### Phase 2: Sistema de Fondos Zen, Modo Claro/Oscuro y Contrastes Globales
- [ ] Task 2.1: Configurar fondo zen Washi/Sumi-iro con textura suave de grano `.bg-noise` y eliminar degradados negros agresivos en catálogo y admin.
- [ ] Task 2.2: Pulir contraste y diseño en modo claro (`html.light`) para `CarritoDrawer.tsx` (fondo, textos oscuros legibles, bordes e inputs).
- [ ] Task 2.3: Implementar reglas de modo claro en `detail-bento.css` y `DetalleProducto.tsx` (celdas, selectores de tallas, lightbox y textos).
- [ ] Task 2.4: Remover el degradado negro inferior forzado en `TarjetaPolera.tsx` y adaptarlo al tema activo.

### Phase 3: Rediseño y Limpieza del Footer
- [ ] Task 3.1: Quitar el párrafo descriptivo extenso en `Footer.astro`.
- [ ] Task 3.2: Quitar columnas "CATÁLOGO" y "MARCA" y reorganizar armónicamente las columnas restantes.
- [ ] Task 3.3: Asegurar y estilizar el botón/enlace de acceso al panel administrativo al lado del copyright `// SYS`.

### Phase 4: Panel Admin — Eliminación de Pantalla Inútil, Navbar con Tema y Correcciones
- [ ] Task 4.1: Eliminar la ruta `vista-catalogo.astro` y su referencia en `AdminSidebar.tsx`.
- [ ] Task 4.2: Retirar el contenedor cuadrado del logo en `AdminSidebar.tsx` para mostrar el SVG oficial limpio.
- [ ] Task 4.3: Implementar barra superior administrativa con selector de Modo Oscuro / Claro funcional y sincronizado con `localStorage`.
- [ ] Task 4.4: Corregir el switch de visibilidad en `ProductoEditor.tsx` por un toggle estándar y simétrico.
- [ ] Task 4.5: Ampliar `ConfiguracionWeb.tsx` con opciones de personalización de `CatalogoV0` (color de estado/acento, nivel de blur glassmorphism, mensajes de saludo WhatsApp/Instagram).

### Phase 5: Módulo Independiente de Métricas & Reportes con Exportación
- [ ] Task 5.1: Crear página `/admin/metricas.astro` y componente `MetricasManager.tsx` con filtros de 1 Semana y 1 Mes.
- [ ] Task 5.2: Desacoplar gráficos pesados del dashboard inicial `/admin` para optimizar su tiempo de carga.
- [ ] Task 5.3: Incorporar exportación de métricas a formato CSV y vista de impresión/PDF.
- [ ] Task 5.4: Añadir enlace "Métricas & Reportes" al final de `AdminSidebar.tsx`.

### Phase 6: Preparación para Datos Reales de Supabase y Tabla de Imágenes Cloudinary
- [ ] Task 6.1: Dejar listo el flujo de fallback limpio para priorizar productos de la base de datos de Supabase.
- [ ] Task 6.2: Elaborar lista e inventario de imágenes locales con los formatos requeridos para reemplazo en Cloudinary.
