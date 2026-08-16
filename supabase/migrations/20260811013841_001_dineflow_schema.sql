/*
# DineFlow Core Schema

## Overview
Creates the complete production schema for the DineFlow restaurant platform:
users (profiles), restaurants, menu categories, menu items, tables,
reservations, orders, order items, payments, reviews, notifications,
restaurant applications, complaints, and audit logs.

## Tables

1. **profiles** — Extends auth.users with name, phone, role. Role is set at signup
   and is immutable from the frontend (enforced by RLS + trigger).
2. **restaurants** — Owned by a user (owner_id). Status controls public visibility.
3. **menu_categories** — Per-restaurant categories (e.g. Starters, Biriyani).
4. **menu_items** — Food items belonging to a menu category and restaurant.
5. **restaurant_tables** — Physical tables in a restaurant with seating area, capacity, status.
6. **reservations** — A customer booking a table at a restaurant on a date/time.
7. **orders** — Food pre-orders, optionally linked to a reservation.
8. **order_items** — Individual line items in an order (price snapshot from menu_items).
9. **payments** — Payment records for orders and reservation deposits.
10. **reviews** — Customer reviews of restaurants, with optional owner reply.
11. **notifications** — In-app notifications for users.
12. **restaurant_applications** — Owner registration applications for admin review.
13. **complaints** — Platform complaints/reports.
14. **audit_logs** — Audit trail of important actions.

## Security
- RLS enabled on every table.
- Detailed policies are in migration 002.

## Notes
- All IDs are uuid with gen_random_uuid() defaults.
- Timestamps are timestamptz defaulting to now().
- Foreign keys use ON DELETE CASCADE where appropriate.
- Array columns (cuisine, amenities, photos, working_days) use text[].
*/

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text NOT NULL,
  phone text DEFAULT '',
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','owner','admin')),
  avatar text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- RESTAURANTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  cuisine text[] DEFAULT '{}',
  phone text DEFAULT '',
  email text DEFAULT '',
  address text DEFAULT '',
  city text DEFAULT '',
  district text DEFAULT '',
  state text DEFAULT '',
  postal_code text DEFAULT '',
  landmark text DEFAULT '',
  lat double precision DEFAULT 0,
  lng double precision DEFAULT 0,
  opening_hours text DEFAULT '11:00',
  closing_hours text DEFAULT '23:00',
  working_days text[] DEFAULT '{"Mon","Tue","Wed","Thu","Fri","Sat","Sun"}',
  seating_capacity integer NOT NULL DEFAULT 50,
  price_range smallint NOT NULL DEFAULT 2 CHECK (price_range BETWEEN 1 AND 4),
  rating numeric(2,1) NOT NULL DEFAULT 0,
  review_count integer NOT NULL DEFAULT 0,
  logo text DEFAULT '',
  cover text DEFAULT '',
  photos text[] DEFAULT '{}',
  amenities text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending_review' CHECK (status IN ('draft','submitted','pending_review','approved','rejected','suspended')),
  online_capacity integer NOT NULL DEFAULT 0,
  walk_in_capacity integer NOT NULL DEFAULT 0,
  flexible_capacity integer NOT NULL DEFAULT 0,
  grace_period integer NOT NULL DEFAULT 15,
  deposit_enabled boolean NOT NULL DEFAULT false,
  deposit_amount numeric(10,2) NOT NULL DEFAULT 0,
  max_prep_load integer NOT NULL DEFAULT 10,
  cancellation_policy jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON public.restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_status ON public.restaurants(status);
CREATE INDEX IF NOT EXISTS idx_restaurants_city ON public.restaurants(city);

-- ============================================================
-- MENU CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.menu_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_menu_categories_restaurant ON public.menu_categories(restaurant_id);

-- ============================================================
-- MENU ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.menu_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  discount_price numeric(10,2) DEFAULT NULL CHECK (discount_price IS NULL OR discount_price >= 0),
  image text DEFAULT '',
  is_veg boolean NOT NULL DEFAULT true,
  available boolean NOT NULL DEFAULT true,
  prep_time integer NOT NULL DEFAULT 15 CHECK (prep_time >= 0),
  prep_category text NOT NULL DEFAULT 'standard' CHECK (prep_category IN ('quick','standard','long','after_arrival')),
  spice_level text DEFAULT '' CHECK (spice_level IN ('','mild','medium','hot','extra_hot')),
  allergens text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  popular boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON public.menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category_id);

-- ============================================================
-- RESTAURANT TABLES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.restaurant_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  code text NOT NULL,
  capacity integer NOT NULL DEFAULT 4 CHECK (capacity > 0),
  area text NOT NULL DEFAULT 'main_hall' CHECK (area IN ('main_hall','family','outdoor','private','vip')),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available','reserved','occupied','cleaning','unavailable')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, code)
);
CREATE INDEX IF NOT EXISTS idx_tables_restaurant ON public.restaurant_tables(restaurant_id);

-- ============================================================
-- RESERVATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_code text UNIQUE NOT NULL DEFAULT upper('DF' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  table_id uuid REFERENCES public.restaurant_tables(id) ON DELETE SET NULL,
  date date NOT NULL,
  time text NOT NULL,
  guests integer NOT NULL DEFAULT 2 CHECK (guests > 0),
  duration integer NOT NULL DEFAULT 90,
  seating_area text NOT NULL DEFAULT 'main_hall' CHECK (seating_area IN ('main_hall','family','outdoor','private','vip')),
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending','confirmed','seated','completed','cancelled','no_show')),
  arrival_status text NOT NULL DEFAULT 'on_time' CHECK (arrival_status IN ('on_time','en_route','running_late','arrived')),
  arrival_time text DEFAULT '',
  expected_arrival text DEFAULT '',
  prep_start_time text DEFAULT '',
  prep_status text NOT NULL DEFAULT 'scheduled' CHECK (prep_status IN ('new','scheduled','preparing','ready','served','completed','cancelled')),
  qr_code text DEFAULT '',
  deposit numeric(10,2) DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reservations_restaurant ON public.reservations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_customer ON public.reservations(customer_id);
CREATE INDEX IF NOT EXISTS idx_reservations_table ON public.reservations(table_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON public.reservations(date);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code text UNIQUE NOT NULL DEFAULT upper('ORD' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reservation_id uuid REFERENCES public.reservations(id) ON DELETE SET NULL,
  total numeric(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  status text NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment','payment_failed','confirmed','scheduled','preparing','ready','served','completed','cancelled','refunded')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','processing','paid','failed','cancelled','refund_pending','refunded','partially_refunded')),
  prep_option text NOT NULL DEFAULT 'confirm_later' CHECK (prep_option IN ('confirm_later','prepare_on_arrival')),
  scheduled_prep_time text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON public.orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_reservation ON public.orders(reservation_id);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES public.menu_items(id) ON DELETE SET NULL,
  name text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  image text DEFAULT '',
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  instructions text DEFAULT '',
  prep_time integer NOT NULL DEFAULT 15,
  prep_category text NOT NULL DEFAULT 'standard'
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_code text UNIQUE NOT NULL DEFAULT upper('PAY' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  reservation_id uuid REFERENCES public.reservations(id) ON DELETE SET NULL,
  customer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','paid','failed','cancelled','refund_pending','refunded','partially_refunded')),
  type text NOT NULL DEFAULT 'order' CHECK (type IN ('order','deposit')),
  gateway text DEFAULT '',
  gateway_payment_id text DEFAULT '',
  refund_amount numeric(10,2) DEFAULT 0,
  refund_reason text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON public.payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_restaurant ON public.payments(restaurant_id);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text DEFAULT '',
  owner_reply text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON public.reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer ON public.reviews(customer_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text DEFAULT '',
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('success','info','warning','error')),
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

-- ============================================================
-- RESTAURANT APPLICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.restaurant_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_name text NOT NULL,
  owner_email text NOT NULL,
  owner_phone text DEFAULT '',
  restaurant_name text NOT NULL,
  description text DEFAULT '',
  cuisine text[] DEFAULT '{}',
  restaurant_phone text DEFAULT '',
  restaurant_email text DEFAULT '',
  address text DEFAULT '',
  city text DEFAULT '',
  district text DEFAULT '',
  state text DEFAULT '',
  postal_code text DEFAULT '',
  landmark text DEFAULT '',
  opening_hours text DEFAULT '11:00',
  closing_hours text DEFAULT '23:00',
  seating_capacity integer NOT NULL DEFAULT 50,
  tables_count integer NOT NULL DEFAULT 15,
  price_range smallint NOT NULL DEFAULT 2 CHECK (price_range BETWEEN 1 AND 4),
  amenities text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_notes text DEFAULT '',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_applications_owner ON public.restaurant_applications(owner_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.restaurant_applications(status);

-- ============================================================
-- COMPLAINTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('fake_restaurant','incorrect_info','reservation','payment','service')),
  reporter_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reporter_name text NOT NULL,
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','investigating','resolved','dismissed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  role text DEFAULT '',
  action text NOT NULL,
  resource text DEFAULT '',
  resource_id text DEFAULT '',
  details jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_logs(action);

-- ============================================================
-- PASSWORD RESET TOKENS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_hash ON public.password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_user ON public.password_reset_tokens(user_id);
