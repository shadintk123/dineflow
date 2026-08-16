import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, QrCode, Users, ChefHat, Navigation, Bell, ShoppingBag, Heart, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { useReservations } from '@/context/ReservationContext';
import { useFavorites } from '@/context/FavoritesContext';
import { sampleRestaurants } from '@/data/restaurants';
import { formatTime, formatDate, formatPrice, cn } from '@/lib/utils';
import type { ReservationStatus, ArrivalStatus } from '@/types';

const statusConfig: Record<ReservationStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'primary' | 'default' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'success' },
  seated: { label: 'Seated', variant: 'primary' },
  completed: { label: 'Completed', variant: 'default' },
  cancelled: { label: 'Cancelled', variant: 'error' },
  no_show: { label: 'No Show', variant: 'error' },
};

const arrivalConfig: Record<ArrivalStatus, { label: string; color: string }> = {
  on_time: { label: 'On Time', color: 'text-success' },
  en_route: { label: 'En Route', color: 'text-primary-600' },
  running_late: { label: 'Running Late', color: 'text-warning' },
  arrived: { label: 'Arrived', color: 'text-accent-600' },
};

export function CustomerDashboard() {
  const { user } = useAuth();
  const { reservations, updateReservation } = useReservations();
  const { favorites } = useFavorites();

  if (!user) return null;
  const userReservations = reservations.filter((r) => r.customerId === user.id);
  const upcoming = userReservations.filter((r) => r.status === 'confirmed' || r.status === 'pending');
  const active = upcoming[0];
  const past = userReservations.filter((r) => r.status === 'completed' || r.status === 'cancelled' || r.status === 'no_show');
  const favRestaurants = sampleRestaurants.filter((r) => favorites.includes(r.id));

  const updateArrival = (id: string, status: ArrivalStatus, delay?: number) => {
    const res = userReservations.find((r) => r.id === id);
    if (!res) return;
    const newArrival = delay ? `${String(parseInt(res.time.slice(0, 2)) + Math.floor((parseInt(res.time.slice(3, 5)) + delay) / 60)).padStart(2, '0')}:${String((parseInt(res.time.slice(3, 5)) + delay) % 60).padStart(2, '0')}` : res.expectedArrival;
    updateReservation(id, { arrivalStatus: status, arrivalTime: newArrival }).catch(() => {});
  };

  return (
    <DashboardLayout title="Dashboard" subtitle={`Welcome back, ${user.name.split(' ')[0]}`}>
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Upcoming" value={upcoming.length} icon={<Calendar className="h-5 w-5" />} variant="primary" />
        <StatCard label="Total Reservations" value={userReservations.length} icon={<ShoppingBag className="h-5 w-5" />} />
        <StatCard label="Favorites" value={favorites.length} icon={<Heart className="h-5 w-5" />} variant="accent" />
        <StatCard label="Completed" value={past.filter((r) => r.status === 'completed').length} icon={<TrendingUp className="h-5 w-5" />} />
      </div>

      {/* Active reservation */}
      {active ? (
        <div className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-ink">Current Reservation</h2>
            <Badge variant={statusConfig[active.status].variant}>{statusConfig[active.status].label}</Badge>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <img src={sampleRestaurants.find((r) => r.id === active.restaurantId)?.logo} alt="" className="h-14 w-14 rounded-xl object-cover" />
                <div>
                  <p className="font-display text-base font-bold text-ink">{active.restaurantName}</p>
                  <p className="text-xs text-muted">{formatDate(active.date)} at {formatTime(active.time)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl bg-ivory p-3"><Users className="h-4 w-4 text-primary-600" /><p className="mt-1 text-xs text-muted">Guests</p><p className="text-sm font-bold text-ink">{active.guests}</p></div>
                <div className="rounded-xl bg-ivory p-3"><MapPin className="h-4 w-4 text-primary-600" /><p className="mt-1 text-xs text-muted">Table</p><p className="text-sm font-bold text-ink">{active.tableCode}</p></div>
                <div className="rounded-xl bg-ivory p-3"><Clock className="h-4 w-4 text-primary-600" /><p className="mt-1 text-xs text-muted">Arrival</p><p className="text-sm font-bold text-ink">{formatTime(active.arrivalTime)}</p></div>
                <div className="rounded-xl bg-ivory p-3"><ChefHat className="h-4 w-4 text-primary-600" /><p className="mt-1 text-xs text-muted">Prep</p><p className="text-sm font-bold text-ink">{active.prepStatus}</p></div>
              </div>

              {/* Smart arrival controls */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted mb-2">Update Arrival</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <button onClick={() => updateArrival(active.id, 'on_time')} className={cn('rounded-xl border p-3 text-center text-xs font-semibold transition-all', active.arrivalStatus === 'on_time' ? 'border-success bg-success/10 text-success' : 'border-line text-ink hover:border-success')}>On Time</button>
                  <button onClick={() => updateArrival(active.id, 'en_route')} className={cn('rounded-xl border p-3 text-center text-xs font-semibold transition-all', active.arrivalStatus === 'en_route' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-line text-ink hover:border-primary-300')}>10 Min Away</button>
                  <button onClick={() => updateArrival(active.id, 'running_late', 15)} className={cn('rounded-xl border p-3 text-center text-xs font-semibold transition-all', active.arrivalStatus === 'running_late' ? 'border-warning bg-warning/10 text-warning' : 'border-line text-ink hover:border-warning')}>Running Late</button>
                  <button onClick={() => updateArrival(active.id, 'arrived')} className={cn('rounded-xl border p-3 text-center text-xs font-semibold transition-all', active.arrivalStatus === 'arrived' ? 'border-accent-400 bg-accent-50 text-accent-600' : 'border-line text-ink hover:border-accent-400')}>Arrived</button>
                </div>
                <p className={cn('mt-2 text-xs font-semibold', arrivalConfig[active.arrivalStatus].color)}>
                  Status: {arrivalConfig[active.arrivalStatus].label} · Arrival at {formatTime(active.arrivalTime)}
                </p>
              </div>
            </div>

            {/* QR */}
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-primary-600 bg-primary-50 p-5">
              <div className="rounded-xl bg-white p-3 shadow-soft">
                <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-primary-900 text-white">
                  <QrCode className="h-20 w-20" />
                </div>
              </div>
              <p className="mt-3 font-display text-sm font-bold text-primary-700">{active.id}</p>
              <p className="text-xs text-muted">Scan to check in</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-card">
          <EmptyState
            icon={<Calendar className="h-7 w-7" />}
            title="No upcoming reservations"
            description="Find a restaurant and reserve your table in just a few steps."
            action={<Link to="/explore"><Button variant="primary" size="md">Explore Restaurants</Button></Link>}
          />
        </div>
      )}

      {/* Upcoming + Favorites */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="font-display text-lg font-bold text-ink mb-3">Upcoming Reservations</h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted py-8 text-center">No upcoming reservations.</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((res) => (
                <div key={res.id} className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4">
                  <img src={sampleRestaurants.find((r) => r.id === res.restaurantId)?.logo} alt="" className="h-12 w-12 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-ink truncate">{res.restaurantName}</p>
                    <p className="text-xs text-muted">{formatDate(res.date)} · {formatTime(res.time)} · {res.guests} guests · {res.tableCode}</p>
                  </div>
                  <Badge variant={statusConfig[res.status].variant}>{statusConfig[res.status].label}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-display text-lg font-bold text-ink mb-3">Favorite Restaurants</h2>
          {favRestaurants.length === 0 ? (
            <p className="text-sm text-muted py-8 text-center">No favorites yet.</p>
          ) : (
            <div className="space-y-3">
              {favRestaurants.slice(0, 4).map((r) => (
                <Link key={r.id} to={`/restaurants/${r.id}`} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3 hover:border-primary-300 transition-colors">
                  <img src={r.logo} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-ink truncate">{r.name}</p>
                    <p className="text-xs text-muted">{r.cuisine[0]} · {r.city}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
