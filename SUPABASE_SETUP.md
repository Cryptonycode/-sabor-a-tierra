# Configuración de Supabase para Sabor a Tierra

## 📋 Variables de Entorno Necesarias

Actualiza tu archivo `.env` con las siguientes variables de Supabase:

```env
# Configuración de Supabase (REEMPLAZAR las variables de PostgreSQL)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Secret para autenticación
JWT_SECRET=your_jwt_secret_key_here

# OAuth - Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# OAuth - Facebook
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Pasarelas de pago - RedSys
REDSYS_MERCHANT_CODE=your_merchant_code
REDSYS_SECRET_KEY=your_secret_key

# Pasarelas de pago - PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Configuración del servidor
PORT=3001
NODE_ENV=development

# URL del frontend (para CORS)
FRONTEND_URL=http://localhost:3000
```

## 🗄️ Estructura de Tablas en Supabase

Ejecuta estos comandos SQL en el editor SQL de Supabase para crear las tablas:

### 1. Tabla de Productos

```sql
-- Crear tabla products
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  price_per_kg DECIMAL(10,2),
  price_per_box DECIMAL(10,2),
  image_url VARCHAR NOT NULL,
  stock BOOLEAN DEFAULT true,
  categories TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear índices para productos
CREATE INDEX idx_products_categories ON products USING GIN (categories);
CREATE INDEX idx_products_stock ON products (stock);
CREATE INDEX idx_products_created_at ON products (created_at);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para products
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 2. Tabla de Órdenes

```sql
-- Crear tabla orders
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name VARCHAR NOT NULL,
  customer_email VARCHAR NOT NULL,
  customer_phone VARCHAR NOT NULL,
  shipping_address VARCHAR NOT NULL,
  shipping_city VARCHAR NOT NULL,
  shipping_postal_code VARCHAR NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) NOT NULL,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear índices para orders
CREATE INDEX idx_orders_customer_email ON orders (customer_email);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_created_at ON orders (created_at);

-- Trigger para orders
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 3. Tabla de Items de Órdenes

```sql
-- Crear tabla order_items
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear índices para order_items
CREATE INDEX idx_order_items_order_id ON order_items (order_id);
CREATE INDEX idx_order_items_product_id ON order_items (product_id);

-- Trigger para order_items
CREATE TRIGGER update_order_items_updated_at 
    BEFORE UPDATE ON order_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 4. Datos de Ejemplo (Opcional)

```sql
-- Insertar productos de ejemplo
INSERT INTO products (name, description, price, price_per_kg, image_url, categories) VALUES
('Tomates Raf', 'Tomates de la variedad Raf, cultivados de forma tradicional en Almería', 4.99, 4.99, 'https://images.pexels.com/photos/9475238/pexels-photo-9475238.jpeg?w=500&h=500&fit=crop', '{"verduras", "tomates"}'),
('Aceite de Oliva Virgen Extra', 'Aceite de oliva virgen extra de primera calidad, extraído en frío', 12.99, NULL, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&h=500&fit=crop', '{"aceites", "gourmet"}'),
('Naranjas Ecológicas', 'Naranjas ecológicas de Valencia, sin pesticidas ni químicos', 3.99, 3.99, 'https://images.unsplash.com/photo-1547514701-42782101795e?w=500&h=500&fit=crop', '{"frutas", "cítricos", "ecológico"}'),
('Aguacates Hass', 'Aguacates Hass maduros, perfectos para consumir', 5.99, 5.99, 'https://images.pexels.com/photos/3687927/pexels-photo-3687927.jpeg?w=500&h=500&fit=crop', '{"frutas", "aguacates"}');
```

## 🔧 Configuración de Políticas RLS (Row Level Security)

```sql
-- Habilitar RLS en las tablas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Políticas para products (lectura pública, escritura para admin)
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (true);

CREATE POLICY "Products are editable by authenticated users" ON products
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para orders (solo el cliente puede ver sus órdenes)
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.jwt() ->> 'email' = customer_email);

CREATE POLICY "Users can create orders" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update orders" ON orders
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas para order_items
CREATE POLICY "Order items are viewable by order owner" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.customer_email = auth.jwt() ->> 'email'
        )
    );

CREATE POLICY "Order items can be created" ON order_items
    FOR INSERT WITH CHECK (true);
```

## 🚀 Endpoints de la API

### Productos
- `GET /api/products` - Obtener todos los productos
- `GET /api/products?category=frutas` - Filtrar por categoría
- `GET /api/products?search=tomate` - Buscar productos
- `GET /api/products/:id` - Obtener producto por ID
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### Órdenes
- `GET /api/orders` - Obtener todas las órdenes
- `GET /api/orders?customer_email=email@ejemplo.com` - Órdenes por cliente
- `GET /api/orders/:id` - Obtener orden por ID
- `POST /api/orders` - Crear nueva orden
- `PATCH /api/orders/:id/status` - Actualizar estado
- `DELETE /api/orders/:id` - Eliminar orden
- `GET /api/orders/stats` - Estadísticas de órdenes

## 📝 Cambios Realizados

✅ **Eliminado:**
- TypeORM y sus dependencias
- Entidades de TypeORM (Product, Order, OrderItem)
- Configuración de PostgreSQL directo
- Dependencias: `typeorm`, `pg`, `class-validator`

✅ **Agregado:**
- Cliente de Supabase (`@supabase/supabase-js`)
- Servicios para Products y Orders
- Tipos TypeScript para la base de datos
- Rutas de API organizadas
- Manejo de errores mejorado
- Configuración CORS actualizada

✅ **Mantenido:**
- Configuración de Express
- Middleware de autenticación OAuth
- Estructura del proyecto compatible con el frontend
