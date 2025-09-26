-- ========================================
-- LIMPIAR Y RECREAR FUNCIONES SUPABASE
-- ========================================

-- 1. Eliminar funciones existentes si existen
DROP FUNCTION IF EXISTS get_farmer_products(uuid);
DROP FUNCTION IF EXISTS approve_farmer_application(uuid, uuid);
DROP FUNCTION IF EXISTS reject_farmer_application(uuid, uuid, text);
DROP FUNCTION IF EXISTS get_admin_dashboard_stats();

-- 2. Crear tabla farmer_applications si no existe
CREATE TABLE IF NOT EXISTS farmer_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Información personal
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  phone VARCHAR NOT NULL,
  
  -- Información del negocio
  business_name VARCHAR,
  production_type VARCHAR NOT NULL CHECK (production_type IN ('organic', 'conventional', 'integrated')),
  main_products TEXT NOT NULL,
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
  rejection_reason TEXT,
  notes TEXT,
  approved_by UUID REFERENCES admins(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Función para aprobar una solicitud y crear el agricultor
CREATE OR REPLACE FUNCTION approve_farmer_application(
  application_id UUID,
  admin_id UUID
) RETURNS UUID AS $$
DECLARE
  app_record RECORD;
  new_farmer_id UUID;
BEGIN
  -- Obtener la solicitud
  SELECT * INTO app_record 
  FROM farmer_applications 
  WHERE id = application_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found or already processed';
  END IF;
  
  -- Crear el agricultor
  INSERT INTO farmers (
    first_name, last_name, email, phone, business_name,
    description, short_description, address, city, postal_code, province,
    specialties, certifications, production_type, years_experience, hectares,
    profile_image_url, cover_image_url, status, verified, website, social_media
  ) VALUES (
    app_record.first_name,
    app_record.last_name,
    app_record.email,
    app_record.phone,
    app_record.business_name,
    app_record.description,
    SUBSTRING(app_record.description, 1, 150) || '...',
    app_record.address,
    app_record.city,
    app_record.postal_code,
    app_record.province,
    string_to_array(app_record.main_products, ','),
    string_to_array(COALESCE(app_record.certifications, ''), ','),
    app_record.production_type,
    app_record.farming_experience,
    app_record.hectares,
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=600&fit=crop',
    'approved',
    true,
    app_record.website,
    jsonb_build_object('website', COALESCE(app_record.website, ''))
  ) RETURNING id INTO new_farmer_id;
  
  -- Actualizar el estado de la solicitud
  UPDATE farmer_applications 
  SET 
    status = 'approved',
    approved_by = admin_id,
    approved_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = application_id;
  
  RETURN new_farmer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Función para rechazar una solicitud
CREATE OR REPLACE FUNCTION reject_farmer_application(
  application_id UUID,
  admin_id UUID,
  reason TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE farmer_applications 
  SET 
    status = 'rejected',
    rejection_reason = reason,
    approved_by = admin_id,
    approved_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = application_id AND status = 'pending';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Función para obtener productos de un agricultor
CREATE OR REPLACE FUNCTION get_farmer_products(farmer_id UUID)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  price DECIMAL,
  category VARCHAR,
  unit VARCHAR,
  is_available BOOLEAN,
  stock_quantity INTEGER,
  main_image_url VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.price,
    p.category,
    p.unit,
    p.is_available,
    p.stock_quantity,
    p.main_image_url,
    p.created_at
  FROM products p
  WHERE p.farmer_id = get_farmer_products.farmer_id
  AND p.status = 'published'
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Función para obtener estadísticas del dashboard
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'pending_applications', (SELECT COUNT(*) FROM farmer_applications WHERE status = 'pending'),
    'total_farmers', (SELECT COUNT(*) FROM farmers WHERE status = 'approved'),
    'total_products', (SELECT COUNT(*) FROM products WHERE status = 'published'),
    'total_customers', (SELECT COUNT(*) FROM customers),
    'recent_applications', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id', id,
          'name', first_name || ' ' || last_name,
          'email', email,
          'business_name', business_name,
          'main_products', main_products,
          'created_at', created_at
        ) ORDER BY created_at DESC
      ), '[]'::json)
      FROM farmer_applications 
      WHERE status = 'pending' 
      LIMIT 5
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger para updated_at (crear si no existe)
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger existente si existe y recrear
DROP TRIGGER IF EXISTS set_farmer_applications_updated_at ON farmer_applications;
CREATE TRIGGER set_farmer_applications_updated_at
    BEFORE UPDATE ON farmer_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- 8. Índices (crear si no existen)
CREATE INDEX IF NOT EXISTS idx_farmer_applications_email ON farmer_applications(email);
CREATE INDEX IF NOT EXISTS idx_farmer_applications_status ON farmer_applications(status);
CREATE INDEX IF NOT EXISTS idx_farmer_applications_created_at ON farmer_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_products_farmer_status ON products(farmer_id, status);

-- 9. Políticas de seguridad RLS
ALTER TABLE farmer_applications ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas existentes
DROP POLICY IF EXISTS "Admins can view all farmer applications" ON farmer_applications;
DROP POLICY IF EXISTS "Admins can update farmer applications" ON farmer_applications;
DROP POLICY IF EXISTS "Anyone can create farmer applications" ON farmer_applications;

-- Nuevas políticas
CREATE POLICY "Anyone can create farmer applications" ON farmer_applications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all farmer applications" ON farmer_applications
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true)
    );

CREATE POLICY "Admins can update farmer applications" ON farmer_applications
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true)
    );

-- ========================================
-- LISTO PARA USAR
-- ========================================
