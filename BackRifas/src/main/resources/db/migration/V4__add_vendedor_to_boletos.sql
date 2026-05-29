ALTER TABLE boletos
  ADD COLUMN vendedor_id BIGINT NULL,
  ADD COLUMN vendedor_nombre VARCHAR(255) NULL;