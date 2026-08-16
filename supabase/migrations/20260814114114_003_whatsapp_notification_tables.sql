/*
# WhatsApp Notification System

1. New Tables
- `whatsapp_settings`: Per-restaurant WhatsApp configuration (phone number, country code, notifications on/off).
  Columns: id (uuid PK), restaurant_id (uuid FK -> restaurants.id), phone_number (text), country_code (text default '+91'),
  notifications_enabled (boolean default false), customer_notifications_enabled (boolean default false),
  reminder_hours_before (int default 24), created_at, updated_at.
- `whatsapp_notifications`: Log of WhatsApp notification attempts for reservation events.
  Columns: id (uuid PK), reservation_id (uuid FK -> reservations.id), restaurant_id (uuid FK -> restaurants.id),
  event_type (text: 'created' | 'confirmed' | 'cancelled' | 'modified' | 'reminder'),
  recipient_type (text: 'owner' | 'customer'), recipient_phone (text),
  message_body (text), status (text: 'pending' | 'sent' | 'delivered' | 'failed'),
  provider_message_id (text), retry_count (int default 0), failure_reason (text),
  idempotency_key (text unique), created_at, updated_at, sent_at (timestamptz).

2. Security
- Enable RLS on both tables.
- whatsapp_settings: Owners can read/update their own restaurant's settings. Admins can read all.
- whatsapp_notifications: Owners can read notifications for their restaurants. Admins can read all.
  Only the edge function (service role) can insert/update notifications.

3. Important Notes
- The idempotency_key prevents duplicate notifications for the same reservation event.
- Notifications are stored independently from reservations — a failed notification does not cancel a reservation.
- Customer phone numbers are only sent to if the customer has opted in (customer_notifications_enabled).
- All WhatsApp API credentials remain server-side as edge function secrets, never in frontend code.
*/

CREATE TABLE IF NOT EXISTS public.whatsapp_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  phone_number text NOT NULL DEFAULT '',
  country_code text NOT NULL DEFAULT '+91',
  notifications_enabled boolean NOT NULL DEFAULT false,
  customer_notifications_enabled boolean NOT NULL DEFAULT false,
  reminder_hours_before int NOT NULL DEFAULT 24,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id)
);

ALTER TABLE public.whatsapp_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can read own whatsapp settings" ON public.whatsapp_settings;
CREATE POLICY "Owners can read own whatsapp settings"
ON public.whatsapp_settings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = whatsapp_settings.restaurant_id
    AND r.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins can read all whatsapp settings" ON public.whatsapp_settings;
CREATE POLICY "Admins can read all whatsapp settings"
ON public.whatsapp_settings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Owners can update own whatsapp settings" ON public.whatsapp_settings;
CREATE POLICY "Owners can update own whatsapp settings"
ON public.whatsapp_settings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = whatsapp_settings.restaurant_id
    AND r.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = whatsapp_settings.restaurant_id
    AND r.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Owners can insert own whatsapp settings" ON public.whatsapp_settings;
CREATE POLICY "Owners can insert own whatsapp settings"
ON public.whatsapp_settings FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = whatsapp_settings.restaurant_id
    AND r.owner_id = auth.uid()
  )
);

CREATE TABLE IF NOT EXISTS public.whatsapp_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid REFERENCES public.reservations(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  event_type text NOT NULL DEFAULT 'created',
  recipient_type text NOT NULL DEFAULT 'owner',
  recipient_phone text NOT NULL DEFAULT '',
  message_body text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  provider_message_id text DEFAULT '',
  retry_count int NOT NULL DEFAULT 0,
  failure_reason text DEFAULT '',
  idempotency_key text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);

ALTER TABLE public.whatsapp_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can read own whatsapp notifications" ON public.whatsapp_notifications;
CREATE POLICY "Owners can read own whatsapp notifications"
ON public.whatsapp_notifications FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = whatsapp_notifications.restaurant_id
    AND r.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins can read all whatsapp notifications" ON public.whatsapp_notifications;
CREATE POLICY "Admins can read all whatsapp notifications"
ON public.whatsapp_notifications FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_notifications_reservation_id ON public.whatsapp_notifications(reservation_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_notifications_restaurant_id ON public.whatsapp_notifications(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_notifications_status ON public.whatsapp_notifications(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_settings_restaurant_id ON public.whatsapp_settings(restaurant_id);
