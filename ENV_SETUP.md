# 🔧 Configuración de Variables de Entorno

## Backend (.env)

Crea un archivo `backend/.env` con el siguiente contenido:

```env
# Base de datos (Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key

# JWT
JWT_SECRET=your_jwt_secret_key

# Email (Resend)
# Obtén tu API key en: https://resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

# Email de remitente
# ⚠️ IMPORTANTE: Para desarrollo/pruebas usar OBLIGATORIAMENTE:
FROM_EMAIL=onboarding@resend.dev

# Para producción (después de verificar tu dominio en Resend):
# FROM_EMAIL=pedidos@saboratierra.com

# Frontend URL (para links en emails)
FRONTEND_URL=http://localhost:3000

# Server
PORT=5000
NODE_ENV=development
```

---

## Frontend (.env.local)

Crea un archivo `frontend/.env.local` con el siguiente contenido:

```env
# API Backend URL
# ⚠️ IMPORTANTE: Incluye /api al final
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 📝 Notas Importantes

### Email de Remitente (FROM_EMAIL)

**Para Desarrollo/Pruebas:**
```env
FROM_EMAIL=onboarding@resend.dev
```
- ✅ No requiere verificación de dominio
- ✅ Funciona inmediatamente
- ⚠️ Límite: 100 emails/día
- ⚠️ Solo para testing

**Para Producción:**
```env
FROM_EMAIL=pedidos@saboratierra.com
```
- ⚠️ Requiere verificar dominio en Resend
- ✅ Sin límites de envío
- ✅ Mejor deliverability

### URL de la API (NEXT_PUBLIC_API_URL)

La URL **debe incluir** `/api` al final:

```env
✅ Correcto:   NEXT_PUBLIC_API_URL=http://localhost:5000/api
❌ Incorrecto: NEXT_PUBLIC_API_URL=http://localhost:5000
❌ Incorrecto: NEXT_PUBLIC_API_URL=http://localhost:5000/api/api
```

Esto evita duplicación de rutas (`/api/api/customers/...`).

---

## 🔑 Obtener API Key de Resend

1. Ve a [resend.com/signup](https://resend.com/signup)
2. Crea una cuenta gratuita
3. Ve a **"API Keys"**
4. Crea una nueva API Key
5. Cópiala y pégala en `RESEND_API_KEY`

**Ejemplo:**
```env
RESEND_API_KEY=re_abc123def456ghi789jkl
```

---

## ✅ Verificar Configuración

### Backend
```bash
cd backend
node -e "require('dotenv').config(); console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Configurada' : '❌ No configurada'); console.log('FROM_EMAIL:', process.env.FROM_EMAIL || 'onboarding@resend.dev');"
```

### Frontend
```bash
cd frontend
node -e "require('dotenv').config({ path: '.env.local' }); console.log('API_URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api');"
```

---

## 🚀 Arrancar los Servidores

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

**Salida esperada:**
```
📧 Servicio de email inicializado con remitente: onboarding@resend.dev
🚀 Servidor corriendo en http://localhost:5000
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

**Salida esperada:**
```
✓ Ready in 2.5s
○ Local: http://localhost:3000
```

---

## 🧪 Probar el Sistema de Emails

1. Ir a: `http://localhost:3000/checkout`
2. Click en **"Crear cuenta o Iniciar sesión"**
3. Introducir tu email real
4. Click en **"Recibir acceso por email"**
5. Verificar en la consola del backend:
   ```
   📧 Servicio de email inicializado con remitente: onboarding@resend.dev
   ✅ Email de acceso seguro enviado a tu-email@example.com
   ```
6. Revisar tu bandeja de entrada

---

## 🐛 Solución de Problemas

### Error: "RESEND_API_KEY no está configurada"
```
⚠️ ADVERTENCIA: RESEND_API_KEY no está configurada en las variables de entorno
```

**Solución:**
- Verificar que el archivo `backend/.env` existe
- Verificar que `RESEND_API_KEY` está configurada
- Reiniciar el servidor backend

### Error: "404 - /api/api/customers/..."
```
Error: 404 Not Found - /api/api/customers/send-access-link
```

**Solución:**
- Verificar que `NEXT_PUBLIC_API_URL` incluye `/api`
- Debe ser: `http://localhost:5000/api`
- Reiniciar el servidor frontend

### Email no llega

**Verificar en la consola del backend:**
```
❌ Error al enviar email de acceso seguro:
Error completo: { ... }
```

**Posibles causas:**
1. API Key incorrecta
2. `FROM_EMAIL` no es `onboarding@resend.dev` (para testing)
3. Email destino inválido
4. Límite de 100 emails/día alcanzado

**Solución:**
- Revisar logs completos del error
- Verificar API Key en [resend.com/api-keys](https://resend.com/api-keys)
- Usar `FROM_EMAIL=onboarding@resend.dev` para pruebas

---

## 📚 Recursos

- [Documentación Resend](https://resend.com/docs)
- [Dashboard Resend](https://resend.com/dashboard)
- [Límites del plan gratuito](https://resend.com/pricing)
- `EMAIL_SETUP.md` - Guía completa de emails

