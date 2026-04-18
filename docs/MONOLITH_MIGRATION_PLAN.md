# Plan de Migración a Monolito Next.js (Vercel)

## Objetivo

Migrar incrementalmente `frontend + backend` hacia un monolito Next.js (`app/api/**/route.ts`) desplegable en Vercel, manteniendo contratos críticos y reforzando seguridad en admin.

## Decisiones técnicas

## API

- Migración por slices desde Express hacia Next Route Handlers.
- Mantener paths actuales siempre que sea viable para minimizar cambios del cliente.
- Cuando un contrato cambie, versionar explícitamente (`/api/v2/...`) en vez de romper en caliente.

## Auth admin

- Mantener auth propia (tabla `admins` + bcrypt + JWT) en esta etapa.
- Mover sesión a cookie `httpOnly` (`admin_token`) en lugar de depender de `localStorage`.
- Middleware SSR en Next para proteger `/admin/*`.
- Evolución posterior opcional: Supabase Auth + RLS, en iniciativa separada.

## Uploads

- Eliminar dependencia de `multer + sharp` en serverless de Vercel.
- Adoptar flujo direct-to-storage:
  - `POST /api/uploads/intent` (firma de subida / token temporal).
  - cliente sube directo a Supabase Storage.
  - `POST /api/uploads/complete` registra metadata.
- Si se requiere resize/webp, mover a worker/cola fuera de request sync.

## Arquitectura objetivo (Clean/SOLID)

- `src/domain`: entidades, value objects, contratos.
- `src/application`: casos de uso.
- `src/infrastructure`: repositorios Supabase, storage, email.
- `src/presentation`: route handlers y mapeo HTTP.
- `src/server/factories`: composición/DI (`createServices()`).

## Fases de ejecución

1. **Auth Admin Slice**
   - Login/verify/me en `app/api/admin/auth/*`.
   - Cookie httpOnly + middleware SSR.
   - Mantener backend como source-of-truth durante transición.
2. **Productos Admin Slice**
   - Migrar `/products` write/admin-list y variantes.
   - Reusar contratos de payload/respuesta.
3. **Pedidos Slice**
   - Migrar lectura + mutaciones de estado/reembolso.
4. **Uploads Slice**
   - Introducir signed upload y migrar UI de `multipart`.
5. **Cierre**
   - Quitar rewrite dev al backend externo.
   - Eliminar workspace `backend` cuando todas las rutas estén migradas.

## Riesgos y mitigaciones

- **Riesgo:** divergencia de contratos durante coexistencia.
  - **Mitigación:** tests de contrato por endpoint, documentación viva por slice.
- **Riesgo:** sesión dual (`localStorage` + cookie) durante transición.
  - **Mitigación:** priorizar cookie en middleware/API y retirar localStorage al completar auth slice.
- **Riesgo:** uploads pesados en serverless.
  - **Mitigación:** direct upload + procesamiento asíncrono.
- **Riesgo:** latencia por validación remota de token en middleware temporal.
  - **Mitigación:** migrar verificación local JWT en middleware cuando auth viva 100% dentro de Next.

## Estrategia de despliegue

- Deploy incremental en feature flags/rutas migradas.
- Mantener backend Express activo hasta completar todos los slices.
- Smoke tests en preview de Vercel por slice:
  - login admin, acceso a `/admin`, CRUD de productos, flujo básico de pedidos.
- Rollback rápido por ruta (reapuntar al backend legado) en caso de regresión.

## POC mínimo implementado (Gate 4)

- Endpoints Next:
  - `POST /api/admin/auth/login`
  - `POST /api/admin/auth/verify`
  - `GET /api/admin/auth/me`
  - `POST /api/admin/auth/logout`
- Cookie httpOnly de sesión:
  - `admin_token`
- Middleware SSR:
  - `src/middleware.ts` protege `/admin/:path*`
  - permite `/admin/login` y `/admin/unauthorized`
  - valida cookie JWT contra backend actual (`/api/auth/verify`) durante transición.
