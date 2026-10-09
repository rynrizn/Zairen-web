# Constraints // ZAIREN LAB

Last reviewed: 2026-10-09

## Floor (Siempre en vigor)

- Sin comentarios de supresión de tipos o linter: `@ts-ignore`, `eslint-disable`
- Sin stubs incompletos ni bloques `catch {}` vacíos
- Sin secretos ni credenciales en código fuente (claves privadas de Supabase, tokens)
- Este archivo no se flexibiliza para forzar aprobaciones

## Reglas de Marca y Arquitectura Específicas

| Dimensión | Regla | Motivo |
|-----------|-------|--------|
| **Ubicación & Origen** | CERO menciones de "Tarija", "Tokyo-Tarija" u origen geográfico | Decisión del cliente: no revelar ubicación para fomentar preguntas orgánicas |
| **Identidad Comercial** | CERO uso de "taller" o "confección textil" | Zairen Lab opera como **tienda online** de moda experimental, no taller físico |
| **Logotipo Oficial** | CERO cajas, bordes o contenedores cuadrados encerrando el logo | El logo SVG oficial debe respirar limpio en Navbar, SplashLoader y Footer |
| **Página Principal (`/`)** | Catálogo como ÚNICA y primera pantalla protagónica | Entrada directa a productos y filtros sin secciones de hero invasivas |
| **Página de Marca (`/marca`)** | Información editorial separada | Historia, cotización y drops residen en una página dedicada |
| **Ubicación de Login** | Login administrativo EXCLUSIVAMENTE en el Footer | La Navbar es para orientación del cliente; admin reside discreto en footer |
| **Soporte & Consultas** | Sin promesas automatizadas ("menos de 15 min") | Comunicación realista directa por WhatsApp |
| **Diseño & Temas** | Diseño unificado y soporte Modo Claro / Modo Oscuro | Coherencia visual e interactiva en toda la web y admin |
| **Seguridad Admin** | Imposible bypass por consola de navegador en producción | Verificación criptográfica con Supabase y comprobación de rol en `public.perfil` |
| **Anti-Bot Pedidos** | Verificación humana obligatoria antes del checkout | Cloudflare Turnstile / Slide-to-verify interactivo + Honeypot + Rate limit |

## Verificación de Código

| Dimensión | Regla | Comando | Momento |
|-----------|-------|---------|---------|
| **Tipos & Astro** | Cero errores de TypeScript y plantillas | `pnpm check` | Fin de tarea |
| **Compilación** | Cero errores de build y sin warnings de headers | `pnpm build` | Pre-commit |
| **Git** | Commits atómicos y unificados en `main` | `git log --oneline` | Pre-push |
