# Graph Report - Zairen-web  (2026-10-08)

## Corpus Check
- Corpus is ~44,782 words - fits in a single context window. You may not need a graph.

## Summary
- 265 nodes · 520 edges · 16 communities (12 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Client Management & Core Pages
- Build & Dev Dependencies
- User Administration & Auth RBAC
- Public Catalog & Product Detail
- Cart State & Checkout Flow
- Mobile Navigation & Brand Elements
- Inventory Stock & Sizing Matrix
- Dashboard Metrics & Stock Alerts
- Database Schema & Entity Types
- Runtime Dependencies & Astro Integrations
- TypeScript Configuration
- Orders Management & Table
- Negative Brand Assets
- PNPM Workspace Config
- Git & Release Workflow

## God Nodes (most connected - your core abstractions)
1. `react` - 32 edges
2. `siteConfig` - 29 edges
3. `sonner` - 17 edges
4. `CarritoDrawer()` - 13 edges
5. `supabase` - 9 edges
6. `DetalleProducto()` - 7 edges
7. `formatCurrency()` - 7 edges
8. `isSupabaseConfigured` - 7 edges
9. `getCartSubtotal()` - 7 edges
10. `getCartShippingCost()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Site Configuration Guide` --references--> `siteConfig`  [EXTRACTED]
  README.md → src/config/site.ts
- `Zairen Brand Asset Logo (Negativo)` --semantically_similar_to--> `Zairen Brand Logo (Negativo)`  [INFERRED] [semantically similar]
  src/assets/brand/zairen_logo_negativo.svg → public/brand/zairen_logo_negativo.svg
- `Zairen Brand Asset Logo (Oficial)` --semantically_similar_to--> `Zairen Brand Logo (Oficial)`  [INFERRED] [semantically similar]
  src/assets/brand/zairen_logo_oficial.svg → public/brand/zairen_logo_oficial.svg
- `InventarioTableProps` --references--> `InventarioItem`  [EXTRACTED]
  src/components/admin/inventario/InventarioTable.tsx → src/components/admin/inventario/ProductoEditor.tsx
- `CarritoDrawer()` --calls--> `formatCurrency()`  [EXTRACTED]
  src/components/catalogo/CarritoDrawer.tsx → src/config/site.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Zairen Brand Visual Identity Assets** — public_brand_zairen_logo_oficial_logo, public_brand_zairen_logo_negativo_logo, public_favicon_icon [EXTRACTED 1.00]

## Communities (16 total, 4 thin omitted)

### Community 0 - "Client Management & Core Pages"
Cohesion: 0.07
Nodes (31): Zairen Favicon, Site Configuration Guide, Zairen Lab Tokyo Experimental Apparel, ClienteRecord, ClientesTable(), mockClientes, AdminSidebar(), AdminSidebarProps (+23 more)

### Community 1 - "Build & Dev Dependencies"
Cohesion: 0.06
Nodes (33): description, devDependencies, @types/node, @types/react, @types/react-dom, typescript, name, scripts (+25 more)

### Community 2 - "User Administration & Auth RBAC"
Cohesion: 0.13
Nodes (13): initialUsuarios, UserRole, UsuarioRecord, UsuariosManager(), mockCollections, mockProducts, isSupabaseConfigured, supabase (+5 more)

### Community 3 - "Public Catalog & Product Detail"
Cohesion: 0.22
Nodes (14): sonner, CatalogoGrid(), CatalogoGridProps, DetalleProducto(), DetalleProductoProps, ShareProductModal(), ShareProductModalProps, TarjetaPolera() (+6 more)

### Community 4 - "Cart State & Checkout Flow"
Cohesion: 0.27
Nodes (14): CarritoDrawer(), TurnstileWidget(), TurnstileWidgetProps, CartItem, clearCart(), closeDrawer(), getCartShippingCost(), getCartSubtotal() (+6 more)

### Community 5 - "Mobile Navigation & Brand Elements"
Cohesion: 0.22
Nodes (14): Zairen Brand Logo (Oficial), @nanostores/react, react, Zairen Brand Asset Logo (Oficial), BottomNavMobile(), CartBadge(), Props, ShareButton() (+6 more)

### Community 6 - "Inventory Stock & Sizing Matrix"
Cohesion: 0.18
Nodes (12): initialInventoryData, InventarioManager(), InventarioTableProps, MatrizStock(), MatrizStockProps, SIZES, StockBySize, InventarioItem (+4 more)

### Community 7 - "Dashboard Metrics & Stock Alerts"
Cohesion: 0.14
Nodes (12): AlertasInventario(), AlertItem, initialAlerts, collectionsData, DonutColecciones(), initialOrders, PedidosPendientes(), PendingOrder (+4 more)

### Community 8 - "Database Schema & Entity Types"
Cohesion: 0.12
Nodes (15): AtributoProducto, Cliente, Coleccion, Configuracion, DetallePedido, EstadoComercial, Imagen, Inventario (+7 more)

### Community 9 - "Runtime Dependencies & Astro Integrations"
Cohesion: 0.13
Nodes (15): dependencies, astro, @astrojs/cloudflare, @astrojs/react, clsx, lucide-react, nanostores, @nanostores/react (+7 more)

### Community 10 - "TypeScript Configuration"
Cohesion: 0.18
Nodes (10): astro/tsconfigs/strict, compilerOptions, allowJs, baseUrl, jsx, jsxImportSource, paths, strictNullChecks (+2 more)

### Community 11 - "Orders Management & Table"
Cohesion: 0.33
Nodes (5): initialOrders, Order, OrderItem, OrderStatus, PedidosTable()

## Knowledge Gaps
- **117 isolated node(s):** `name`, `type`, `version`, `description`, `dev` (+112 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 128 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Mobile Navigation & Brand Elements` to `Client Management & Core Pages`, `Build & Dev Dependencies`, `User Administration & Auth RBAC`, `Public Catalog & Product Detail`, `Cart State & Checkout Flow`, `Inventory Stock & Sizing Matrix`, `Dashboard Metrics & Stock Alerts`, `Orders Management & Table`?**
  _High betweenness centrality (0.304) - this node is a cross-community bridge._
- **What connects `name`, `type`, `version` to the rest of the system?**
  _117 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Client Management & Core Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.06787330316742081 - nodes in this community are weakly interconnected._
- **Why does `sonner` connect `Public Catalog & Product Detail` to `Client Management & Core Pages`, `Build & Dev Dependencies`, `User Administration & Auth RBAC`, `Cart State & Checkout Flow`, `Mobile Navigation & Brand Elements`, `Inventory Stock & Sizing Matrix`, `Dashboard Metrics & Stock Alerts`, `Orders Management & Table`?**
  _High betweenness centrality (0.108) - this node is a cross-community bridge._
- **Should `Build & Dev Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05832147937411095 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `Runtime Dependencies & Astro Integrations` to `Build & Dev Dependencies`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Should `User Administration & Auth RBAC` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._