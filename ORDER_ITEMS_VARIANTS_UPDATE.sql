-- ========================================
-- SOPORTE DE VARIANTES EN ITEMS DE PEDIDO
-- ========================================
-- Ejecutar en el editor SQL de Supabase ANTES de desplegar el código
-- que guarda y consulta variantes en los pedidos.
--
-- Sin la clave foránea, PostgREST rechaza el join
-- order_items(*, product_variants(*)) con el error:
-- "Could not find a relationship between 'order_items' and 'product_variants'"

-- 1. Columna que referencia la variante comprada
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS variant_id UUID;

-- 2. Clave foránea hacia product_variants.
--    ON DELETE SET NULL: si se borra la variante del catálogo, el pedido
--    histórico sobrevive apoyándose en el snapshot de product_name.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'order_items_variant_id_fkey'
  ) THEN
    ALTER TABLE order_items
      ADD CONSTRAINT order_items_variant_id_fkey
      FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Índice para las consultas de pedidos por variante
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON order_items (variant_id);

-- 4. Refrescar la caché de esquema de PostgREST para que el join
--    esté disponible de inmediato sin reiniciar el proyecto.
NOTIFY pgrst, 'reload schema';

-- ========================================
-- VERIFICACIÓN
-- ========================================
-- Debe devolver una fila con column_name = 'variant_id'
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'order_items' AND column_name = 'variant_id';
