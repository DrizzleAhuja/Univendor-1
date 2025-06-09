-- Alter color column in cart_items table to JSONB
ALTER TABLE cart_items
ALTER COLUMN color TYPE jsonb USING color::jsonb; 