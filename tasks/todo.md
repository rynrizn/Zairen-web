# Task List: Zairen Lab // Rediseño Zen, Modo Claro/Oscuro, Mejoras Admin y Métricas

## Phase 1: Catálogo Zen — Header, Secciones Colapsables, Scrollbar y Filtros Ampliados

### Task 1.1: Header de catálogo con logo oficial como watermark derecho detrás del texto
**Description:** Modificar el encabezado de `CatalogoGrid.tsx` para que utilice únicamente el icono vectorial SVG sin texto, ubicado siempre a la derecha (en móvil y escritorio) y posicionado como marca de agua sutil detrás del texto del título.
**Acceptance criteria:**
- [ ] El logotipo no tiene letras acompañantes en el header del catálogo.
- [ ] El icono vectorial se sitúa a la derecha y detrás del texto con opacidad sutil zen.
- [ ] Se visualiza correctamente tanto en pantallas móviles como de escritorio.
**Verification:**
- [ ] Build succeeds: `pnpm build`
- [ ] Manual check: Abrir `/` y comprobar alineación del watermark en móvil y desktop.
**Dependencies:** None
**Files likely touched:** `src/components/catalogo/CatalogoGrid.tsx`
**Estimated scope:** S (1 file)

### Task 1.2: Retirar etiqueta "ESTADO:" y diseño fluido de chips comerciales
**Description:** Eliminar la palabra "ESTADO:" que antecede a los botones de filtro comercial en `CatalogoGrid.tsx`. Permitir que los chips de estado se adapten con fluidez a la pantalla.
**Acceptance criteria:**
- [ ] No aparece el texto "ESTADO:" en la barra de filtros.
- [ ] Los chips (Todos, Pre-Order, Nuevo Drop, etc.) se ajustan fluidamente según el ancho de pantalla.
**Verification:**
- [ ] Manual check: Verificar en `/` que los filtros de estado se presentan limpios sin la etiqueta.
**Dependencies:** Task 1.1
**Files likely touched:** `src/components/catalogo/CatalogoGrid.tsx`
**Estimated scope:** XS (1 file)

### Task 1.3: Scroll horizontal para colecciones con scrollbar interactiva fina
**Description:** En la lista de chips de colecciones ("Todas", "Anime Mecha", etc.), implementar scroll horizontal táctil y una barra de desplazamiento fina (`scrollbar-thin-hover`) que se engrosa ligeramente al posar el ratón para permitir arrastrarla cómodamente.
**Acceptance criteria:**
- [ ] En pantallas móviles y tablets, los filtros de colección no desbordan la pantalla verticalmente; se deslizan horizontalmente.
- [ ] La barra de desplazamiento es ultra-fina (2-3px) y se ensancha al hover (5-6px) para facilitar su manipulación con el ratón.
**Verification:**
- [ ] Manual check: Probar en viewport móvil y probar hover con ratón en desktop.
**Dependencies:** Task 1.1
**Files likely touched:**
- `src/components/catalogo/CatalogoGrid.tsx`
- `src/styles/global.css`
**Estimated scope:** S (2 files)

### Task 1.4: Ampliar opciones de ordenamiento en catálogo
**Description:** Ampliar el `<select>` de ordenamiento en `CatalogoGrid.tsx` incorporando orden alfabético A-Z y Z-A, además de los existentes (precio ascendente, precio descendente y más recientes).
**Acceptance criteria:**
- [ ] El selector incluye opciones: "Más Recientes", "Precio: Menor a Mayor", "Precio: Mayor a Menor", "Nombre: A - Z", "Nombre: Z - A".
- [ ] La lista de productos se reordena correctamente según la opción elegida.
**Verification:**
- [ ] Manual check: Cambiar a orden A-Z y verificar que los productos se ordenan alfabéticamente.
**Dependencies:** Task 1.1
**Files likely touched:** `src/components/catalogo/CatalogoGrid.tsx`
**Estimated scope:** S (1 file)

### Task 1.5: Secciones colapsables de productos por colección en `CatalogoGrid.tsx`
**Description:** Implementar la agrupación de productos en secciones independientes por colección (como en `CatalogoV0`), con barra de cabecera de sección, contador de prendas, toggle colapsable interactivo y cuadrícula de productos en su interior (sin botón de QR por sección).
**Acceptance criteria:**
- [ ] Los productos se agrupan bajo su cabecera de sección/colección correspondiente.
- [ ] Cada sección incluye título, contador de artículos y flecha interactiva para contraer/expandir.
- [ ] Al seleccionar una colección específica en los filtros superiores, se enfoca la sección seleccionada.
- [ ] No incluye botones de código QR por sección.
**Verification:**
- [ ] Manual check: Hacer clic en el encabezado de una sección y verificar que se contrae y expande suavemente.
**Dependencies:** Tasks 1.1 - 1.4
**Files likely touched:**
- `src/components/catalogo/CatalogoGrid.tsx`
- `src/styles/global.css`
**Estimated scope:** M (2 files)

## Checkpoint 1: Catálogo Zen y Navegación
- [ ] Header con logo watermark sin letras funcionando.
- [ ] Scrollbar interactiva en filtros y ordenamiento ampliado.
- [ ] Secciones colapsables por colección operativas.

---

## Phase 2: Sistema de Fondos Zen, Modo Claro/Oscuro y Contrastes Globales

### Task 2.1: Configurar fondo zen Washi/Sumi-iro y remover degradados negros agresivos
**Description:** Reemplazar los fondos planos negros y degradados artificiales en `Layout.astro`, `AdminLayout.astro` y `global.css` por la paleta zen de `CatalogoV0`: modo claro Washi (`#F6F4EE`) y modo oscuro Sumi-iro (`#0E0F11`), con superposición de textura sutil de ruido `.bg-noise`.
**Acceptance criteria:**
- [ ] No hay degradados negros feos en la vista de catálogo ni en admin.
- [ ] En modo claro, el fondo es un tono Washi crema suave y limpio.
- [ ] En modo oscuro, el fondo es un Sumi-iro carbón elegante y profundo.
**Verification:**
- [ ] Manual check: Alternar entre modo claro y oscuro en `/` y `/admin` para validar la textura y armonía del fondo.
**Dependencies:** None
**Files likely touched:**
- `src/styles/global.css`
- `src/layouts/Layout.astro`
- `src/layouts/AdminLayout.astro`
- `src/pages/index.astro`
**Estimated scope:** M (4 files)

### Task 2.2: Contraste y estilos completos en modo claro para `CarritoDrawer.tsx`
**Description:** Implementar estilos semánticos para que el cajón del carrito en modo claro (`html.light`) muestre fondo marfil/blanco, textos oscuros nítidos, inputs legibles, resumen de precios con alto contraste y botón de WhatsApp destacado.
**Acceptance criteria:**
- [ ] El fondo del carrito en modo claro es blanco/marfil translúcido con borde suave.
- [ ] Todos los textos (títulos, nombres de prenda, precios, subtotales) son 100% legibles sin letras blancas sobre blanco.
- [ ] El campo de notas para envío tiene fondo e input claros de alto contraste.
**Verification:**
- [ ] Manual check: Abrir el carrito en modo claro y verificar legibilidad de todos los elementos.
**Dependencies:** Task 2.1
**Files likely touched:**
- `src/components/catalogo/CarritoDrawer.tsx`
- `src/styles/global.css`
**Estimated scope:** S (2 files)

### Task 2.3: Soporte total de modo claro en `detail-bento.css` y `DetalleProducto.tsx`
**Description:** Reemplazar los valores oscuros fijos de `detail-bento.css` por variables adaptativas con reglas explícitas para `html.light`, permitiendo que la ficha de producto en `/producto/[id]` tenga celdas translúcidas claras, textos oscuros de alto contraste, selector de tallas y lightbox perfectamente visibles.
**Acceptance criteria:**
- [ ] Las celdas bento en modo claro tienen fondo translúcido blanco y sombras nítidas.
- [ ] Título, especificaciones, botones de talla y badges son perfectamente legibles en modo claro.
- [ ] En modo oscuro conserva su atmósfera sumi-iro intacta.
**Verification:**
- [ ] Manual check: Navegar a un producto individual en modo claro y verificar cada celda.
**Dependencies:** Task 2.1
**Files likely touched:**
- `src/styles/detail-bento.css`
- `src/components/catalogo/DetalleProducto.tsx`
**Estimated scope:** S (2 files)

### Task 2.4: Remover degradado negro inferior en `TarjetaPolera.tsx`
**Description:** Eliminar la capa con `bg-gradient-to-t from-[#0e0e0e]/80` de `TarjetaPolera.tsx` y reemplazarla por una sombra y degradado semántico que respete el modo claro y oscuro sin manchar las tarjetas.
**Acceptance criteria:**
- [ ] Las tarjetas de producto en modo claro no tienen una franja negra sucia en la parte inferior.
- [ ] Los nombres y precios de las prendas son nítidos en ambos modos.
**Verification:**
- [ ] Manual check: Observar las tarjetas de producto en el catálogo en modo claro.
**Dependencies:** Task 2.1
**Files likely touched:** `src/components/catalogo/TarjetaPolera.tsx`
**Estimated scope:** XS (1 file)

## Checkpoint 2: Atmósfera Zen y Modo Claro Impecable
- [ ] Fondo zen Washi / Sumi-iro activo con grano sutil.
- [ ] Carrito, ficha de producto y catálogo 100% legibles y armónicos en modo claro.

---

## Phase 3: Rediseño y Limpieza del Footer

### Task 3.1: Retiro de texto redundante extenso en `Footer.astro`
**Description:** Eliminar el párrafo "Indumentaria experimental streetwear fusionando minimalismo japonés, cortes oversized pesados y siluetas de identidad en reposo. Tienda oficial online." de `Footer.astro`.
**Acceptance criteria:**
- [ ] El párrafo extenso ya no aparece en el footer.
**Verification:**
- [ ] Manual check: Inspeccionar el footer en `/` y `/marca`.
**Dependencies:** None
**Files likely touched:** `src/components/common/Footer.astro`
**Estimated scope:** XS (1 file)

### Task 3.2: Retiro de columnas "CATÁLOGO" y "MARCA" y reorganización armónica
**Description:** Eliminar las columnas redundantes de "CATÁLOGO" y "MARCA" del pie de página, dejando las columnas clave ("CANALES", "PEDIDOS", "ATENCIÓN") y redistribuyendo el ancho de la grilla para un balance visual superior.
**Acceptance criteria:**
- [ ] No aparecen los bloques "CATÁLOGO" y "MARCA" en el footer.
- [ ] Las columnas restantes se distribuyen limpiamente sin espacios vacíos desproporcionados.
**Verification:**
- [ ] Manual check: Verificar el pie de página en escritorio y móvil.
**Dependencies:** Task 3.1
**Files likely touched:** `src/components/common/Footer.astro`
**Estimated scope:** S (1 file)

### Task 3.3: Realce y accesibilidad del botón/enlace de acceso admin junto a `// SYS`
**Description:** En la fila final de copyright, asegurar que el enlace de acceso a administración esté claramente posicionado al lado de `// SYS` con estilo técnico interactivo para facilitar el ingreso del administrador.
**Acceptance criteria:**
- [ ] El enlace conduce a `/login` al hacer clic.
- [ ] Está ubicado al lado de la leyenda de copyright y `// SYS`.
**Verification:**
- [ ] Manual check: Hacer clic en el enlace del footer y verificar redirección a `/login`.
**Dependencies:** Task 3.2
**Files likely touched:** `src/components/common/Footer.astro`
**Estimated scope:** XS (1 file)

## Checkpoint 3: Footer Limpio y Equilibrado
- [ ] Footer sin párrafos redundantes ni columnas innecesarias.
- [ ] Enlace admin accesible y bien formateado.

---

## Phase 4: Panel Admin — Eliminación de Pantalla Inútil, Navbar con Tema y Correcciones

### Task 4.1: Eliminar pantalla y ruta `vista-catalogo.astro` y su referencia en `AdminSidebar.tsx`
**Description:** Borrar el archivo `src/pages/admin/vista-catalogo.astro` y retirar el ítem correspondiente del array `navItems` en `AdminSidebar.tsx`.
**Acceptance criteria:**
- [ ] El archivo `vista-catalogo.astro` es eliminado.
- [ ] El sidebar no muestra la opción "Vista Catálogo".
**Verification:**
- [ ] Build succeeds: `pnpm build`
- [ ] Manual check: Verificar el menú lateral de administración en `/admin`.
**Dependencies:** None
**Files likely touched:**
- `src/pages/admin/vista-catalogo.astro` (delete)
- `src/components/admin/layout/AdminSidebar.tsx`
**Estimated scope:** S (2 files)

### Task 4.2: Retirar caja/marco contenedor del logo en `AdminSidebar.tsx`
**Description:** Modificar el sidebar para que el logotipo vectorial SVG se muestre limpio y suelto, sin recuadros negros con bordes (`bg-[#0a0a0a] border border-[#2A2A2A] p-2`).
**Acceptance criteria:**
- [ ] El logo en el sidebar no tiene un recuadro o caja con borde alrededor.
- [ ] Se muestra con nitidez y proporciones correctas tanto en versión expandida como colapsada.
**Verification:**
- [ ] Manual check: Comprobar el logo en la cabecera del sidebar en `/admin`.
**Dependencies:** None
**Files likely touched:** `src/components/admin/layout/AdminSidebar.tsx`
**Estimated scope:** XS (1 file)

### Task 4.3: Implementar barra superior administrativa con selector de Modo Oscuro / Claro
**Description:** Agregar una barra superior limpia en `AdminLayout.astro` / `AdminSidebar.tsx` que incluya un botón toggle para alternar entre modo oscuro y claro en el panel administrativo, sincronizado con `zairen_theme` en `localStorage`.
**Acceptance criteria:**
- [ ] El panel administrativo incluye botón de cambio de tema oscuro/claro accesible en desktop y móvil.
- [ ] Al alternar, el fondo, tablas, tarjetas y tipografía del admin se adaptan correctamente.
**Verification:**
- [ ] Manual check: Cambiar a modo claro dentro de `/admin` y comprobar persistencia tras recargar.
**Dependencies:** None
**Files likely touched:**
- `src/layouts/AdminLayout.astro`
- `src/components/admin/layout/AdminSidebar.tsx`
- `src/styles/global.css`
**Estimated scope:** S (3 files)

### Task 4.4: Corregir switch de "Producto Visible" en `ProductoEditor.tsx`
**Description:** Corregir el interruptor de visibilidad del producto en `ProductoEditor.tsx` sustituyendo el contenedor y la pelotita desalineada por un switch de tamaño estándar simétrico (`w-11 h-6`, `after:w-5 after:h-5`, `peer-checked:after:translate-x-5`) que encaje fluidamente.
**Acceptance criteria:**
- [ ] Cuando el switch está encendido, el indicador queda perfectamente alineado en el extremo derecho sin separación anómala.
- [ ] Cuando está apagado, queda alineado en el extremo izquierdo.
- [ ] Funciona suavemente con transición animada.
**Verification:**
- [ ] Manual check: Abrir modal de añadir/editar prenda en `/admin/inventario` y probar el switch.
**Dependencies:** None
**Files likely touched:** `src/components/admin/inventario/ProductoEditor.tsx`
**Estimated scope:** XS (1 file)

### Task 4.5: Ampliar `ConfiguracionWeb.tsx` con personalización de `CatalogoV0`
**Description:** Incorporar en `ConfiguracionWeb.tsx` las opciones del catálogo anterior: selector de color de acento & estado con swatches de color, selector de intensidad de desenfoque (Glassmorphism sutil 10px, medio 20px, profundo 35px), y personalización de mensajes de saludo/despedida para compras por WhatsApp e Instagram.
**Acceptance criteria:**
- [ ] Panel de configuración incluye paleta de colores de acento para el catálogo público.
- [ ] Control de desenfoque de glassmorphism configurable.
- [ ] Campos de saludo y plantilla de mensaje para redes sociales.
- [ ] Persistencia reactiva en configuración.
**Verification:**
- [ ] Manual check: Modificar una opción en `/admin/interfaz-web` y guardar.
**Dependencies:** None
**Files likely touched:** `src/components/admin/settings/ConfiguracionWeb.tsx`
**Estimated scope:** M (1 file)

## Checkpoint 4: Admin Optimizado y Consistente
- [ ] Pantalla "Vista Catálogo" eliminada.
- [ ] Logo sin recuadro en sidebar y botón de modo claro/oscuro en admin.
- [ ] Switch de prendas corregido y configuración web ampliada.

---

## Phase 5: Módulo Independiente de Métricas & Reportes con Exportación

### Task 5.1: Crear página `/admin/metricas.astro` y componente `MetricasManager.tsx`
**Description:** Crear una vista administrativa independiente para analíticas y rendimiento con filtros de período (1 Semana y 1 Mes), métricas de productos más vendidos, tasa de conversión y clics de compra.
**Acceptance criteria:**
- [ ] Ruta `/admin/metricas` accesible para administradores.
- [ ] Permite alternar entre métricas de "Última Semana (7 Días)" y "Último Mes (30 Días)".
- [ ] Muestra listado y gráfico de productos más populares con stock, precio y ventas.
**Verification:**
- [ ] Build succeeds: `pnpm build`
- [ ] Manual check: Abrir `/admin/metricas` y cambiar entre 7 días y 30 días.
**Dependencies:** None
**Files likely touched:**
- `src/pages/admin/metricas.astro` (new)
- `src/components/admin/metricas/MetricasManager.tsx` (new)
**Estimated scope:** M (2 files)

### Task 5.2: Desacoplar gráficos pesados del dashboard inicial `/admin`
**Description:** Limpiar el panel general (`src/pages/admin/index.astro`) retirando `TopVendidos.tsx` y `VentasChart.tsx` para que cargue ultrarrápido con las KPIs esenciales y accesos directos, dejando los análisis detallados en la nueva vista de métricas.
**Acceptance criteria:**
- [ ] El dashboard principal `/admin` carga de forma ligera e instantánea.
- [ ] Los gráficos residen exclusivamente en `/admin/metricas`.
**Verification:**
- [ ] Manual check: Cargar `/admin` y verificar que solo muestra KPIs rápidas y alertas urgentes.
**Dependencies:** Task 5.1
**Files likely touched:** `src/pages/admin/index.astro`
**Estimated scope:** S (1 file)

### Task 5.3: Incorporar exportación de métricas a CSV y vista formateada para PDF
**Description:** Añadir botones de exportación en `MetricasManager.tsx`: generar y descargar archivo `.csv` con los datos del período seleccionado, y gatillar una vista de impresión limpia y estilizada para guardar como `.pdf`.
**Acceptance criteria:**
- [ ] Botón "Exportar CSV" descarga un archivo `metricas_zairen_YYYY-MM-DD.csv` con encabezados y datos tabulares.
- [ ] Botón "Exportar PDF / Imprimir" abre la ventana de impresión del navegador con estilos de página limpios sin barras laterales.
**Verification:**
- [ ] Manual check: Probar descarga de CSV e inspeccionar contenido; pulsar botón PDF y revisar vista previa.
**Dependencies:** Task 5.1
**Files likely touched:** `src/components/admin/metricas/MetricasManager.tsx`
**Estimated scope:** S (1 file)

### Task 5.4: Añadir enlace "Métricas & Reportes" al final de `AdminSidebar.tsx`
**Description:** Incorporar el nuevo ítem de navegación "Métricas & Reportes" con su respectivo icono analítico al final del menú en `AdminSidebar.tsx`.
**Acceptance criteria:**
- [ ] El ítem aparece al final de la lista de navegación en el sidebar de escritorio y móvil.
- [ ] Enlaza correctamente a `/admin/metricas` con estado activo resaltado.
**Verification:**
- [ ] Manual check: Navegar desde el sidebar a `/admin/metricas`.
**Dependencies:** Task 5.1
**Files likely touched:** `src/components/admin/layout/AdminSidebar.tsx`
**Estimated scope:** XS (1 file)

## Checkpoint 5: Módulo de Métricas Independiente
- [ ] Pantalla `/admin/metricas` funcional con filtros de 1 semana y 1 mes.
- [ ] Dashboard `/admin` aligerado y rápido.
- [ ] Exportación a CSV y PDF operativa.

---

## Phase 6: Preparación para Datos Reales de Supabase y Tabla de Imágenes Cloudinary

### Task 6.1: Desacoplar mockProducts y estructurar fallback limpio a Supabase
**Description:** Asegurar que las consultas a `vw_catalogo_publico` y la tabla `producto` en `src/pages/index.astro` y `src/pages/producto/[id].astro` sean las fuentes primarias de verdad, de modo que al registrar productos en Supabase la tienda muestre exclusivamente las prendas reales.
**Acceptance criteria:**
- [ ] Si la base de datos de Supabase contiene productos, se muestran únicamente los productos de Supabase (sin mezclar mocks).
- [ ] Si la base de datos está vacía, muestra el estado vacío profesional o fallback controlado.
**Verification:**
- [ ] Build succeeds: `pnpm build`
**Dependencies:** All previous phases
**Files likely touched:**
- `src/pages/index.astro`
- `src/pages/producto/[id].astro`
**Estimated scope:** S (2 files)

### Task 6.2: Elaborar inventario y tabla de imágenes locales para sustitución en Cloudinary
**Description:** Documentar detalladamente en un informe al usuario cada una de las imágenes locales que se están utilizando, su ubicación, su propósito y las dimensiones/formatos exactos recomendados para subirlas a Cloudinary y sustituir las rutas locales sin conflictos.
**Acceptance criteria:**
- [ ] Documento con la lista exhaustiva de imágenes locales.
- [ ] Especificación de formato (WebP, PNG transparente o SVG) y dimensiones recomendadas para cada una.
**Verification:**
- [ ] Manual check: Revisar reporte entregado al usuario.
**Dependencies:** None
**Files likely touched:** Documentation / Implementation Plan Artifact
**Estimated scope:** XS (Documentation)
