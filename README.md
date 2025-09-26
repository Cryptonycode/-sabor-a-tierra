# Sabor a Tierra 🌱

E-commerce completo de productos agrícolas que conecta agricultores locales con consumidores conscientes. Desarrollado con tecnologías modernas y enfoque en sostenibilidad.

## 🚀 Características Principales

### 👥 **Sistema de Usuarios**
- Registro y autenticación de clientes
- Panel de administración con roles
- Gestión completa de agricultores
- Workflow de aplicaciones para nuevos productores

### 🛒 **E-commerce Completo**
- Catálogo de productos con filtros avanzados
- Sistema de carrito y checkout
- Gestión de pedidos con múltiples estados
- Cálculo automático de impuestos y envío
- Integración con pasarelas de pago (RedSys y PayPal)

### 📊 **Panel de Administración**
- Dashboard con métricas en tiempo real
- Gestión de productos, agricultores y pedidos
- Estadísticas de ventas y usuarios
- Sistema de aplicaciones de agricultores

### 📧 **Marketing y Comunicación**
- Newsletter con suscripciones personalizables
- Sistema de confirmación por email
- Gestión de preferencias de usuario

## 🛠 **Tecnologías Implementadas**

### Frontend
- **Next.js 14** - Framework React con SSR
- **TypeScript** - Tipado estático
- **TailwindCSS** - Styling utility-first
- **React Context** - Estado global del carrito

### Backend
- **Express.js** - API REST robusta
- **TypeScript** - Tipado en servidor
- **Supabase** - Base de datos y autenticación
- **bcryptjs** - Hashing de contraseñas
- **Passport.js** - Autenticación OAuth

### Base de Datos
- **Supabase (PostgreSQL)** - Base de datos principal
- **Row Level Security** - Seguridad a nivel de fila
- **Triggers automáticos** - Actualización de timestamps
- **Funciones SQL** - Lógica de negocio optimizada

## 📦 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/sabor-a-tierra.git
cd sabor-a-tierra
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Supabase
1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ejecuta el script SQL de `DATABASE_SCHEMA.sql` en el editor SQL
3. Obtén las credenciales de tu proyecto

### 4. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto:

```env
# Configuración de Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# OAuth (Opcional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Pagos (Opcional)
REDSYS_MERCHANT_CODE=your_merchant_code
REDSYS_SECRET_KEY=your_secret_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Configuración del servidor
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 5. Iniciar el proyecto
```bash
# Iniciar todo el proyecto (frontend + backend)
npm run dev

# O por separado:
npm run dev:frontend  # Puerto 3000
npm run dev:backend   # Puerto 3001
```

## 🏗️ Arquitectura del Proyecto

```
sabor-a-tierra/
├── frontend/                 # Next.js App
│   ├── src/
│   │   ├── app/             # Pages (App Router)
│   │   ├── components/      # Componentes reutilizables
│   │   ├── context/         # React Context (Cart)
│   │   ├── data/           # Datos mock y tipos
│   │   └── types/          # Tipos TypeScript
│   └── public/             # Assets estáticos
├── backend/                  # Express.js API
│   ├── src/
│   │   ├── config/         # Configuración Supabase
│   │   ├── services/       # Lógica de negocio
│   │   ├── routes/         # Rutas de API
│   │   └── types/          # Tipos de base de datos
│   └── dist/               # Código compilado
├── DATABASE_SCHEMA.sql       # Esquema completo de BD
├── SUPABASE_SETUP.md        # Guía de configuración
└── package.json             # Configuración monorepo
```

## 🔗 Endpoints de la API

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Producto específico
- `POST /api/products` - Crear producto (admin)

### Órdenes
- `GET /api/orders` - Listar órdenes
- `POST /api/orders` - Crear orden
- `PATCH /api/orders/:id/status` - Actualizar estado

### Agricultores
- `GET /api/farmers` - Listar agricultores
- `POST /api/farmers/:id/approve` - Aprobar agricultor

### Newsletter
- `POST /api/newsletter/subscribe` - Suscribirse
- `GET /api/newsletter/confirm/:token` - Confirmar

### Panel Admin
- `GET /api/admin/dashboard` - Estadísticas
- `GET /api/admin/activity` - Actividad reciente

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. 