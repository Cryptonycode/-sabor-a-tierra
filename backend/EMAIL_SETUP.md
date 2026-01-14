# 📧 Configuración de Emails Transaccionales con Resend

## 📦 Instalación

```bash
cd backend
npm install resend
```

## 🔑 Variables de Entorno Requeridas

Añade las siguientes variables a tu archivo `.env`:

```env
# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=pedidos@saboratierra.com

# Frontend URL (para links en emails)
FRONTEND_URL=http://localhost:3000
```

### Cómo obtener tu API Key de Resend:

1. Ve a [https://resend.com](https://resend.com)
2. Crea una cuenta o inicia sesión
3. Ve a "API Keys"
4. Crea una nueva API Key
5. Copia la key y añádela a tu `.env`

### Configurar dominio de envío:

1. En el dashboard de Resend, ve a "Domains"
2. Añade tu dominio (ej: `saboratierra.com`)
3. Configura los registros DNS según las instrucciones de Resend
4. Verifica el dominio
5. Usa el dominio verificado en `FROM_EMAIL` (ej: `pedidos@saboratierra.com`)

**Para desarrollo:** Puedes usar `onboarding@resend.dev` como `FROM_EMAIL` (limitado a 100 emails/día)

## 📨 Emails Disponibles

### 1. Email de Confirmación de Pedido
**Ruta:** Enviado automáticamente tras crear un pedido en `/api/orders`

**Características:**
- ✅ Resumen completo del pedido
- ✅ Detalles de productos y precios
- ✅ Información de entrega
- ✅ Instrucciones específicas para cada método de pago:
  - **Tarjeta:** Confirmación de pago procesado
  - **Bizum:** Número, importe y botón de WhatsApp para enviar comprobante
  - **Transferencia:** IBAN, concepto y botón de WhatsApp para enviar comprobante

### 2. Email de Bienvenida con Cupón
**Ruta:** `/api/customers/register`

**Características:**
- 🎉 Mensaje de bienvenida personalizado
- 🎁 Cupón `BIENVENIDA10` (10% de descuento)
- 🌱 Ventajas de la plataforma
- 🔗 Enlace directo al catálogo de productos

**Cómo funciona:**
```javascript
// Registrar nuevo cliente y enviar email de bienvenida
await fetch('/api/customers/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'cliente@example.com',
    first_name: 'Juan',
    last_name: 'Pérez',
    sendWelcome: true  // true para enviar email de bienvenida
  })
});
```

### 3. Email de Acceso Seguro
**Ruta:** `/api/customers/send-access-link`

**Características:**
- 🔐 Link de acceso directo sin contraseña
- ⚡ Válido por 1 hora
- 🔒 Mensaje de seguridad

**Cómo funciona:**
```javascript
// Enviar email de acceso
await fetch('/api/customers/send-access-link', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'cliente@example.com'
  })
});
```

## 🎁 Cupón BIENVENIDA10

### Crear el cupón en la base de datos:

```bash
# Ejecutar script de seed
cd backend
npm run build
node dist/scripts/seedWelcomeDiscount.js
```

O llamar al endpoint:
```bash
curl -X POST http://localhost:5000/api/customers/verify-welcome-discount
```

### Características del cupón:
- **Código:** `BIENVENIDA10`
- **Descuento:** 10%
- **Uso:** Reutilizable (no es de un solo uso)
- **Expiración:** Sin fecha de expiración
- **Disponibilidad:** Para todos los nuevos clientes

## 🧪 Testing

### Test de email de confirmación:
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_info": {
      "first_name": "Juan",
      "last_name": "Pérez",
      "email": "tu-email@example.com",
      "phone": "+34 600 000 000"
    },
    "delivery_address": {
      "address": "Calle Mayor 123",
      "city": "Madrid",
      "postal_code": "28001",
      "province": "Madrid"
    },
    "items": [
      {
        "product_name": "Tomates Cherry",
        "variant_name": "CAJA 2 KG",
        "quantity": 1,
        "unit_price": 5.90,
        "weight": 2
      }
    ],
    "subtotal": 5.90,
    "shipping_cost": 3.90,
    "discount": 0,
    "total": 9.80,
    "payment_method": "bizum"
  }'
```

### Test de email de bienvenida:
```bash
curl -X POST http://localhost:5000/api/customers/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo-cliente@example.com",
    "first_name": "María",
    "last_name": "García",
    "sendWelcome": true
  }'
```

### Test de email de acceso:
```bash
curl -X POST http://localhost:5000/api/customers/send-access-link \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cliente@example.com"
  }'
```

## 📊 Monitorización

Los emails incluyen logging automático:
- ✅ Email enviado correctamente
- ❌ Error al enviar email (con detalles)

Revisa los logs del servidor para verificar el estado de los envíos.

## 🎨 Personalización

### Modificar templates:
Los templates HTML están en `backend/src/services/emailService.ts`

### Cambiar datos de la empresa:
```typescript
// En emailService.ts
const FROM_EMAIL = process.env.FROM_EMAIL || 'pedidos@saboratierra.com';
const COMPANY_NAME = 'Sabor a Tierra';
const WHATSAPP_NUMBER = '600000000';
const BIZUM_NUMBER = '600 000 000';
const IBAN = 'ES00 0000 0000 0000 0000 0000';
```

## 🚀 Producción

Antes de ir a producción:
1. ✅ Verifica tu dominio en Resend
2. ✅ Configura `FROM_EMAIL` con tu dominio verificado
3. ✅ Actualiza `FRONTEND_URL` con tu URL de producción
4. ✅ Actualiza los datos reales (IBAN, WhatsApp, Bizum)
5. ✅ Ejecuta el script para crear el cupón BIENVENIDA10
6. ✅ Prueba todos los flujos de email

## 📝 Notas

- Los emails se envían de forma asíncrona
- Si falla el envío de un email, **no se cancela** la operación principal (crear pedido, registrar usuario, etc.)
- Todos los emails están en español y optimizados para móvil
- Los templates incluyen estilos inline para máxima compatibilidad

