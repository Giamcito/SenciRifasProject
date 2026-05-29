ALTER TABLE boletos
  MODIFY estado_venta VARCHAR(20) NOT NULL;

UPDATE boletos
SET estado_venta = 'ABONADO'
WHERE estado_venta = 'RESERVADO';
