# ⛩️ ZAIREN LAB // TOKYO EXPERIMENTAL APPAREL
> Web E-Commerce Profesional & Sistema Integral de Gestión de Inventario (SaaS / Vendible)

Plataforma integral construida con **Astro 5**, **React 19**, **Tailwind CSS (Tokens Neo-Tokyo Zen)**, **Supabase PostgreSQL** y **Cloudflare Pages**.

---

## 🏗️ Flujo de Desarrollo Git y Pull Requests (PRs)

El proyecto sigue una metodología estricta de branches y commits atómicos:

| Rama / PR | Estado | Descripción |
|:---|:---:|:---|
| `main` | 🛡️ Base | Código estable listo para despliegue |
| `feature/fase-1-scaffolding-db-auth` | ✅ Fusionada (PR #1) | Fase 1: Arquitectura base, scripts SQL de Supabase, Auth RBAC y componentes UI |
| `feature/fase-2-catalogo-publico` | ✅ Fusionada (PR #2) | Fase 2: Catálogo web, Bento grid, Carrito Drawer y Checkout WhatsApp |
| `feature/fase-3-admin-dashboard-inventario` | ✅ Fusionada (PR #3) | Fase 3: Dashboard con KPIs, Matriz de stock por tallas y Pedidos |
| `feature/fase-4-pos-usuarios-clientes-extras` | ✅ Fusionada (PR #4) | Fase 4: Terminal POS con QR Bolivia, Usuarios, Clientes y CMS de tienda |

---

## ⚙️ Guía de Configuración Rápida (Variables de Contacto y Redes)

Las variables de la marca, el número de celular para WhatsApp y las redes sociales dinámicas se pueden configurar desde tres lugares:

### 1. Archivo de Configuración Principal: [`src/config/site.ts`](src/config/site.ts)
Aquí se definen los valores por defecto del sistema con tipado TypeScript estricto:
- **Número de WhatsApp**: Modifica `siteConfig.whatsapp.number` (sin el signo `+`, ej: `"59174522654"`) y `displayNumber` (formato legible: `"+591 74522654"`).
- **Redes Sociales Dinámicas**:
  ```ts
  socialNetworks: [
    {
      id: 'instagram',
      name: 'Instagram',
      url: 'https://instagram.com/tu_cuenta', // Pon tu enlace aquí
      enabled: true,                         // true = visible en la web
      icon: 'Instagram',
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      url: 'https://tiktok.com/@tu_cuenta',  // Pon tu enlace aquí
      enabled: true,                         // Cambia a true si tienes TikTok
      icon: 'Video',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      url: '',                               // Dejar vacío o enabled: false
      enabled: false,                        // Desaparece automáticamente
      icon: 'Facebook',
    },
  ]
  ```
> **Comportamiento Dinámico:** Si solo tienes Instagram, únicamente aparecerá Instagram en el Navbar, Footer y Carrito Drawer. Si activas TikTok, aparecerán ambos de forma armónica sin dejar espacios vacíos.

### 2. Archivo de Variables de Entorno: [`.env`](.env)
Puedes sobreescribir los valores sin tocar el código fuente editando las siguientes variables:
```env
PUBLIC_WHATSAPP_NUMBER=59174522654
PUBLIC_WHATSAPP_DISPLAY=+591 74522654

# Enlaces de Redes (Si dejas una vacía, desaparece de toda la web automáticamente)
PUBLIC_INSTAGRAM_URL=https://instagram.com/zairenlab
PUBLIC_TIKTOK_URL=https://tiktok.com/@zairenlab
PUBLIC_FACEBOOK_URL=
```

### 3. Panel Visual Web CMS: [`/admin/interfaz-web`](/admin/interfaz-web)
Dentro del panel administrativo, ingresa a **Interfaz Web** para modificar visualmente los datos de la marca, activar o desactivar redes con interruptores interactivos y personalizar el banner promocional superior.


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