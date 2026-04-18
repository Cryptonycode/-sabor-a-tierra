# Inventario Admin Frontend + Contratos API

## Alcance

Inventario de rutas del área admin en `frontend/src/app`, clientes API usados por frontend y contratos esperados para planificar migración a monolito Next sin romper integraciones.

## Árbol de rutas detectado

Rutas de `frontend/src/app` relevantes para admin:

- `/admin` -> `frontend/src/app/admin/page.tsx`
- `/admin/login` -> `frontend/src/app/admin/login/page.tsx`
- `/admin/productos` -> `frontend/src/app/admin/productos/page.tsx`
- `/admin/pedidos` -> `frontend/src/app/admin/pedidos/page.tsx`
- `/admin/agricultores` -> `frontend/src/app/admin/agricultores/page.tsx`
- `/admin/clientes` -> `frontend/src/app/admin/clientes/page.tsx`
- `/admin/unauthorized` -> `frontend/src/app/admin/unauthorized/page.tsx`

Archivos de soporte de auth/layout:

- `frontend/src/app/admin/layout.tsx`
- `frontend/src/components/ProtectedRoute.tsx`
- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/lib/authApi.ts`
- `frontend/src/lib/api.ts`

Rutas enlazadas desde navegación, sin archivo actualmente (potenciales 404):

- `/admin/inventario`
- `/admin/devoluciones`
- `/admin/newsletter`

## Modelo de auth/roles actual

- Auth admin basada en JWT propio del backend.
- Token y perfil admin en `localStorage` (`admin_token`, `admin_user`).
- Protección de rutas admin solo client-side con `ProtectedRoute`.
- Roles permitidos en layout admin: `admin`, `superadmin`, `moderator`.
- Redirecciones:
  - no autenticado -> `/admin/login`
  - rol no permitido -> `/admin/unauthorized`

## Endpoints backend consumidos por admin UI

### Auth (`frontend/src/lib/authApi.ts`)

- `POST /auth/login`
  - body: `{ email, password }`
  - response esperado: `{ success, admin?, token?, message? }`
- `POST /auth/verify`
  - headers: `Authorization: Bearer <token>`
  - body: `{}`
  - response: `{ success, admin? }`
- `POST /auth/change-password`
  - headers auth
  - body: `{ oldPassword, newPassword }`
  - response: `{ success, message }`
- `POST /auth/create-admin`
  - headers auth
  - body: `{ email, password, first_name, last_name, role? }`
  - response: `AuthResponse`
- `GET /auth/me`
  - headers auth
  - response: `{ success, admin? }`

### Dashboard (`/admin`)

- Actualmente no consume backend (mock local en `frontend/src/app/admin/page.tsx`).
- Comentada una posible integración futura con `adminApi.getDashboardStats()`.

### Productos (`/admin/productos`)

- `GET /products?includeInactive=true`
- `GET /farmers`
- `POST /products`
- `PUT /products/:id`
- `DELETE /products/:id`
- `GET /products/:productId/variants`
- `POST /products/:productId/variants`
- `PUT /variants/:id`
- `DELETE /variants/:id`

Shape principal esperado:

- `Product`: `{ id, name, description, price, farmer_id, category, unit, main_image_url?, is_available, stock_quantity, status, featured, variants? }`
- `ProductVariant`: `{ id?, name, description?, price, stock_quantity, sku?, weight?, unit?, pieces?, is_available }`

### Pedidos (`/admin/pedidos`)

- `GET /orders` o `GET /orders?status=<status>`
- `PUT /orders/:orderId/status` body `{ status, notes, updated_by }`
- `PUT /orders/:orderId` body parcial (ej. `tracking_number`)
- `PUT /orders/:orderId/cancel` body `{ reason, cancelled_by }`
- `POST /orders/:orderId/refund` body `{ amount, reason, processed_by }`

Shape esperado:

- `Order`: `{ id, order_number, customer_*, delivery_*, total_amount, subtotal, tax_amount, shipping_cost, order_status, payment_status, items[], timeline[] }`

### Agricultores (`/admin/agricultores`)

- `GET /farmer-applications?status=pending`
- `GET /farmer-applications`
- `GET /farmers?status=approved|rejected`
- `POST /farmer-applications/:applicationId/approve` body `{ reviewed_by }`
- `POST /farmer-applications/:applicationId/reject` body `{ reviewed_by, admin_notes }`
- `POST /farmers/:farmerId/reject` body `{}`

Shape esperado:

- `FarmerApplication`: `{ id, first_name, last_name, email, phone, production_type, main_products, address, city, province, farming_experience, description, status }`

### Clientes (`/admin/clientes`)

- `GET /customers` (+ query `search`, `status`)
- `GET /customers/:customerId/orders`
- `PUT /customers/:customerId` body `{ is_active }`
- `POST /customers/:customerId/send-marketing` body `{ template, subject }`

Shape esperado:

- `Customer`: `{ id, first_name, last_name, email, phone?, marketing_consent, is_active, total_orders, total_spent, last_order_date? }`
- `CustomerOrder`: `{ id, order_number, total_amount, order_status, created_at }`

## Riesgos de contrato detectados

- `productApi.getFeatured()` usa `/products?featured=true`, pero backend expone `GET /products/featured`.
- Acciones admin usan algunos identificadores hardcodeados en body (`updated_by`, `cancelled_by`, `processed_by`), no derivados de sesión real.
- Layout admin enlaza rutas no implementadas (`inventario`, `devoluciones`, `newsletter`).
- Protección admin depende del cliente (no middleware SSR todavía).

## Roles requeridos (estado actual frontend)

- Acceso a `/admin/*` (excepto `/admin/login` y `/admin/unauthorized`): `admin | superadmin | moderator`.
- No hay enforcement granular por página en frontend para superadmin-only.
- La autorización efectiva depende de validación backend en cada endpoint.
