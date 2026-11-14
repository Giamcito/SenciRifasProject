-- Flyway migration: Add cifras column to rifas
ALTER TABLE rifas
  ADD COLUMN cifras INT NULL;

UPDATE rifas
  SET cifras = IF(cantidad_boletos <= 1, 1, LENGTH(cantidad_boletos - 1))
  WHERE cifras IS NULL;
