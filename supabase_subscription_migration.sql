-- ============================================================
-- Astra Dairy — Subscription System Migration
-- Paste this ENTIRE file into Supabase SQL Editor and Run All
-- ============================================================

-- ── STEP 1: Extend subscriptions table ─────────────────────
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS frequency_type TEXT DEFAULT 'custom'
    CHECK (frequency_type IN ('daily', 'alternate', 'weekdays', 'custom')),
  ADD COLUMN IF NOT EXISTS selected_dates TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE;

-- ── STEP 2: Extend customers table ─────────────────────────
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS push_token TEXT,
  ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC(10,2) DEFAULT 0;

-- ── STEP 3: Extend wallet_transactions table ────────────────
-- (create it if it doesn't exist yet, else just add columns)
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  amount      NUMERIC(10,2) NOT NULL,
  type        TEXT DEFAULT 'debit' CHECK (type IN ('credit', 'debit')),
  description TEXT,
  status      TEXT DEFAULT 'completed',
  order_id    UUID REFERENCES orders(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE wallet_transactions
  ADD COLUMN IF NOT EXISTS type        TEXT DEFAULT 'debit',
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS status      TEXT DEFAULT 'completed',
  ADD COLUMN IF NOT EXISTS order_id    UUID REFERENCES orders(id);

-- ── STEP 4: RLS for wallet_transactions ────────────────────
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'wallet_transactions' AND policyname = 'Wallet transactions insert'
  ) THEN
    EXECUTE 'CREATE POLICY "Wallet transactions insert" ON wallet_transactions FOR INSERT WITH CHECK (true)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'wallet_transactions' AND policyname = 'Wallet transactions select'
  ) THEN
    EXECUTE 'CREATE POLICY "Wallet transactions select" ON wallet_transactions FOR SELECT USING (true)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'wallet_transactions' AND policyname = 'Wallet transactions update'
  ) THEN
    EXECUTE 'CREATE POLICY "Wallet transactions update" ON wallet_transactions FOR UPDATE USING (true)';
  END IF;
END $$;

-- ── STEP 5: add_wallet_funds RPC ───────────────────────────
-- Drop first to avoid return type conflicts with existing version
DROP FUNCTION IF EXISTS add_wallet_funds(UUID, NUMERIC, TEXT);

CREATE OR REPLACE FUNCTION add_wallet_funds(
  cust_id       UUID,
  amount_to_add NUMERIC,
  desctext      TEXT DEFAULT 'Wallet Top-up'
)
RETURNS void AS $$
BEGIN
  UPDATE customers
     SET wallet_balance = COALESCE(wallet_balance, 0) + amount_to_add
   WHERE id = cust_id;

  INSERT INTO wallet_transactions (customer_id, amount, type, description, status)
  VALUES (cust_id, amount_to_add, 'credit', desctext, 'completed');
END;
$$ LANGUAGE plpgsql;

-- ── STEP 6: deduct_wallet_for_delivery RPC ──────────────────
DROP FUNCTION IF EXISTS deduct_wallet_for_delivery(UUID, NUMERIC, UUID, TEXT);

CREATE OR REPLACE FUNCTION deduct_wallet_for_delivery(
  cust_id          UUID,
  amount_to_deduct NUMERIC,
  order_ref        UUID,
  desctext         TEXT DEFAULT 'Daily Delivery Deduction'
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance NUMERIC;
BEGIN
  SELECT COALESCE(wallet_balance, 0) INTO current_balance
    FROM customers WHERE id = cust_id;

  IF current_balance < amount_to_deduct THEN
    RETURN FALSE;
  END IF;

  UPDATE customers
     SET wallet_balance = wallet_balance - amount_to_deduct
   WHERE id = cust_id;

  INSERT INTO wallet_transactions (customer_id, amount, type, description, status, order_id)
  VALUES (cust_id, amount_to_deduct, 'debit', desctext, 'completed', order_ref);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ── STEP 7: Daily subscription processor ───────────────────
CREATE OR REPLACE FUNCTION process_daily_subscriptions()
RETURNS TABLE(processed INT, skipped INT) AS $$
DECLARE
  sub          RECORD;
  today_str    TEXT    := to_char(CURRENT_DATE, 'YYYY-MM-DD');
  new_order_id UUID;
  deduction    NUMERIC;
  success      BOOLEAN;
  proc_count   INT     := 0;
  skip_count   INT     := 0;
BEGIN
  FOR sub IN
    SELECT
      s.id,
      s.customer_id,
      s.product_id,
      s.quantity,
      s.unit_price,
      p.name  AS product_name,
      c.push_token
    FROM subscriptions s
    JOIN products  p ON s.product_id  = p.id
    JOIN customers c ON s.customer_id = c.id
    WHERE s.status = 'active'
      AND today_str = ANY(s.selected_dates)
  LOOP
    deduction := sub.unit_price * sub.quantity;

    SELECT deduct_wallet_for_delivery(
      sub.customer_id,
      deduction,
      NULL,
      'Daily delivery: ' || sub.product_name
    ) INTO success;

    IF success THEN
      INSERT INTO orders (customer_id, subscription_id, delivery_date, status, total_amount)
      VALUES (sub.customer_id, sub.id, CURRENT_DATE, 'pending', deduction)
      RETURNING id INTO new_order_id;

      -- Attach order_id to the wallet transaction just created
      UPDATE wallet_transactions
         SET order_id = new_order_id
       WHERE id = (
         SELECT id FROM wallet_transactions
          WHERE customer_id = sub.customer_id
            AND order_id IS NULL
          ORDER BY created_at DESC
          LIMIT 1
       );

      INSERT INTO order_items (order_id, product_id, quantity, unit_price)
      VALUES (new_order_id, sub.product_id, sub.quantity, sub.unit_price);

      proc_count := proc_count + 1;
    ELSE
      INSERT INTO orders (customer_id, subscription_id, delivery_date, status, total_amount)
      VALUES (sub.customer_id, sub.id, CURRENT_DATE, 'cancelled', deduction);

      skip_count := skip_count + 1;
    END IF;
  END LOOP;

  RETURN QUERY SELECT proc_count, skip_count;
END;
$$ LANGUAGE plpgsql;

-- ── STEP 8: updated_at trigger for subscriptions ───────────
CREATE OR REPLACE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── STEP 9: Schedule pg_cron (run AFTER enabling pg_cron extension) ─
-- Enable first: Supabase Dashboard → Database → Extensions → pg_cron → Enable
-- Then uncomment and run these two lines:
--
-- SELECT cron.unschedule('daily-subscription-processor');
-- SELECT cron.schedule('daily-subscription-processor', '30 18 * * *', $$SELECT * FROM process_daily_subscriptions()$$);

-- ── VERIFY: confirm new columns are present ─────────────────
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'subscriptions'
  AND column_name IN ('frequency_type', 'selected_dates', 'start_date', 'end_date')
ORDER BY column_name;
