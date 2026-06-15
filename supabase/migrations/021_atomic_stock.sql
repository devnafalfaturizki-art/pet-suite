-- Atomic stock decrement function to prevent race conditions
CREATE OR REPLACE FUNCTION decrement_product_stock(variant_id uuid, qty int)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE product_variants SET stock = GREATEST(0, stock - qty) WHERE id = variant_id;
END;
$$;

-- Atomic loyalty points increment function to prevent race conditions
CREATE OR REPLACE FUNCTION increment_loyalty_points(customer_id uuid, points int)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE customers SET loyalty_points = loyalty_points + points WHERE id = customer_id;
END;
$$;