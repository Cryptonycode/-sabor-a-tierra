-- ========================================
-- ESQUEMA COMPLETO DE BASE DE DATOS PARA SABOR A TIERRA
-- E-commerce con usuarios, agricultores, productos y administración
-- ========================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Función para actualizar timestamps automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ========================================
-- 1. TABLA DE USUARIOS CLIENTES
-- ========================================
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR, -- Para autenticación local (opcional con OAuth)
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  phone VARCHAR,
  
  -- Dirección de envío por defecto
  default_shipping_address VARCHAR,
  default_shipping_city VARCHAR,
  default_shipping_postal_code VARCHAR,
  default_shipping_province VARCHAR,
  
  -- Configuraciones de cuenta
  email_verified BOOLEAN DEFAULT false,
  newsletter_subscribed BOOLEAN DEFAULT false,
  marketing_emails BOOLEAN DEFAULT true,
  
  -- OAuth providers (si se usa autenticación social)
  google_id VARCHAR UNIQUE,
  facebook_id VARCHAR UNIQUE,
  
  -- Metadatos
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para customers
CREATE INDEX idx_customers_email ON customers (email);
CREATE INDEX idx_customers_google_id ON customers (google_id);
CREATE INDEX idx_customers_facebook_id ON customers (facebook_id);
CREATE INDEX idx_customers_created_at ON customers (created_at);

-- Trigger para customers
CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 2. TABLA DE ADMINISTRADORES
-- ========================================
CREATE TABLE admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  
  -- Roles y permisos
  role VARCHAR DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin', 'moderator')),
  permissions TEXT[] DEFAULT '{}', -- Array de permisos específicos
  
  -- Estado de la cuenta
  is_active BOOLEAN DEFAULT true,
  
  -- Metadatos
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES admins(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para admins
CREATE INDEX idx_admins_email ON admins (email);
CREATE INDEX idx_admins_role ON admins (role);
CREATE INDEX idx_admins_is_active ON admins (is_active);

-- Trigger para admins
CREATE TRIGGER update_admins_updated_at 
    BEFORE UPDATE ON admins 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 3. TABLA DE AGRICULTORES
-- ========================================
CREATE TABLE farmers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Información personal
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  phone VARCHAR,
  
  -- Información del negocio
  business_name VARCHAR,
  description TEXT,
  short_description VARCHAR(200),
  story TEXT,
  
  -- Ubicación
  address VARCHAR NOT NULL,
  city VARCHAR NOT NULL,
  postal_code VARCHAR NOT NULL,
  province VARCHAR NOT NULL,
  coordinates VARCHAR, -- "lat,lng" format
  
  -- Especialidades y certificaciones
  specialties TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  production_type VARCHAR DEFAULT 'traditional' 
    CHECK (production_type IN ('traditional', 'organic', 'biodynamic', 'integrated', 'artisanal')),
  
  -- Experiencia y estadísticas
  years_experience INTEGER DEFAULT 0,
  hectares DECIMAL(10,2) DEFAULT 0,
  customers_served INTEGER DEFAULT 0,
  
  -- Imágenes
  profile_image_url VARCHAR,
  cover_image_url VARCHAR,
  
  -- Estado y verificación
  status VARCHAR DEFAULT 'pending' 
    CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  verified BOOLEAN DEFAULT false,
  
  -- Información de contacto opcional
  website VARCHAR,
  social_media JSONB DEFAULT '{}', -- {facebook: "", instagram: "", etc}
  
  -- Metadatos
  approved_by UUID REFERENCES admins(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para farmers
CREATE INDEX idx_farmers_email ON farmers (email);
CREATE INDEX idx_farmers_status ON farmers (status);
CREATE INDEX idx_farmers_province ON farmers (province);
CREATE INDEX idx_farmers_specialties ON farmers USING GIN (specialties);
CREATE INDEX idx_farmers_verified ON farmers (verified);

-- Trigger para farmers
CREATE TRIGGER update_farmers_updated_at 
    BEFORE UPDATE ON farmers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 4. TABLA DE PRODUCTOS
-- ========================================
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Información básica
  name VARCHAR NOT NULL,
  description TEXT NOT NULL,
  short_description VARCHAR(200),
  
  -- Precios
  price DECIMAL(10,2) NOT NULL,
  price_per_kg DECIMAL(10,2),
  price_per_box DECIMAL(10,2),
  
  -- Agricultor responsable
  farmer_id UUID REFERENCES farmers(id) ON DELETE RESTRICT,
  
  -- Categorización
  category VARCHAR NOT NULL,
  subcategory VARCHAR,
  tags TEXT[] DEFAULT '{}',
  
  -- Características del producto
  unit VARCHAR DEFAULT 'kg' CHECK (unit IN ('kg', 'caja', 'litro', 'unidad')),
  seasonality VARCHAR, -- "Enero-Marzo, Octubre-Diciembre"
  nutritional_info TEXT,
  storage_instructions TEXT,
  
  -- Características específicas del producto
  features TEXT[] DEFAULT '{}',
  
  -- Disponibilidad y stock
  is_available BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  min_order_quantity INTEGER DEFAULT 1,
  max_order_quantity INTEGER,
  
  -- Imágenes
  main_image_url VARCHAR NOT NULL,
  gallery_images TEXT[] DEFAULT '{}',
  
  -- SEO y marketing
  slug VARCHAR UNIQUE, -- Para URLs amigables
  meta_title VARCHAR,
  meta_description VARCHAR,
  
  -- Configuración de envío
  weight_per_unit DECIMAL(10,3), -- En kg
  requires_cold_shipping BOOLEAN DEFAULT false,
  
  -- Estado y visibilidad
  status VARCHAR DEFAULT 'draft' 
    CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN DEFAULT false,
  
  -- Metadatos
  created_by UUID REFERENCES admins(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para products
CREATE INDEX idx_products_farmer_id ON products (farmer_id);
CREATE INDEX idx_products_category ON products (category);
CREATE INDEX idx_products_status ON products (status);
CREATE INDEX idx_products_is_available ON products (is_available);
CREATE INDEX idx_products_featured ON products (featured);
CREATE INDEX idx_products_tags ON products USING GIN (tags);
CREATE INDEX idx_products_slug ON products (slug);
CREATE INDEX idx_products_created_at ON products (created_at);

-- Trigger para products
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 5. TABLA DE ÓRDENES
-- ========================================
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number VARCHAR UNIQUE NOT NULL, -- Número de orden legible
  
  -- Cliente (puede ser null para compras como invitado)
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  -- Información del cliente (guardada por si el cliente borra su cuenta)
  customer_email VARCHAR NOT NULL,
  customer_first_name VARCHAR NOT NULL,
  customer_last_name VARCHAR NOT NULL,
  customer_phone VARCHAR,
  
  -- Dirección de envío
  shipping_address VARCHAR NOT NULL,
  shipping_city VARCHAR NOT NULL,
  shipping_postal_code VARCHAR NOT NULL,
  shipping_province VARCHAR NOT NULL,
  shipping_notes TEXT,
  
  -- Montos
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Estado de la orden
  status VARCHAR DEFAULT 'pending' 
    CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  
  -- Información de pago
  payment_method VARCHAR, -- 'card', 'paypal', 'transfer', etc.
  payment_status VARCHAR DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed', 'refunded')),
  payment_reference VARCHAR, -- ID de la transacción de la pasarela
  
  -- Información de envío
  tracking_number VARCHAR,
  estimated_delivery_date DATE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadatos
  notes TEXT, -- Notas internas
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Función para generar número de orden único
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := 'ST' || TO_CHAR(NEW.created_at, 'YYYYMMDD') || '-' || 
                           LPAD(EXTRACT(EPOCH FROM NEW.created_at)::TEXT, 10, '0')::VARCHAR(10) || 
                           SUBSTRING(NEW.id::TEXT, 1, 4);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para generar número de orden
CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- Índices para orders
CREATE INDEX idx_orders_customer_id ON orders (customer_id);
CREATE INDEX idx_orders_customer_email ON orders (customer_email);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_payment_status ON orders (payment_status);
CREATE INDEX idx_orders_order_number ON orders (order_number);
CREATE INDEX idx_orders_created_at ON orders (created_at);

-- Trigger para orders
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 6. TABLA DE ITEMS DE ORDEN
-- ========================================
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  
  -- Información del producto al momento de la compra
  product_name VARCHAR NOT NULL,
  product_description TEXT,
  product_image_url VARCHAR,
  
  -- Detalles de la compra
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  
  -- Información del agricultor al momento de la compra
  farmer_name VARCHAR NOT NULL,
  farmer_id UUID REFERENCES farmers(id) ON DELETE RESTRICT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para order_items
CREATE INDEX idx_order_items_order_id ON order_items (order_id);
CREATE INDEX idx_order_items_product_id ON order_items (product_id);
CREATE INDEX idx_order_items_farmer_id ON order_items (farmer_id);

-- Trigger para order_items
CREATE TRIGGER update_order_items_updated_at 
    BEFORE UPDATE ON order_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 7. TABLA DE SUSCRIPCIONES AL NEWSLETTER
-- ========================================
CREATE TABLE newsletter_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  
  -- Información opcional
  first_name VARCHAR,
  last_name VARCHAR,
  
  -- Preferencias
  interests TEXT[] DEFAULT '{}', -- frutas, verduras, aceites, etc.
  frequency VARCHAR DEFAULT 'weekly' 
    CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  confirmed BOOLEAN DEFAULT false,
  confirmation_token VARCHAR UNIQUE,
  
  -- Relación con customer (si existe)
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  -- Metadatos
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  last_email_sent_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para newsletter_subscriptions
CREATE INDEX idx_newsletter_email ON newsletter_subscriptions (email);
CREATE INDEX idx_newsletter_is_active ON newsletter_subscriptions (is_active);
CREATE INDEX idx_newsletter_customer_id ON newsletter_subscriptions (customer_id);
CREATE INDEX idx_newsletter_interests ON newsletter_subscriptions USING GIN (interests);

-- Trigger para newsletter_subscriptions
CREATE TRIGGER update_newsletter_subscriptions_updated_at 
    BEFORE UPDATE ON newsletter_subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 8. TABLA DE APLICACIONES DE AGRICULTORES
-- ========================================
CREATE TABLE farmer_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Información personal
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  
  -- Información del negocio
  business_name VARCHAR,
  production_type VARCHAR NOT NULL,
  main_products VARCHAR NOT NULL,
  certifications VARCHAR,
  
  -- Ubicación
  address VARCHAR NOT NULL,
  postal_code VARCHAR NOT NULL,
  city VARCHAR NOT NULL,
  province VARCHAR NOT NULL,
  
  -- Descripción
  description TEXT,
  
  -- Estado de la aplicación
  status VARCHAR DEFAULT 'pending' 
    CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')),
  
  -- Notas del administrador
  admin_notes TEXT,
  
  -- Procesamiento
  reviewed_by UUID REFERENCES admins(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Cuando se aprueba, se guarda el farmer_id creado
  farmer_id UUID REFERENCES farmers(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para farmer_applications
CREATE INDEX idx_farmer_applications_email ON farmer_applications (email);
CREATE INDEX idx_farmer_applications_status ON farmer_applications (status);
CREATE INDEX idx_farmer_applications_reviewed_by ON farmer_applications (reviewed_by);
CREATE INDEX idx_farmer_applications_created_at ON farmer_applications (created_at);

-- Trigger para farmer_applications
CREATE TRIGGER update_farmer_applications_updated_at 
    BEFORE UPDATE ON farmer_applications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 9. CONFIGURACIÓN RLS (ROW LEVEL SECURITY)
-- ========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_applications ENABLE ROW LEVEL SECURITY;

-- Políticas para customers
CREATE POLICY "Customers can view their own data" ON customers
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Customers can update their own data" ON customers
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can create customer accounts" ON customers
    FOR INSERT WITH CHECK (true);

-- Políticas para admins
CREATE POLICY "Admins can view all admin data" ON admins
    FOR SELECT USING (auth.role() = 'authenticated' AND 
                     EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- Políticas para farmers (lectura pública, escritura para admins)
CREATE POLICY "Farmers are viewable by everyone" ON farmers
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Admins can manage farmers" ON farmers
    FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- Políticas para products (lectura pública, escritura para admins)
CREATE POLICY "Published products are viewable by everyone" ON products
    FOR SELECT USING (status = 'published' AND is_available = true);

CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- Políticas para orders
CREATE POLICY "Customers can view their own orders" ON orders
    FOR SELECT USING (customer_id = auth.uid() OR 
                     (customer_id IS NULL AND customer_email = auth.jwt() ->> 'email'));

CREATE POLICY "Anyone can create orders" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all orders" ON orders
    FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- Políticas para order_items
CREATE POLICY "Order items follow order permissions" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND (orders.customer_id = auth.uid() OR 
                 orders.customer_email = auth.jwt() ->> 'email' OR
                 EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()))
        )
    );

-- Políticas para newsletter
CREATE POLICY "Users can manage their own newsletter subscription" ON newsletter_subscriptions
    FOR ALL USING (customer_id = auth.uid() OR email = auth.jwt() ->> 'email');

CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscriptions
    FOR INSERT WITH CHECK (true);

-- Políticas para farmer applications
CREATE POLICY "Anyone can submit farmer applications" ON farmer_applications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Applicants can view their own applications" ON farmer_applications
    FOR SELECT USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Admins can manage farmer applications" ON farmer_applications
    FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- ========================================
-- 10. DATOS DE EJEMPLO
-- ========================================

-- Insertar admin por defecto
INSERT INTO admins (email, password_hash, first_name, last_name, role) VALUES
('admin@saboratierra.com', '$2b$10$example_hash', 'Admin', 'Principal', 'superadmin');

-- Insertar agricultores de ejemplo
INSERT INTO farmers (
    first_name, last_name, email, phone, business_name, description, short_description,
    address, city, postal_code, province, coordinates, specialties, certifications,
    production_type, years_experience, hectares, profile_image_url, cover_image_url,
    status, verified
) VALUES
('María', 'García', 'maria@saboratierra.com', '+34 950 123 456', 'Tomates García', 
 'Soy María García y cultivo tomates desde hace más de 20 años en los invernaderos de Almería. Mi familia lleva generaciones dedicándose a la agricultura, y hemos perfeccionado el arte de cultivar los mejores tomates Raf.',
 'Especialista en tomates Raf con más de 20 años de experiencia.',
 'Carretera Nacional 340, Km 15', 'Almería', '04007', 'Almería', '36.744531,-3.484281',
 ARRAY['Tomates', 'Pimientos', 'Pepinos'], ARRAY['Agricultura Ecológica', 'Comercio Justo'],
 'organic', 20, 5.0, 
 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=600&fit=crop',
 'approved', true),

('Juan', 'Martínez', 'juan@saboratierra.com', '+34 953 789 012', 'Olivares Martínez',
 'Mi familia produce aceite de oliva desde 1920 en los olivares de Jaén. Nuestros olivos centenarios dan un aceite de calidad excepcional.',
 'Productor de aceite de oliva virgen extra de cuarta generación.',
 'Camino de los Olivares, 23', 'Jaén', '23001', 'Jaén', '37.746036,-3.785061',
 ARRAY['Aceitunas', 'Aceite de Oliva'], ARRAY['Denominación de Origen', 'Calidad Premium'],
 'traditional', 25, 15.0,
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=1200&h=600&fit=crop',
 'approved', true);

-- Insertar productos de ejemplo
INSERT INTO products (
    name, description, short_description, price, price_per_kg, farmer_id, category,
    unit, main_image_url, is_available, status, featured
) VALUES
('Tomates Raf', 
 'Tomates Raf de agricultura ecológica, cultivados sin pesticidas en invernaderos sostenibles. Sabor intenso y textura carnosa perfecta para ensaladas.',
 'Tomates Raf ecológicos de sabor intenso',
 4.99, 4.99, 
 (SELECT id FROM farmers WHERE email = 'maria@saboratierra.com'),
 'vegetables', 'kg',
 'https://images.pexels.com/photos/9475238/pexels-photo-9475238.jpeg?w=500&h=500&fit=crop',
 true, 'published', true),

('Aceite de Oliva Virgen Extra',
 'Aceite de oliva virgen extra de primera presión en frío. Elaborado con aceitunas picual de nuestros olivares centenarios.',
 'AOVE de primera presión en frío',
 12.99, null,
 (SELECT id FROM farmers WHERE email = 'juan@saboratierra.com'),
 'oils', 'caja',
 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&h=500&fit=crop',
 true, 'published', true);

-- ========================================
-- 11. FUNCIONES ÚTILES
-- ========================================

-- Función para obtener estadísticas del dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_customers', (SELECT COUNT(*) FROM customers),
        'total_farmers', (SELECT COUNT(*) FROM farmers WHERE status = 'approved'),
        'total_products', (SELECT COUNT(*) FROM products WHERE status = 'published'),
        'total_orders', (SELECT COUNT(*) FROM orders),
        'pending_applications', (SELECT COUNT(*) FROM farmer_applications WHERE status = 'pending'),
        'revenue_this_month', (
            SELECT COALESCE(SUM(total_amount), 0) 
            FROM orders 
            WHERE created_at >= date_trunc('month', CURRENT_DATE)
            AND payment_status = 'paid'
        ),
        'orders_this_month', (
            SELECT COUNT(*) 
            FROM orders 
            WHERE created_at >= date_trunc('month', CURRENT_DATE)
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener productos por agricultor
CREATE OR REPLACE FUNCTION get_farmer_products(farmer_uuid UUID)
RETURNS TABLE(
    id UUID,
    name VARCHAR,
    price DECIMAL,
    category VARCHAR,
    is_available BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.name, p.price, p.category, p.is_available
    FROM products p
    WHERE p.farmer_id = farmer_uuid
    AND p.status = 'published'
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 8. APLICACIONES DE AGRICULTORES
-- ========================================

CREATE TABLE farmer_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Información personal
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  
  -- Información del negocio
  business_name VARCHAR,
  production_type VARCHAR NOT NULL CHECK (production_type IN ('organic', 'conventional', 'integrated')),
  main_products VARCHAR NOT NULL,
  certifications VARCHAR,
  
  -- Ubicación
  address VARCHAR NOT NULL,
  postal_code VARCHAR NOT NULL,
  city VARCHAR NOT NULL,
  province VARCHAR NOT NULL,
  
  -- Experiencia
  farming_experience INTEGER NOT NULL,
  hectares DECIMAL(10,2),
  description TEXT NOT NULL,
  
  -- Información adicional
  website VARCHAR,
  social_media VARCHAR,
  
  -- Estado de la aplicación
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  approved_by UUID REFERENCES admins(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para farmer_applications
CREATE INDEX idx_farmer_applications_email ON farmer_applications(email);
CREATE INDEX idx_farmer_applications_status ON farmer_applications(status);
CREATE INDEX idx_farmer_applications_created_at ON farmer_applications(created_at);

-- Trigger para updated_at
CREATE TRIGGER set_farmer_applications_updated_at
    BEFORE UPDATE ON farmer_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- RLS para farmer_applications
ALTER TABLE farmer_applications ENABLE ROW LEVEL SECURITY;

-- Política: Los administradores pueden ver todas las aplicaciones
CREATE POLICY "Admins can view all farmer applications" ON farmer_applications
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM admins WHERE admins.id = auth.uid()
    ));

-- Política: Los administradores pueden actualizar aplicaciones
CREATE POLICY "Admins can update farmer applications" ON farmer_applications
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM admins WHERE admins.id = auth.uid()
    ));

-- Política: Cualquiera puede crear una aplicación (registro público)
CREATE POLICY "Anyone can create farmer applications" ON farmer_applications
    FOR INSERT WITH CHECK (true);

-- ========================================
-- ESQUEMA COMPLETADO
-- Base de datos lista para e-commerce completo con:
-- ✅ Usuarios clientes registrados
-- ✅ Sistema de administración con roles
-- ✅ Gestión completa de agricultores
-- ✅ Catálogo de productos avanzado
-- ✅ Sistema de órdenes y pagos
-- ✅ Newsletter y marketing
-- ✅ Aplicaciones de nuevos agricultores
-- ✅ Seguridad con RLS
-- ✅ Funciones auxiliares
-- ========================================
