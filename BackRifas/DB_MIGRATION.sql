-- Add monto_abonado column to boletos
ALTER TABLE boletos
  ADD COLUMN monto_abonado DECIMAL(12,2) NOT NULL DEFAULT 0;

-- Optional: convert RESERVADO to ABONADO if desired
-- UPDATE boletos SET estado_venta = 'ABONADO' WHERE estado_venta = 'RESERVADO';
