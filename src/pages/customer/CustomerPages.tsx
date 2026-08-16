import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, QrCode, Users, ShoppingBag, Heart, User as UserIcon, Mail, Phone, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { StarRating } from '@/components/ui/StarRating';
import { useAuth } from '@/context/AuthContext';
import { useReservations } from '@/context/ReservationContext';
import { useFavorites } from '@/context/FavoritesContext';
import { sampleRestaurants, sampleReviews } from '@/data/restaurants';
import { formatTime, formatDate, formatPrice, cn } from '@/lib/utils';
import type { ReservationStatus } from '@/types';
import { useState } from 'react';

const statusConfig: Record<ReservationStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'primary' | 'default' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'success' },
  seated: { label: 'Seated', variant: 'primary' },
  completed: { label: 'Completed', variant: 'default' },
  cancelled: { label: 'Cancelled', variant: 'error' },
  no_show: { label: 'No Show', variant: 'error' },
};

export function CustomerReservations() {
  const { user } = useAuth();
  const { reservations, updateReservation } = useReservations();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  if (!user) return null;
  const userRes = reservations.filter((r) => r.customerId === user.id);
  const filtered = userRes.filter((r) => {
    if (filter === 'upcoming') return r.status === 'confirmed' || r.status === 'pending';
    if (filter === 'completed') return r.status === 'completed';
    if (filter === 'cancelled') return r.status === 'cancelled' || r.status === 'no_show';
    return true;
  });

  return (
    <DashboardLayout title="My Reservations" subtitle="Manage all your table reservations">
      <div className="flex gap-2 mb-5">
        {(['all', 'upcoming', 'completed', 'cancelled'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn('rounded-full px-4 py-2 text-sm font-semibold capitalize transition-all', filter === f ? 'bg-primary-600 text-white' : 'bg-surface border border-line text-ink hover:border-primary-300')}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface">
          <EmptyState icon={<Calendar className="h-7 w-7" />} title="No reservations found" description="Reserve a table to get started." action={<Link to="/explore"><Button variant="primary" size="md">Explore Restaurants</Button></Link>} />
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((res) => {
            const restaurant = sampleRestaurants.find((r) => r.id === res.restaurantId);
            return (
              <div key={res.id} className="rounded-2xl border border-line bg-surface p-5 shadow-card">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <img src={restaurant?.logo} alt="" className="h-16 w-16 rounded-xl object-cover" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-base font-bold text-ink">{res.restaurantName}</h3>
                      <Badge variant={statusConfig[res.status].variant}>{statusConfig[res.status].label}</Badge>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(res.date)}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatTime(res.time)}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {res.guests} guests</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {res.tableCode}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(res.status === 'confirmed' || res.status === 'pending') && (
                      <>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600"><QrCode className="h-6 w-6" /></div>
                        <Button variant="secondary" size="sm" onClick={() => { updateReservation(res.id, { status: 'cancelled' }).catch(() => {}); }}>Cancel</Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}

export function CustomerOrders() {
  const { user } = useAuth();
  const { orders } = useReservations();

  if (!user) return null;
  const userOrders = orders.filter((o) => o.customerId === user.id);

  return (
    <DashboardLayout title="My Orders" subtitle="View your food pre-orders and order history">
      {userOrders.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface">
          <EmptyState icon={<ShoppingBag className="h-7 w-7" />} title="No orders yet" description="Pre-order food when you make a reservation." action={<Link to="/explore"><Button variant="primary" size="md">Explore Restaurants</Button></Link>} />
        </div>
      ) : (
        <div className="space-y-4">
          {userOrders.map((order) => {
            const restaurant = sampleRestaurants.find((r) => r.id === order.restaurantId);
            return (
              <div key={order.id} className="rounded-2xl border border-line bg-surface p-5 shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img src={restaurant?.logo} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    <div>
                      <p className="text-sm font-bold text-ink">{restaurant?.name}</p>
                      <p className="text-xs text-muted">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <Badge variant={order.status === 'completed' ? 'default' : 'primary'}>{order.status}</Badge>
                </div>
                <div className="space-y-1.5">
                  {order.items.map((item) => (
                    <div key={item.menuItemId} className="flex justify-between text-sm">
                      <span className="text-ink">{item.quantity}× {item.name}</span>
                      <span className="font-semibold text-ink">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-between border-t border-line pt-3">
                  <span className="text-xs text-muted">Prep: {order.prepOption === 'prepare_on_arrival' ? 'Timed to arrival' : 'Confirm later'}</span>
                  <span className="font-display text-base font-bold text-primary-700">{formatPrice(order.total)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}

export function CustomerFavorites() {
  const { favorites } = useFavorites();

  return (
    <DashboardLayout title="Favorites" subtitle="Your saved restaurants">
      {favorites.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface">
          <EmptyState icon={<Heart className="h-7 w-7" />} title="No favorites yet" description="Tap the heart on any restaurant to save it here." action={<Link to="/explore"><Button variant="primary" size="md">Explore Restaurants</Button></Link>} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sampleRestaurants.filter((r) => favorites.includes(r.id)).map((r) => (
            <Link key={r.id} to={`/restaurants/${r.id}`} className="group overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-all hover:-translate-y-1 hover:shadow-lift">
              <div className="relative h-36 overflow-hidden">
                <img src={r.cover} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90"><Heart className="h-4 w-4 fill-error text-error" /></div>
              </div>
              <div className="p-4">
                <p className="font-display text-sm font-bold text-ink">{r.name}</p>
                <StarRating rating={r.rating} showValue count={r.reviewCount} size="sm" className="mt-1" />
                <p className="mt-1 text-xs text-muted">{r.cuisine[0]} · {r.city}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export function CustomerProfile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });

  if (!user) return null;
  const userReviews = sampleReviews.filter((r) => r.customerName === user.name);

  return (
    <DashboardLayout title="Profile" subtitle="Manage your account and settings">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-bold text-ink">Account Information</h2>
              <Button variant={editing ? 'primary' : 'secondary'} size="sm" onClick={() => { if (editing) updateUser(form); setEditing(!editing); }}>
                {editing ? 'Save' : 'Edit'}
              </Button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-600 text-2xl font-bold text-white">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="font-display text-xl font-bold text-ink">{user.name}</p>
                <p className="text-sm text-muted">{user.email}</p>
                <Badge variant="primary" className="mt-1">Customer</Badge>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-field">Full Name</label>
                {editing ? <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" /> : (
                  <div className="flex items-center gap-2 rounded-xl border border-line bg-ivory px-4 py-2.5 text-sm"><UserIcon className="h-4 w-4 text-muted" /> {user.name}</div>
                )}
              </div>
              <div>
                <label className="label-field">Email</label>
                {editing ? <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" /> : (
                  <div className="flex items-center gap-2 rounded-xl border border-line bg-ivory px-4 py-2.5 text-sm"><Mail className="h-4 w-4 text-muted" /> {user.email}</div>
                )}
              </div>
              <div>
                <label className="label-field">Phone</label>
                {editing ? <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" /> : (
                  <div className="flex items-center gap-2 rounded-xl border border-line bg-ivory px-4 py-2.5 text-sm"><Phone className="h-4 w-4 text-muted" /> {user.phone || 'Not set'}</div>
                )}
              </div>
              <div>
                <label className="label-field">Member Since</label>
                <div className="flex items-center gap-2 rounded-xl border border-line bg-ivory px-4 py-2.5 text-sm"><Calendar className="h-4 w-4 text-muted" /> {formatDate(user.createdAt)}</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
            <h2 className="font-display text-lg font-bold text-ink mb-4">My Reviews</h2>
            {userReviews.length === 0 ? (
              <p className="text-sm text-muted text-center py-6">You haven't written any reviews yet.</p>
            ) : (
              <div className="space-y-3">
                {userReviews.map((review) => {
                  const restaurant = sampleRestaurants.find((r) => r.id === review.restaurantId);
                  return (
                    <div key={review.id} className="rounded-xl border border-line p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-ink">{restaurant?.name}</p>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                      <p className="mt-2 text-sm text-muted">{review.comment}</p>
                      <p className="mt-1 text-xs text-muted">{formatDate(review.date)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
            <h2 className="font-display text-base font-bold text-ink mb-3">Notifications</h2>
            <div className="space-y-3">
              {[
                { icon: CheckCircle2, color: 'text-success', title: 'Reservation confirmed', time: '2h ago' },
                { icon: AlertCircle, color: 'text-warning', title: 'Table held for 15 min', time: '5h ago' },
                { icon: XCircle, color: 'text-error', title: 'Restaurant closed today', time: '1d ago' },
              ].map((n, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl bg-ivory p-3">
                  <n.icon className={cn('mt-0.5 h-4 w-4 shrink-0', n.color)} />
                  <div>
                    <p className="text-xs font-semibold text-ink">{n.title}</p>
                    <p className="text-[10px] text-muted">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
            <h2 className="font-display text-base font-bold text-ink mb-3">Language</h2>
            <div className="flex gap-2">
              <button className="chip chip-active flex-1 justify-center">English</button>
              <button className="chip flex-1 justify-center">മലയാളം</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
