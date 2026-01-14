# 🚀 Quick Start: Emails Transaccionales

## ⚡ Configuración en 3 Pasos

### Paso 1: Instalar Resend
```bash
cd backend
npm install resend
```

### Paso 2: Configurar Variables de Entorno
Añade a `backend/.env`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=pedidos@saboratierra.com
FRONTEND_URL=http://localhost:3000
```

**Para testing rápido, usa:**
```env
RESEND_API_KEY=tu_api_key_aqui
FROM_EMAIL=onboarding@resend.dev
FRONTEND_URL=http://localhost:3000
```

### Paso 3: Crear Cupón BIENVENIDA10
```bash
cd backend
npm run build
curl -X POST http://localhost:5000/api/customers/verify-welcome-discount
```

---

## ✅ Listo para Usar

### Email de Confirmación de Pedido
Se envía **automáticamente** al completar una compra. No requiere configuración adicional.

### Email de Bienvenida
Se envía **automáticamente** cuando un nuevo usuario solicita acceso en el checkout.

### Email de Acceso Seguro
Se envía **automáticamente** cuando el usuario hace clic en "Recibir acceso por email" en el checkout.

---

## 🧪 Prueba Rápida

### 1. Ir al Checkout
```
http://localhost:3000/checkout
```

### 2. Click en "Crear cuenta o Iniciar sesión"

### 3. Introducir tu email y hacer clic en "Recibir acceso por email"

### 4. Revisar tu bandeja de entrada
Deberías recibir:
- ✉️ Email de acceso seguro
- 🎉 Email de bienvenida con cupón BIENVENIDA10 (si eres nuevo)

---

## 📝 Obtener API Key de Resend

1. Ve a [resend.com/signup](https://resend.com/signup)
2. Crea una cuenta gratis
3. Ve a "API Keys"
4. Crea una nueva key
5. Cópiala y pégala en tu `.env`

**Límite gratuito:** 100 emails/día con `onboarding@resend.dev`

---

## 🎯 Siguientes Pasos

1. **Verificar dominio** en Resend para envíos ilimitados
2. **Actualizar datos** reales (IBAN, WhatsApp, Bizum) en `emailService.ts`
3. **Personalizar templates** según tu marca
4. **Probar todos los flujos** antes de producción

---

## 📚 Más Información

- **Documentación completa:** `EMAIL_SETUP.md`
- **Implementación detallada:** `IMPLEMENTACION_EMAILS.md`
- **Código fuente:** `backend/src/services/emailService.ts`

---

**¿Problemas?** Revisa los logs del servidor o consulta `EMAIL_SETUP.md` → Sección "Solución de Problemas"

