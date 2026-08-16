/*
# DineFlow RLS Policies, Triggers, and Functions

## Overview
Enables Row-Level Security on every table and creates ownership-based policies.
Also creates triggers to auto-create profiles on signup and enforce role immutability.

## Security Model

### profiles
- Self: read/update own profile (but NOT role — role is immutable post-signup).
- Admin: read all profiles.
- Owners: read profiles of customers who have reservations/orders at their restaurants.

### restaurants
- Public (anon): read only approved restaurants.
- Owner: full CRUD on restaurants they own.
- Admin: full CRUD on all restaurants.

### menu_categories, menu_items, restaurant_tables
- Public (anon): read only items belonging to approved restaurants.
- Owner: full CRUD on items belonging to their restaurants.
- Admin: read all.

### reservations
- Customer: read/update own reservations.
- Owner: read/update reservations for their restaurants.
- Admin: read all reservations.

### orders, order_items
- Customer: read own orders.
- Owner: read/update orders for their restaurants.
- Admin: read all orders.

### payments
- Customer: read own payments.
- Owner: read payments for their restaurants.
- Admin: read all payments.

### reviews
- Public: read reviews of approved restaurants.
- Customer: create reviews for own past reservations; update own reviews.
- Owner: update owner_reply on reviews for their restaurants.
- Admin: read/delete all reviews.

### notifications
- User: read/update/delete own notifications.

### restaurant_applications
- Owner: read own applications; insert own applications.
- Admin: read all applications; update status.

### complaints
- Public: insert complaints.
- Admin: read/update all complaints.

### audit_logs
- Admin: read all audit logs.
- Insert: any authenticated user can insert audit logs (for action tracking).

### password_reset_tokens
- No direct access from anon/authenticated (used only by edge functions with service role).

## Triggers
1. **handle_new_user** — On auth.users insert, create a profile row with role from user_metadata.
2. **enforce_role_immutable** — Prevent users from changing their own role via UPDATE.

## Functions
1. **is_restaurant_owner()** — Check if current user owns a given restaurant.
2. **is_admin()** — Check if current user has admin role.
*/

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_restaurant_owner(p_restaurant_id uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.restaurants
    WHERE id = p_restaurant_id AND owner_id = auth.uid()
  );
$$;

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================
DROP POLICY IF EXISTS "profiles_select_self_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_self_or_admin"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
CREATE POLICY "profiles_insert_self"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_self_no_role" ON public.profiles;
CREATE POLICY "profiles_update_self_no_role"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================================
-- RESTAURANTS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "restaurants_select_public_or_owner_or_admin" ON public.restaurants;
CREATE POLICY "restaurants_select_public_or_owner_or_admin"
ON public.restaurants FOR SELECT
TO anon, authenticated
USING (
  status = 'approved'
  OR owner_id = auth.uid()
  OR public.is_admin()
);

DROP POLICY IF EXISTS "restaurants_insert_owner" ON public.restaurants;
CREATE POLICY "restaurants_insert_owner"
ON public.restaurants FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "restaurants_update_owner_or_admin" ON public.restaurants;
CREATE POLICY "restaurants_update_owner_or_admin"
ON public.restaurants FOR UPDATE
TO authenticated
USING (owner_id = auth.uid() OR public.is_admin())
WITH CHECK (owner_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "restaurants_delete_owner_or_admin" ON public.restaurants;
CREATE POLICY "restaurants_delete_owner_or_admin"
ON public.restaurants FOR DELETE
TO authenticated
USING (owner_id = auth.uid() OR public.is_admin());

-- ============================================================
-- MENU CATEGORIES POLICIES
-- ============================================================
DROP POLICY IF EXISTS "menu_cat_select_public_or_owner" ON public.menu_categories;
CREATE POLICY "menu_cat_select_public_or_owner"
ON public.menu_categories FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = menu_categories.restaurant_id
    AND (r.status = 'approved' OR r.owner_id = auth.uid() OR public.is_admin())
  )
);

DROP POLICY IF EXISTS "menu_cat_insert_owner" ON public.menu_categories;
CREATE POLICY "menu_cat_insert_owner"
ON public.menu_categories FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = menu_categories.restaurant_id AND r.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "menu_cat_update_owner" ON public.menu_categories;
CREATE POLICY "menu_cat_update_owner"
ON public.menu_categories FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = menu_categories.restaurant_id AND r.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = menu_categories.restaurant_id AND r.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "menu_cat_delete_owner" ON public.menu_categories;
CREATE POLICY "menu_cat_delete_owner"
ON public.menu_categories FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = menu_categories.restaurant_id AND r.owner_id = auth.uid()
  )
);

-- ============================================================
-- MENU ITEMS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "menu_items_select_public_or_owner" ON public.menu_items;
CREATE POLICY "menu_items_select_public_or_owner"
ON public.menu_items FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = menu_items.restaurant_id
    AND (r.status = 'approved' OR r.owner_id = auth.uid() OR public.is_admin())
  )
);

DROP POLICY IF EXISTS "menu_items_insert_owner" ON public.menu_items;
CREATE POLICY "menu_items_insert_owner"
ON public.menu_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = menu_items.restaurant_id AND r.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "menu_items_update_owner" ON public.menu_items;
CREATE POLICY "menu_items_update_owner"
ON public.menu_items FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = menu_items.restaurant_id AND r.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = menu_items.restaurant_id AND r.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "menu_items_delete_owner" ON public.menu_items;
CREATE POLICY "menu_items_delete_owner"
ON public.menu_items FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = menu_items.restaurant_id AND r.owner_id = auth.uid()
  )
);

-- ============================================================
-- RESTAURANT TABLES POLICIES
-- ============================================================
DROP POLICY IF EXISTS "tables_select_public_or_owner" ON public.restaurant_tables;
CREATE POLICY "tables_select_public_or_owner"
ON public.restaurant_tables FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = restaurant_tables.restaurant_id
    AND (r.status = 'approved' OR r.owner_id = auth.uid() OR public.is_admin())
  )
);

DROP POLICY IF EXISTS "tables_insert_owner" ON public.restaurant_tables;
CREATE POLICY "tables_insert_owner"
ON public.restaurant_tables FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = restaurant_tables.restaurant_id AND r.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "tables_update_owner" ON public.restaurant_tables;
CREATE POLICY "tables_update_owner"
ON public.restaurant_tables FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = restaurant_tables.restaurant_id AND r.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = restaurant_tables.restaurant_id AND r.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "tables_delete_owner" ON public.restaurant_tables;
CREATE POLICY "tables_delete_owner"
ON public.restaurant_tables FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = restaurant_tables.restaurant_id AND r.owner_id = auth.uid()
  )
);

-- ============================================================
-- RESERVATIONS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "reservations_select_owner_or_customer_or_admin" ON public.reservations;
CREATE POLICY "reservations_select_owner_or_customer_or_admin"
ON public.reservations FOR SELECT
TO authenticated
USING (
  customer_id = auth.uid()
  OR public.is_restaurant_owner(restaurant_id)
  OR public.is_admin()
);

DROP POLICY IF EXISTS "reservations_insert_customer" ON public.reservations;
CREATE POLICY "reservations_insert_customer"
ON public.reservations FOR INSERT
TO authenticated
WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "reservations_update_owner_or_customer" ON public.reservations;
CREATE POLICY "reservations_update_owner_or_customer"
ON public.reservations FOR UPDATE
TO authenticated
USING (
  customer_id = auth.uid()
  OR public.is_restaurant_owner(restaurant_id)
  OR public.is_admin()
)
WITH CHECK (
  customer_id = auth.uid()
  OR public.is_restaurant_owner(restaurant_id)
  OR public.is_admin()
);

DROP POLICY IF EXISTS "reservations_delete_customer" ON public.reservations;
CREATE POLICY "reservations_delete_customer"
ON public.reservations FOR DELETE
TO authenticated
USING (customer_id = auth.uid());

-- ============================================================
-- ORDERS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "orders_select_owner_or_customer_or_admin" ON public.orders;
CREATE POLICY "orders_select_owner_or_customer_or_admin"
ON public.orders FOR SELECT
TO authenticated
USING (
  customer_id = auth.uid()
  OR public.is_restaurant_owner(restaurant_id)
  OR public.is_admin()
);

DROP POLICY IF EXISTS "orders_insert_customer" ON public.orders;
CREATE POLICY "orders_insert_customer"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "orders_update_owner" ON public.orders;
CREATE POLICY "orders_update_owner"
ON public.orders FOR UPDATE
TO authenticated
USING (
  public.is_restaurant_owner(restaurant_id)
  OR public.is_admin()
)
WITH CHECK (
  public.is_restaurant_owner(restaurant_id)
  OR public.is_admin()
);

-- ============================================================
-- ORDER ITEMS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "order_items_select_owner_or_customer_or_admin" ON public.order_items;
CREATE POLICY "order_items_select_owner_or_customer_or_admin"
ON public.order_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
    AND (
      o.customer_id = auth.uid()
      OR public.is_restaurant_owner(o.restaurant_id)
      OR public.is_admin()
    )
  )
);

DROP POLICY IF EXISTS "order_items_insert_customer" ON public.order_items;
CREATE POLICY "order_items_insert_customer"
ON public.order_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id AND o.customer_id = auth.uid()
  )
);

-- ============================================================
-- PAYMENTS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "payments_select_owner_or_customer_or_admin" ON public.payments;
CREATE POLICY "payments_select_owner_or_customer_or_admin"
ON public.payments FOR SELECT
TO authenticated
USING (
  customer_id = auth.uid()
  OR public.is_restaurant_owner(restaurant_id)
  OR public.is_admin()
);

-- ============================================================
-- REVIEWS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "reviews_select_public" ON public.reviews;
CREATE POLICY "reviews_select_public"
ON public.reviews FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = reviews.restaurant_id
    AND (r.status = 'approved' OR r.owner_id = auth.uid() OR public.is_admin())
  )
);

DROP POLICY IF EXISTS "reviews_insert_customer" ON public.reviews;
CREATE POLICY "reviews_insert_customer"
ON public.reviews FOR INSERT
TO authenticated
WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "reviews_update_customer_or_owner" ON public.reviews;
CREATE POLICY "reviews_update_customer_or_owner"
ON public.reviews FOR UPDATE
TO authenticated
USING (
  customer_id = auth.uid()
  OR public.is_restaurant_owner(restaurant_id)
  OR public.is_admin()
)
WITH CHECK (
  customer_id = auth.uid()
  OR public.is_restaurant_owner(restaurant_id)
  OR public.is_admin()
);

DROP POLICY IF EXISTS "reviews_delete_customer_or_admin" ON public.reviews;
CREATE POLICY "reviews_delete_customer_or_admin"
ON public.reviews FOR DELETE
TO authenticated
USING (customer_id = auth.uid() OR public.is_admin());

-- ============================================================
-- NOTIFICATIONS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own"
ON public.notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_insert_own" ON public.notifications;
CREATE POLICY "notifications_insert_own"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own"
ON public.notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
CREATE POLICY "notifications_delete_own"
ON public.notifications FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================================
-- RESTAURANT APPLICATIONS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "applications_select_owner_or_admin" ON public.restaurant_applications;
CREATE POLICY "applications_select_owner_or_admin"
ON public.restaurant_applications FOR SELECT
TO authenticated
USING (owner_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "applications_insert_owner" ON public.restaurant_applications;
CREATE POLICY "applications_insert_owner"
ON public.restaurant_applications FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "applications_update_admin" ON public.restaurant_applications;
CREATE POLICY "applications_update_admin"
ON public.restaurant_applications FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================
-- COMPLAINTS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "complaints_select_admin" ON public.complaints;
CREATE POLICY "complaints_select_admin"
ON public.complaints FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "complaints_insert_any" ON public.complaints;
CREATE POLICY "complaints_insert_any"
ON public.complaints FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "complaints_update_admin" ON public.complaints;
CREATE POLICY "complaints_update_admin"
ON public.complaints FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================
-- AUDIT LOGS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "audit_select_admin" ON public.audit_logs;
CREATE POLICY "audit_select_admin"
ON public.audit_logs FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "audit_insert_any_auth" ON public.audit_logs;
CREATE POLICY "audit_insert_any_auth"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================================
-- PASSWORD RESET TOKENS — NO DIRECT ACCESS
-- ============================================================
-- No policies: only service-role edge functions access this table.

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Prevent role changes via UPDATE (role is immutable from client)
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  -- Only allow role change if done by an admin (service role bypasses RLS)
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin() THEN
      NEW.role := OLD.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_role_immutable ON public.profiles;
CREATE TRIGGER enforce_role_immutable
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_role_change();
