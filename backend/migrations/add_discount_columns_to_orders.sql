-- Añadir columnas de descuento a la tabla orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS discount_code_used TEXT,
  ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;


