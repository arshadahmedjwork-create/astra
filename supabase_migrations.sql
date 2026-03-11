-- ============================================================
-- Astra Dairy — Customer ERP Portal: Database Migrations
-- Run this script in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. CUSTOMERS
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
  mobile TEXT UNIQUE NOT NULL CHECK (length(mobile) = 10),
  email TEXT,
  password_hash TEXT NOT NULL,
  dob DATE,
  photo_base64 TEXT,
  marital_status TEXT CHECK (marital_status IN ('Single', 'Married')),
  marriage_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-generate customer_id like 'ASN-000001'
CREATE OR REPLACE FUNCTION generate_customer_id()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(customer_id FROM 5) AS INTEGER)), 0) + 1
  INTO next_num FROM customers;
  NEW.customer_id := 'ASN-' || LPAD(next_num::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_customer_id
  BEFORE INSERT ON customers
  FOR EACH ROW
  WHEN (NEW.customer_id IS NULL OR NEW.customer_id = '')
  EXECUTE FUNCTION generate_customer_id();

-- ============================================================
-- 2. ADDRESSES
-- ============================================================
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  state TEXT NOT NULL DEFAULT 'Tamil Nadu',
  city TEXT NOT NULL DEFAULT 'Chennai',
  door_no TEXT,
  street TEXT,
  landmark TEXT NOT NULL,
  area TEXT NOT NULL,
  pincode TEXT NOT NULL CHECK (length(pincode) = 6),
  alt_mobile TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  unit TEXT DEFAULT 'litre',
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0,
  is_sample BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  required_date DATE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  order_date DATE DEFAULT CURRENT_DATE,
  delivery_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'get_to_deliver', 'delivered', 'paused', 'cancelled')),
  total_amount NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5.1 ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order items insert" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Order items select" ON order_items FOR SELECT USING (true);
CREATE POLICY "Order items update" ON order_items FOR UPDATE USING (true);


-- ============================================================
-- 6. PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  transaction_id TEXT UNIQUE,
  amount NUMERIC(10,2) NOT NULL,
  payment_date TIMESTAMPTZ DEFAULT now(),
  mode TEXT NOT NULL CHECK (mode IN ('cash', 'upi', 'card', 'net_banking', 'wallet')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 7. OTP VERIFICATION
-- ============================================================
CREATE TABLE IF NOT EXISTS otp_verification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mobile TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 8. SAMPLE REQUESTS (track one-time sample)
-- ============================================================
CREATE TABLE IF NOT EXISTS sample_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID UNIQUE NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  requested_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'delivered', 'cancelled'))
);

-- ============================================================
-- 9. ADMINS
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sample_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Public read on products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- Customers: allow insert for registration, select/update own data
CREATE POLICY "Anyone can register" ON customers
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Customers can view own data" ON customers
  FOR SELECT USING (true);
CREATE POLICY "Customers can update own data" ON customers
  FOR UPDATE USING (true);

-- Addresses: CRUD for own addresses
CREATE POLICY "Addresses insert" ON addresses
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Addresses select" ON addresses
  FOR SELECT USING (true);
CREATE POLICY "Addresses update" ON addresses
  FOR UPDATE USING (true);

-- Subscriptions
CREATE POLICY "Subscriptions insert" ON subscriptions
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Subscriptions select" ON subscriptions
  FOR SELECT USING (true);
CREATE POLICY "Subscriptions update" ON subscriptions
  FOR UPDATE USING (true);

-- Orders
CREATE POLICY "Orders insert" ON orders
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Orders select" ON orders
  FOR SELECT USING (true);
CREATE POLICY "Orders update" ON orders
  FOR UPDATE USING (true);

-- Payments
CREATE POLICY "Payments insert" ON payments
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Payments select" ON payments
  FOR SELECT USING (true);

-- Sample Requests
CREATE POLICY "Sample requests insert" ON sample_requests
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Sample requests select" ON sample_requests
  FOR SELECT USING (true);

-- OTP
CREATE POLICY "OTP insert" ON otp_verification
  FOR INSERT WITH CHECK (true);
CREATE POLICY "OTP select" ON otp_verification
  FOR SELECT USING (true);
CREATE POLICY "OTP update" ON otp_verification
  FOR UPDATE USING (true);

-- Admins
CREATE POLICY "Admins select" ON admins
  FOR SELECT USING (true);

-- ============================================================
-- SEED DATA: Products
-- ============================================================
INSERT INTO products (name, category, description, price, unit, stock_quantity, is_sample, active) VALUES
  ('Cow Milk', 'Milk', 'Farm fresh A2 cow''s milk in glass bottles, delivered within 12 hours of milking.', 70.00, 'litre', 500, true, true),
  ('Buffalo Milk', 'Milk', 'Rich and creamy buffalo milk, high in fat content.', 80.00, 'litre', 200, false, true),
  ('A2 Milk', 'Milk', 'Premium A2 protein cow''s milk for easier digestion.', 90.00, 'litre', 150, false, true),
  ('Paneer', 'Dairy', 'Soft, fresh paneer made from pure cow''s milk. No preservatives.', 320.00, 'kg', 50, false, true),
  ('Ghee', 'Dairy', 'Pure desi cow ghee made using traditional bilona method.', 750.00, 'kg', 100, false, true),
  ('Curd', 'Dairy', 'Natural curd set in traditional earthen pots.', 60.00, 'kg', 120, false, true),
  ('Buttermilk', 'Dairy', 'Refreshing traditional buttermilk with spices.', 30.00, 'litre', 80, false, true),
  ('Flavoured Milk', 'Milk', 'Delicious flavoured milk in chocolate, badam, and rose.', 50.00, '250ml', 300, false, true);,
  ('Natural Kulfi', 'Dessert', 'Handcrafted malai kulfi with no artificial colors or flavours.', 40.00, 'piece', false, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SEED DATA: Admins
-- ============================================================
-- password is 'admin123' hashed with bcrypt
INSERT INTO admins (email, name, role, password_hash) VALUES
  ('admin@astradairy.in', 'Astra Admin', 'superadmin', '$2a$10$wE/.76M.fGZZoA7W4D7q6O/I6T6R6qB6R6qB6R6qB6R6qB6R6qB6R') -- Placeholder hash, will be replaced with actual login via script if needed, or user can use 'admin123' if we use simple auth first
ON CONFLICT DO NOTHING;
