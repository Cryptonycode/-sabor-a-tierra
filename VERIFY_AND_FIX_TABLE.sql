-- SCRIPT PARA VERIFICAR Y CORREGIR LA TABLA farmer_applications

-- 1. Eliminar tabla si existe (para recrearla limpia)
DROP TABLE IF EXISTS farmer_applications CASCADE;

-- 2. Crear tabla farmer_applications con estructura COMPLETA
CREATE TABLE farmer_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
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

-- 3. Crear índices
CREATE INDEX idx_farmer_applications_email ON farmer_applications(email);
CREATE INDEX idx_farmer_applications_status ON farmer_applications(status);
CREATE INDEX idx_farmer_applications_created_at ON farmer_applications(created_at);

-- 4. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_farmer_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_farmer_applications_updated_at
    BEFORE UPDATE ON farmer_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_farmer_applications_updated_at();

-- 5. Habilitar RLS (Row Level Security)
ALTER TABLE farmer_applications ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS
CREATE POLICY "Allow anonymous insert" ON farmer_applications
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow service role all" ON farmer_applications
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 7. Verificar que la tabla se creó correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'farmer_applications' 
ORDER BY ordinal_position;
