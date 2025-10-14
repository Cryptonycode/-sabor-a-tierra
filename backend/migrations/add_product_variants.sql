-- ========================================
-- TABLA DE VARIANTES DE PRODUCTOS
-- ========================================

CREATE TABLE IF NOT EXISTS product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Información de la variante
  name VARCHAR(255) NOT NULL, -- ej: "Caja 5kg", "Pack 2 unidades"
  description TEXT,
  
  -- Precio y stock específicos
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  
  -- SKU único para la variante
  sku VARCHAR(100) UNIQUE,
  
  -- Atributos específicos (opcional)
  weight DECIMAL(10,3), -- En kg
  unit VARCHAR(50), -- ej: "kg", "unidad", "caja"
  pieces INTEGER, -- Número de piezas si es un pack
  
  -- Disponibilidad
  is_available BOOLEAN DEFAULT true,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku) WHERE sku IS NOT NULL;
CREATE INDEX idx_product_variants_is_available ON product_variants(is_available);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_product_variants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_product_variants_updated_at();

-- Vista para productos con sus variantes
CREATE OR REPLACE VIEW products_with_variants AS
SELECT 
  p.*,
  COALESCE(
    json_agg(
      json_build_object(
        'id', pv.id,
        'name', pv.name,
        'description', pv.description,
        'price', pv.price,
        'stock_quantity', pv.stock_quantity,
        'sku', pv.sku,
        'weight', pv.weight,
        'unit', pv.unit,
        'pieces', pv.pieces,
        'is_available', pv.is_available
      ) ORDER BY pv.price
    ) FILTER (WHERE pv.id IS NOT NULL),
    '[]'::json
  ) as variants
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
GROUP BY p.id;

-- Comentarios para documentación
COMMENT ON TABLE product_variants IS 'Variantes de productos (diferentes tamaños, presentaciones, etc.)';
COMMENT ON COLUMN product_variants.product_id IS 'ID del producto padre';
COMMENT ON COLUMN product_variants.name IS 'Nombre de la variante (ej: "Caja 5kg")';
COMMENT ON COLUMN product_variants.sku IS 'Código SKU único para la variante';
COMMENT ON COLUMN product_variants.pieces IS 'Número de piezas/unidades en esta variante';

