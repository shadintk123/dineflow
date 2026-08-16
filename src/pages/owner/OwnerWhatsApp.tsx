import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Phone, Globe, Bell, BellOff, Save, CheckCircle2, AlertCircle, Loader2, Clock, User } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface WhatsAppSettings {
  id?: string;
  restaurant_id?: string;
  phone_number: string;
  country_code: string;
  notifications_enabled: boolean;
  customer_notifications_enabled: boolean;
  reminder_hours_before: number;
}

interface NotificationLog {
  id: string;
  event_type: string;
  recipient_type: string;
  recipient_phone: string;
  status: string;
  failure_reason: string;
  created_at: string;
}

export function OwnerWhatsApp() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [settings, setSettings] = useState<WhatsAppSettings>({
    phone_number: '',
    country_code: '+91',
    notifications_enabled: false,
    customer_notifications_enabled: false,
    reminder_hours_before: 24,
  });
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (!restaurant) {
        setLoading(false);
        return;
      }

      setRestaurantId(restaurant.id);

      const { data: existing } = await supabase
        .from('whatsapp_settings')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .maybeSingle();

      if (existing) {
        setSettings({
          id: existing.id,
          restaurant_id: existing.restaurant_id,
          phone_number: existing.phone_number || '',
          country_code: existing.country_code || '+91',
          notifications_enabled: existing.notifications_enabled ?? false,
          customer_notifications_enabled: existing.customer_notifications_enabled ?? false,
          reminder_hours_before: existing.reminder_hours_before ?? 24,
        });
      }

      const { data: notifs } = await supabase
        .from('whatsapp_notifications')
        .select('id, event_type, recipient_type, recipient_phone, status, failure_reason, created_at')
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (notifs) setNotifications(notifs);
    } catch {
      error('Failed to load', 'Could not load WhatsApp settings.');
    }
    setLoading(false);
  }, [user, error]);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const handleSave = async () => {
    if (!restaurantId) {
      error('No restaurant', 'You need an approved restaurant first.');
      return;
    }
    if (settings.notifications_enabled && !settings.phone_number) {
      error('Phone required', 'Enter your WhatsApp number to enable notifications.');
      return;
    }
    const phoneRegex = /^\d{8,15}$/;
    if (settings.phone_number && !phoneRegex.test(settings.phone_number)) {
      error('Invalid number', 'Enter digits only (8-15 digits), without the country code.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        restaurant_id: restaurantId,
        phone_number: settings.phone_number,
        country_code: settings.country_code,
        notifications_enabled: settings.notifications_enabled,
        customer_notifications_enabled: settings.customer_notifications_enabled,
        reminder_hours_before: settings.reminder_hours_before,
      };

      if (settings.id) {
        const { error: updateError } = await supabase
          .from('whatsapp_settings')
          .update(payload)
          .eq('id', settings.id);
        if (updateError) throw updateError;
      } else {
        const { data, error: insertError } = await supabase
          .from('whatsapp_settings')
          .insert(payload)
          .select()
          .maybeSingle();
        if (insertError) throw insertError;
        if (data) setSettings((s) => ({ ...s, id: data.id }));
      }

      success('Settings saved', 'Your WhatsApp notification preferences have been updated.');
    } catch (err: any) {
      error('Save failed', err.message || 'Could not save settings.');
    }
    setSaving(false);
  };

  const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error' }> = {
    pending: { label: 'Pending', variant: 'warning' },
    sent: { label: 'Sent', variant: 'success' },
    delivered: { label: 'Delivered', variant: 'success' },
    failed: { label: 'Failed', variant: 'error' },
  };

  if (loading) {
    return (
      <DashboardLayout title="WhatsApp Notifications" subtitle="Configure reservation alerts">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="WhatsApp Notifications" subtitle="Configure reservation alerts for your restaurant">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Setup card */}
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                <MessageCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-ink">WhatsApp Configuration</h2>
                <p className="text-xs text-muted">Receive instant alerts when reservations are made or cancelled.</p>
              </div>
            </div>

            {!restaurantId && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-warning/30 bg-warning/5 p-4">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-warning" />
                <p className="text-sm text-ink">You need an approved restaurant listing before configuring WhatsApp notifications.</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
                <div>
                  <label className="label-field">Country Code</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                    <select
                      value={settings.country_code}
                      onChange={(e) => setSettings({ ...settings, country_code: e.target.value })}
                      className="input-field pl-10"
                    >
                      <option value="+91">+91 (India)</option>
                      <option value="+971">+971 (UAE)</option>
                      <option value="+966">+966 (KSA)</option>
                      <option value="+1">+1 (USA)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+65">+65 (Singapore)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label-field">WhatsApp Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                    <input
                      type="tel"
                      value={settings.phone_number}
                      onChange={(e) => setSettings({ ...settings, phone_number: e.target.value.replace(/\D/g, '') })}
                      placeholder="9847012345"
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setSettings({ ...settings, notifications_enabled: !settings.notifications_enabled })}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all',
                    settings.notifications_enabled ? 'border-success/40 bg-success/5' : 'border-line bg-ivory hover:border-primary-300'
                  )}
                >
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                    settings.notifications_enabled ? 'bg-success text-white' : 'bg-surface text-muted'
                  )}>
                    {settings.notifications_enabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-ink">Owner Notifications</p>
                    <p className="text-xs text-muted">Get a WhatsApp message when a reservation is created, modified, or cancelled.</p>
                  </div>
                  <div className={cn(
                    'relative h-6 w-11 rounded-full transition-colors',
                    settings.notifications_enabled ? 'bg-success' : 'bg-line'
                  )}>
                    <div className={cn(
                      'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-all',
                      settings.notifications_enabled ? 'left-[22px]' : 'left-0.5'
                    )} />
                  </div>
                </button>

                <button
                  onClick={() => setSettings({ ...settings, customer_notifications_enabled: !settings.customer_notifications_enabled })}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all',
                    settings.customer_notifications_enabled ? 'border-primary-600/40 bg-primary-50' : 'border-line bg-ivory hover:border-primary-300'
                  )}
                >
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                    settings.customer_notifications_enabled ? 'bg-primary-600 text-white' : 'bg-surface text-muted'
                  )}>
                    {settings.customer_notifications_enabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-ink">Customer Notifications</p>
                    <p className="text-xs text-muted">Send confirmation and cancellation messages to your customers via WhatsApp.</p>
                  </div>
                  <div className={cn(
                    'relative h-6 w-11 rounded-full transition-colors',
                    settings.customer_notifications_enabled ? 'bg-primary-600' : 'bg-line'
                  )}>
                    <div className={cn(
                      'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-all',
                      settings.customer_notifications_enabled ? 'left-[22px]' : 'left-0.5'
                    )} />
                  </div>
                </button>
              </div>

              <div>
                <label className="label-field">Reminder Hours Before</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                  <select
                    value={settings.reminder_hours_before}
                    onChange={(e) => setSettings({ ...settings, reminder_hours_before: Number(e.target.value) })}
                    className="input-field pl-10"
                  >
                    <option value={1}>1 hour before</option>
                    <option value={3}>3 hours before</option>
                    <option value={6}>6 hours before</option>
                    <option value={12}>12 hours before</option>
                    <option value={24}>24 hours before</option>
                    <option value={48}>48 hours before</option>
                  </select>
                </div>
              </div>

              <Button variant="primary" size="lg" onClick={handleSave} loading={saving} disabled={!restaurantId}>
                <Save className="h-4 w-4" /> Save Settings
              </Button>
            </div>
          </div>

          {/* Notification log */}
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
            <h2 className="font-display text-lg font-bold text-ink mb-4">Recent Notifications</h2>
            {notifications.length === 0 ? (
              <p className="text-sm text-muted py-8 text-center">No notifications sent yet. They will appear here after reservations are made.</p>
            ) : (
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div key={n.id} className="flex items-center gap-3 rounded-xl border border-line p-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ivory">
                      {n.recipient_type === 'owner' ? <MessageCircle className="h-4 w-4 text-success" /> : <User className="h-4 w-4 text-primary-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink capitalize">
                        {n.event_type} · {n.recipient_type}
                      </p>
                      <p className="text-xs text-muted truncate">
                        {n.failure_reason || `To: ${n.recipient_phone}`}
                      </p>
                    </div>
                    <Badge variant={statusConfig[n.status]?.variant || 'default'}>
                      {statusConfig[n.status]?.label || n.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-primary-50 p-5">
            <h3 className="font-display text-sm font-bold text-ink mb-3">How it works</h3>
            <ol className="space-y-2.5">
              {[
                'Enter your WhatsApp number and enable notifications.',
                'When a customer reserves a table, you get an instant WhatsApp alert.',
                'If customer notifications are on, they receive a confirmation too.',
                'Cancellation and modification events also trigger alerts.',
                'Failed notifications do not affect your reservations.',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">{i + 1}</span>
                  <span className="text-xs text-ink">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-5">
            <h3 className="font-display text-sm font-bold text-ink mb-2">Privacy</h3>
            <p className="text-xs text-muted">Customer phone numbers are only used to send reservation confirmations. They are never shared with third parties or used for marketing.</p>
          </div>

          <div className="rounded-2xl border border-accent-300/40 bg-accent-50 p-5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-accent-600" />
              <h3 className="font-display text-sm font-bold text-ink">Reservations stay safe</h3>
            </div>
            <p className="text-xs text-muted">If WhatsApp is unavailable, your reservation still works normally. The notification is saved and can be retried later.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
