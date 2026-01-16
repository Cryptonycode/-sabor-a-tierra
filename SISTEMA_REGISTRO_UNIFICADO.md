# Sistema Unificado de Registro/Newsletter y Control de Banner

## Resumen

Este documento describe la implementación del sistema unificado de registro de clientes, suscripción al newsletter, y control de visibilidad del banner/modal de descuento.

## Características Implementadas

### 1. Lógica de Registro Única (Backend)

#### Archivos Creados/Modificados:

- **`backend/src/services/emailService.ts`** (NUEVO)
  - Servicio para envío de emails de bienvenida
  - Plantilla HTML profesional con el cupón BIENVENIDA10
  - Preparado para integración con servicios de email (SendGrid, Mailgun, AWS SES, etc.)
  
- **`backend/src/services/registrationService.ts`** (NUEVO)
  - Servicio unificado que maneja todo el proceso de registro
  - Verifica si el email ya existe en la base de datos
  - Si es nuevo:
    - Crea el cliente en la tabla `customers`
    - Crea/actualiza la suscripción al newsletter
    - Genera el cupón BIENVENIDA10 (10% descuento, un solo uso)
    - Envía el email de bienvenida con el cupón
  - Si existe:
    - No envía email
    - Responde con estado 'already_exists'

- **`backend/src/routes/customerRoutes.ts`** (MODIFICADO)
  - Ahora usa `RegistrationService.registerCustomer()`
  - Retorna estado 409 si el email ya existe

- **`backend/src/routes/newsletterRoutes.ts`** (MODIFICADO)
  - Ahora usa `RegistrationService.subscribeToNewsletterOnly()`
  - Unificado con la creación de clientes

- **`backend/src/routes/discountRoutes.ts`** (MODIFICADO)
  - Endpoint `/api/discounts/generate-first-purchase` actualizado
  - Usa el servicio unificado de registro
  - Verifica si el usuario ya tiene un cupón BIENVENIDA10 activo

- **`backend/src/services/discountService.ts`** (MODIFICADO)
  - Método `validateDiscountCode()` mejorado
  - Acepta parámetro opcional `customerEmail` para validación
  - Verifica que cupones BIENVENIDA10:
    - Solo puedan ser usados por el email asociado
    - Solo puedan ser usados una vez (times_used = 0)

#### Flujo de Registro:

```
Usuario ingresa email en modal/banner
         ↓
POST /api/discounts/generate-first-purchase
         ↓
RegistrationService.subscribeToNewsletterOnly()
         ↓
Verifica si email existe en DB
         ↓
    ┌────┴────┐
    │         │
   SÍ        NO
    │         │
    │         ├→ Crear cliente
    │         ├→ Crear suscripción newsletter
    │         ├→ Generar cupón BIENVENIDA10-XXXXXX
    │         └→ Enviar email con cupón
    │
    └→ Verificar si tiene cupón activo
              ↓
         ┌────┴────┐
         │         │
        SÍ        NO
         │         │
         │         └→ Retornar mensaje "ya utilizado"
         │
         └→ Retornar cupón existente
```

### 2. Control de Visibilidad del Banner (Frontend)

#### Archivos Modificados:

- **`frontend/src/components/ClientLayoutWrapper.tsx`** (MODIFICADO)
  - Lógica de visibilidad basada en rutas
  - Control de estado con localStorage
  - Detección de usuarios autenticados

#### Rutas donde el Banner SE MUESTRA:
- `/` (Home)
- `/productos`
- `/agricultores`
- `/sobre-nosotros`

#### Rutas donde el Banner NO SE MUESTRA:
- `/checkout`
- `/carrito`
- `/dashboard/*` (cualquier ruta que empiece con /dashboard)
- `/admin/*` (cualquier ruta que empiece con /admin)

#### Estados de localStorage que ocultan el banner:

```javascript
{
  "bannerDismissedPermanently": "true",  // Usuario cerró permanentemente
  "userRegistered": "true",               // Usuario se registró
  "isAuthenticated": "true",              // Usuario está logueado
  "discountClaimed": "true"               // Usuario ya reclamó descuento
}
```

### 3. Estado de 'Uso' del Banner

El sistema implementa las siguientes verificaciones:

1. **Ruta actual**: Solo en rutas permitidas
2. **Usuario logueado**: No mostrar a usuarios autenticados
3. **Banner cerrado**: No mostrar si fue cerrado permanentemente
4. **Registro previo**: No mostrar si ya se registró
5. **Cupón reclamado**: No mostrar si ya reclamó el descuento

#### Comportamiento del Banner/Modal:

- **Al cargar la página (en rutas permitidas)**:
  - Espera 10 segundos
  - Muestra el modal automáticamente
  
- **Al cerrar el modal (X)**:
  - Oculta el modal
  - Muestra el banner flotante en la esquina inferior derecha
  
- **Al hacer clic en el banner**:
  - Oculta el banner
  - Muestra el modal
  
- **Al enviar el formulario con éxito**:
  - Marca `userRegistered` y `discountClaimed` en localStorage
  - Oculta modal y banner permanentemente
  - El banner no volverá a aparecer en futuras visitas

### 4. Restricción de Cupón BIENVENIDA10

#### Validaciones Implementadas:

1. **Formato del código**: `BIENVENIDA10-XXXXXX` (6 caracteres aleatorios)

2. **Un solo uso por cliente**:
   - Campo `max_uses = 1` en la tabla `discount_codes`
   - Campo `times_used` incrementa al usar el cupón
   - Validación: `times_used < max_uses`

3. **Asociado a un email específico**:
   - Campo `customer_email` en `discount_codes`
   - Validación en `discountService.validateDiscountCode()`
   - El cupón solo puede ser usado por el email registrado

4. **Verificación en checkout**:
   - Al aplicar un cupón, se valida con `validateDiscountCode()`
   - Se pasa el email del cliente para validación
   - Se marca como usado con `markCodeAsUsed()` al completar la compra

#### Tabla `discount_codes`:

```sql
CREATE TABLE discount_codes (
  id UUID PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  customer_email VARCHAR(255),
  discount_percentage INTEGER NOT NULL,
  max_uses INTEGER DEFAULT 1,
  times_used INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP,
  last_order_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Integración con Servicio de Email

El sistema está preparado para integrar con servicios de email reales. Por ahora, los emails se loguean en consola.

### Para Integrar con SendGrid:

1. Instalar dependencia:
   ```bash
   npm install @sendgrid/mail
   ```

2. En `backend/src/services/emailService.ts`, descomentar y configurar:
   ```typescript
   import sgMail from '@sendgrid/mail';
   
   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
   
   await sgMail.send({
     to: email,
     from: process.env.EMAIL_FROM || 'noreply@saboratierra.com',
     subject,
     text: textContent,
     html: htmlContent,
   });
   ```

3. Configurar variables de entorno:
   ```env
   SENDGRID_API_KEY=tu_api_key
   EMAIL_FROM=noreply@saboratierra.com
   FRONTEND_URL=https://tudominio.com
   ```

### Otras opciones de servicios de email:

- **Mailgun**: Similar a SendGrid
- **AWS SES**: Servicio de Amazon
- **Resend**: Moderna y fácil de usar
- **Postmark**: Especializado en emails transaccionales

## Testing

### Backend:

```bash
# Probar registro nuevo
curl -X POST http://localhost:3001/api/discounts/generate-first-purchase \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Respuesta esperada (nuevo):
{
  "success": true,
  "discountCode": "BIENVENIDA10-ABC123",
  "message": "Registro exitoso. Te hemos enviado un email con tu cupón de descuento."
}

# Probar con email existente
curl -X POST http://localhost:3001/api/discounts/generate-first-purchase \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Respuesta esperada (existente sin cupón):
{
  "success": false,
  "message": "Este email ya está registrado y el cupón de bienvenida ya fue utilizado"
}
```

### Frontend:

1. Abrir la página principal (`/`)
2. Esperar 10 segundos → debe aparecer el modal
3. Ingresar un email y enviar
4. Verificar que el modal se cierra y no vuelve a aparecer
5. Verificar localStorage:
   ```javascript
   localStorage.getItem('userRegistered') // "true"
   localStorage.getItem('discountClaimed') // "true"
   ```

## Mantenimiento

### Limpiar estado del banner (para testing):

```javascript
// En consola del navegador:
localStorage.removeItem('bannerDismissedPermanently');
localStorage.removeItem('userRegistered');
localStorage.removeItem('discountClaimed');
```

### Ver cupones generados:

```sql
SELECT * FROM discount_codes 
WHERE code LIKE 'BIENVENIDA10%' 
ORDER BY created_at DESC;
```

### Ver clientes registrados:

```sql
SELECT email, first_name, last_name, created_at 
FROM customers 
ORDER BY created_at DESC;
```

## Próximos Pasos (Opcional)

1. **Implementar servicio de email real** (SendGrid, Mailgun, etc.)
2. **Agregar tracking de emails abiertos**
3. **Crear tabla `email_logs` para auditoría**
4. **Implementar A/B testing del banner**
5. **Añadir analytics de conversión**
6. **Crear panel de admin para ver estadísticas de cupones**

## Soporte

Para cualquier duda sobre el sistema implementado, revisar:
- `backend/src/services/registrationService.ts` - Lógica principal de registro
- `backend/src/services/emailService.ts` - Envío de emails
- `frontend/src/components/ClientLayoutWrapper.tsx` - Control de visibilidad

