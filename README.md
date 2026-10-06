# ⛩️ ZAIREN LAB // TOKYO EXPERIMENTAL APPAREL
> Web E-Commerce Profesional & Sistema Integral de Gestión de Inventario (SaaS / Vendible)

Plataforma integral construida con **Astro 5**, **React 19**, **Tailwind CSS (Tokens Neo-Tokyo Zen)**, **Supabase PostgreSQL** y **Cloudflare Pages**.

---

## 🏗️ Flujo de Desarrollo Git y Pull Requests (PRs)

El proyecto sigue una metodología estricta de branches y commits atómicos:

| Rama / PR | Estado | Descripción |
|:---|:---:|:---|
| `main` | 🛡️ Base | Código estable listo para despliegue |
| `feature/fase-1-scaffolding-db-auth` | 🔨 En curso | Fase 1: Arquitectura base, scripts SQL de Supabase, Auth RBAC y componentes UI |
| `feature/fase-2-catalogo-publico` | ⏳ Pendiente | Fase 2: Catálogo web, Bento grid, Carrito Drawer y Checkout WhatsApp |
| `feature/fase-3-admin-dashboard-inventario` | ⏳ Pendiente | Fase 3: Dashboard con KPIs, Matriz de stock por tallas y Pedidos |
| `feature/fase-4-pos-usuarios-clientes-extras` | ⏳ Pendiente | Fase 4: Terminal POS con QR Bolivia, Usuarios, Clientes y CMS de tienda |

---

## ⚙️ Guía de Configuración Rápida (Variables de Contacto y Redes)

Las variables de marca, número de WhatsApp y redes sociales dinámicas se configuran en:

1. **Archivo de Configuración Central**: [`src/config/site.ts`](file:///c:/Users/Ryan/Pictures/WEBZAIREN/Zairen-web/src/config/site.ts)
2. **Variables de Entorno**: [`.env`](file:///c:/Users/Ryan/Pictures/WEBZAIREN/Zairen-web/.env) (o basarse en [`.env.example`](file:///c:/Users/Ryan/Pictures/WEBZAIREN/Zairen-web/.env.example))
3. **Base de Datos (Opcional en caliente)**: Tabla `configuracion` en Supabase.

### 📱 Redes Sociales Dinámicas:
En `src/config/site.ts`, la propiedad `socialNetworks` contiene la lista de redes activas.
- Si solo tienes Instagram, se muestra únicamente Instagram.
- Si agregas TikTok o Facebook, aparecerán automáticamente en el Navbar, Footer y Drawer.
- Si dejas la URL vacía `""` o eliminas el elemento, desaparece de toda la interfaz sin romper nada.

---

## 🚀 Scripts del Proyecto

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor local de desarrollo
pnpm dev

# Compilar para producción
pnpm build

# Previsualizar build de producción
pnpm preview
```