import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Users, Table2, ChefHat, TrendingUp, Clock, MapPin, Plus,
  Edit, Trash2, UtensilsCrossed, Star, MessageSquare, BarChart3,
  CheckCircle2, AlertCircle, XCircle, Navigation, Leaf
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { StarRating } from '@/components/ui/StarRating';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { useReservations } from '@/context/ReservationContext';
import { useToast } from '@/context/ToastContext';
import { sampleRestaurants, sampleMenuItems, sampleTables, sampleReviews, menuCategories } from '@/data/restaurants';
import { formatTime, formatDate, formatPrice, cn, generateId } from '@/lib/utils';
import type { ReservationStatus, OrderStatus, TableStatus, SeatingArea, MenuItem, RestaurantTable } from '@/types';

const resStatusConfig: Record<ReservationStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'primary' | 'default' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'success' },
  seated: { label: 'Seated', variant: 'primary' },
  completed: { label: 'Completed', variant: 'default' },
  cancelled: { label: 'Cancelled', variant: 'error' },
  no_show: { label: 'No Show', variant: 'error' },
};

const orderStatusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'primary' | 'warning' | 'success' | 'error' }> = {
  new: { label: 'New', variant: 'warning' },
  scheduled: { label: 'Scheduled', variant: 'default' },
  preparing: { label: 'Preparing', variant: 'primary' },
  ready: { label: 'Ready', variant: 'success' },
  served: { label: 'Served', variant: 'default' },
  completed: { label: 'Completed', variant: 'default' },
  cancelled: { label: 'Cancelled', variant: 'error' },
};

const tableStatusConfig: Record<TableStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'default' | 'primary' }> = {
  available: { label: 'Available', variant: 'success' },
  reserved: { label: 'Reserved', variant: 'warning' },
  occupied: { label: 'Occupied', variant: 'error' },
  cleaning: { label: 'Cleaning', variant: 'default' },
  unavailable: { label: 'Unavailable', variant: 'default' },
};

const areaLabels: Record<SeatingArea, string> = {
  main_hall: 'Main Hall', family: 'Family', outdoor: 'Outdoor', private: 'Private', vip: 'VIP',
};

function useOwnerRestaurant() {
  const { user } = useAuth();
  const restaurant = sampleRestaurants.find((r) => r.ownerId === user?.id) || sampleRestaurants[0];
  return restaurant;
}

export function OwnerDashboard() {
  const restaurant = useOwnerRestaurant();
  const { reservations, orders } = useReservations();
  const restaurantReservations = reservations.filter((r) => r.restaurantId === restaurant.id);
  const restaurantOrders = orders.filter((o) => o.restaurantId === restaurant.id);
  const tables = sampleTables.filter((t) => t.restaurantId === restaurant.id);
  const today = new Date().toISOString().split('T')[0];
  const todayRes = restaurantReservations.filter((r) => r.date === today);
  const arrivingSoon = todayRes.filter((r) => r.status === 'confirmed').slice(0, 5);
  const delayed = todayRes.filter((r) => r.arrivalStatus === 'running_late');
  const availableTables = tables.filter((t) => t.status === 'available').length;
  const occupiedTables = tables.filter((t) => t.status === 'occupied').length;
  const cleaningTables = tables.filter((t) => t.status === 'cleaning').length;
  const kitchenLoad = restaurantOrders.filter((o) => o.status === 'preparing').length;

  return (
    <DashboardLayout title="Dashboard" subtitle={restaurant.name} actions={<Link to="/owner/restaurants"><Button variant="accent" size="sm"><Plus className="h-4 w-4" /> Add Restaurant</Button></Link>}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's Reservations" value={todayRes.length} icon={<Calendar className="h-5 w-5" />} variant="primary" />
        <StatCard label="Available Tables" value={availableTables} icon={<Table2 className="h-5 w-5" />} />
        <StatCard label="Kitchen Load" value={`${kitchenLoad}/${restaurant.maxPrepLoad}`} icon={<ChefHat className="h-5 w-5" />} variant="accent" />
        <StatCard label="Delayed Customers" value={delayed.length} icon={<AlertCircle className="h-5 w-5" />} variant={delayed.length > 0 ? 'primary' : 'default'} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <h2 className="font-display text-base font-bold text-ink mb-4">Customers Arriving Soon</h2>
          {arrivingSoon.length === 0 ? (
            <p className="text-sm text-muted text-center py-6">No customers arriving soon.</p>
          ) : (
            <div className="space-y-3">
              {arrivingSoon.map((res) => (
                <div key={res.id} className="flex items-center gap-3 rounded-xl border border-line p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">{res.customerName.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-ink">{res.customerName}</p>
                    <p className="text-xs text-muted">{formatTime(res.time)} · {res.guests} guests · {res.tableCode}</p>
                  </div>
                  <Badge variant={res.arrivalStatus === 'running_late' ? 'warning' : 'success'}>
                    {res.arrivalStatus === 'running_late' ? `Late ${res.arrivalTime}` : 'On Time'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <h2 className="font-display text-base font-bold text-ink mb-4">Table Status</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-success/10 p-4"><p className="text-2xl font-bold text-success">{availableTables}</p><p className="text-xs text-muted">Available</p></div>
            <div className="rounded-xl bg-error/10 p-4"><p className="text-2xl font-bold text-error">{occupiedTables}</p><p className="text-xs text-muted">Occupied</p></div>
            <div className="rounded-xl bg-warning/10 p-4"><p className="text-2xl font-bold text-warning">{tables.filter((t) => t.status === 'reserved').length}</p><p className="text-xs text-muted">Reserved</p></div>
            <div className="rounded-xl bg-ivory p-4"><p className="text-2xl font-bold text-muted">{cleaningTables}</p><p className="text-xs text-muted">Cleaning</p></div>
          </div>
        </div>
      </div>

      {delayed.length > 0 && (
        <div className="mt-6 rounded-2xl border-2 border-warning/30 bg-warning/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-warning" />
            <h2 className="font-display text-base font-bold text-ink">Delayed Customers — Review Preparation</h2>
          </div>
          <div className="space-y-2">
            {delayed.map((res) => (
              <div key={res.id} className="flex items-center justify-between rounded-xl bg-surface p-3">
                <div>
                  <p className="text-sm font-bold text-ink">{res.customerName} — Table {res.tableCode}</p>
                  <p className="text-xs text-muted">Updated arrival: {formatTime(res.arrivalTime)}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">Continue</Button>
                  <Button variant="secondary" size="sm">Delay</Button>
                  <Button variant="secondary" size="sm">Pause</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-line bg-surface p-5 shadow-card">
        <h2 className="font-display text-base font-bold text-ink mb-4">Recent Activity</h2>
        <div className="space-y-2">
          {[
            { icon: CheckCircle2, color: 'text-success', text: 'New reservation from Arjun Menon — Table A-01, 7:30 PM', time: '10 min ago' },
            { icon: ChefHat, color: 'text-accent-500', text: 'Order #ORD_001 moved to Preparing', time: '25 min ago' },
            { icon: AlertCircle, color: 'text-warning', text: 'Customer Fatima Rashid updated arrival to 7:50 PM', time: '1h ago' },
            { icon: Table2, color: 'text-primary-600', text: 'Table O-02 moved to Cleaning', time: '2h ago' },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl bg-ivory p-3">
              <a.icon className={cn('h-4 w-4 shrink-0', a.color)} />
              <p className="flex-1 text-sm text-ink">{a.text}</p>
              <p className="text-xs text-muted">{a.time}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

export function OwnerRestaurants() {
  const { user } = useAuth();
  const { success } = useToast();
  const myRestaurants = sampleRestaurants.filter((r) => r.ownerId === user?.id);

  return (
    <DashboardLayout title="My Restaurants" subtitle="Manage your restaurant listings" actions={<Button variant="accent" size="sm"><Plus className="h-4 w-4" /> Add Restaurant</Button>}>
      {myRestaurants.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface">
          <EmptyState icon={<UtensilsCrossed className="h-7 w-7" />} title="No restaurants yet" description="Add your first restaurant to get started." action={<Button variant="primary" size="md">Add Restaurant</Button>} />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {myRestaurants.map((r) => (
            <div key={r.id} className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
              <div className="relative h-36 overflow-hidden">
                <img src={r.cover} alt="" className="h-full w-full object-cover" />
                <div className="absolute top-2 right-2"><Badge variant={r.status === 'approved' ? 'success' : 'warning'}>{r.status}</Badge></div>
              </div>
              <div className="p-4">
                <p className="font-display text-base font-bold text-ink">{r.name}</p>
                <p className="text-xs text-muted">{r.cuisine[0]} · {r.city}</p>
                <div className="mt-2 flex items-center gap-3">
                  <StarRating rating={r.rating} showValue count={r.reviewCount} size="sm" />
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => success('Edit mode', 'Coming soon')}><Edit className="h-3.5 w-3.5" /> Edit</Button>
                  <Button variant="secondary" size="sm"><BarChart3 className="h-3.5 w-3.5" /> Analytics</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export function OwnerMenu() {
  const restaurant = useOwnerRestaurant();
  const { success } = useToast();
  const [items, setItems] = useState<MenuItem[]>(sampleMenuItems.filter((m) => m.restaurantId === restaurant.id));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: 0, category: 'Main Course', prepTime: 15, isVeg: true });

  const openAdd = () => { setEditingItem(null); setForm({ name: '', description: '', price: 0, category: 'Main Course', prepTime: 15, isVeg: true }); setModalOpen(true); };
  const openEdit = (item: MenuItem) => { setEditingItem(item); setForm({ name: item.name, description: item.description, price: item.price, category: item.category, prepTime: item.prepTime, isVeg: item.isVeg }); setModalOpen(true); };

  const handleSave = () => {
    if (editingItem) {
      setItems(items.map((i) => i.id === editingItem.id ? { ...i, ...form } : i));
      success('Menu item updated', form.name);
    } else {
      const newItem: MenuItem = {
        id: generateId('m'), restaurantId: restaurant.id, image: 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=600',
        available: true, prepCategory: form.prepTime <= 10 ? 'quick' : form.prepTime <= 25 ? 'standard' : 'long', ...form,
      };
      setItems([...items, newItem]);
      success('Menu item added', form.name);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
    success('Menu item removed');
  };

  const toggleAvailable = (id: string) => {
    setItems(items.map((i) => i.id === id ? { ...i, available: !i.available } : i));
  };

  return (
    <DashboardLayout title="Menu Management" subtitle={restaurant.name} actions={<Button variant="accent" size="sm" onClick={openAdd}><Plus className="h-4 w-4" /> Add Item</Button>}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-line bg-surface p-4 shadow-card">
            <div className="flex gap-3">
              <img src={item.image} alt="" className="h-16 w-16 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={cn('flex h-4 w-4 items-center justify-center rounded-sm border', item.isVeg ? 'border-success' : 'border-error')}>
                    <span className={cn('h-2 w-2 rounded-full', item.isVeg ? 'bg-success' : 'bg-error')} />
                  </span>
                  <p className="text-sm font-bold text-ink truncate">{item.name}</p>
                </div>
                <p className="text-xs text-muted line-clamp-1">{item.description}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-bold text-ink">{formatPrice(item.price)}</span>
                  <span className="text-xs text-muted">{item.prepTime}m</span>
                  {item.popular && <Badge variant="accent" className="text-[10px] py-0">Popular</Badge>}
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
              <button onClick={() => toggleAvailable(item.id)} className={cn('text-xs font-semibold', item.available ? 'text-success' : 'text-error')}>
                {item.available ? 'Available' : 'Unavailable'}
              </button>
              <div className="flex gap-1.5">
                <button onClick={() => openEdit(item)} className="rounded-lg p-1.5 text-muted hover:bg-ivory hover:text-primary-700"><Edit className="h-3.5 w-3.5" /></button>
                <button onClick={() => handleDelete(item.id)} className="rounded-lg p-1.5 text-muted hover:bg-error/5 hover:text-error"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Edit Menu Item' : 'Add Menu Item'}>
        <div className="space-y-4">
          <div><label className="label-field">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Item name" /></div>
          <div><label className="label-field">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none" rows={2} placeholder="Description" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label-field">Price (₹)</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="input-field" /></div>
            <div><label className="label-field">Prep Time (min)</label><input type="number" value={form.prepTime} onChange={(e) => setForm({ ...form, prepTime: Number(e.target.value) })} className="input-field" /></div>
          </div>
          <div><label className="label-field">Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">{menuCategories.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div><label className="label-field">Type</label><div className="flex gap-2"><button onClick={() => setForm({ ...form, isVeg: true })} className={cn('chip', form.isVeg && 'chip-active')}><Leaf className="h-3.5 w-3.5" /> Vegetarian</button><button onClick={() => setForm({ ...form, isVeg: false })} className={cn('chip', !form.isVeg && 'chip-active')}><UtensilsCrossed className="h-3.5 w-3.5" /> Non-Veg</button></div></div>
          <Button variant="primary" size="lg" fullWidth onClick={handleSave}>{editingItem ? 'Save Changes' : 'Add Item'}</Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

export function OwnerTables() {
  const restaurant = useOwnerRestaurant();
  const { success } = useToast();
  const [tables, setTables] = useState<RestaurantTable[]>(sampleTables.filter((t) => t.restaurantId === restaurant.id));
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ code: '', capacity: 4, area: 'main_hall' as SeatingArea });

  const handleAdd = () => {
    const newTable: RestaurantTable = { id: generateId('t'), restaurantId: restaurant.id, status: 'available', ...form };
    setTables([...tables, newTable]);
    success('Table added', form.code);
    setModalOpen(false);
    setForm({ code: '', capacity: 4, area: 'main_hall' });
  };

  const cycleStatus = (id: string) => {
    const statuses: TableStatus[] = ['available', 'reserved', 'occupied', 'cleaning', 'unavailable'];
    setTables(tables.map((t) => {
      if (t.id !== id) return t;
      const idx = statuses.indexOf(t.status);
      return { ...t, status: statuses[(idx + 1) % statuses.length] };
    }));
  };

  const handleDelete = (id: string) => {
    setTables(tables.filter((t) => t.id !== id));
    success('Table removed');
  };

  return (
    <DashboardLayout title="Table Management" subtitle={restaurant.name} actions={<Button variant="accent" size="sm" onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Add Table</Button>}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map((table) => (
          <div key={table.id} className="rounded-2xl border border-line bg-surface p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600"><Table2 className="h-6 w-6" /></div>
              <Badge variant={tableStatusConfig[table.status].variant}>{tableStatusConfig[table.status].label}</Badge>
            </div>
            <p className="mt-3 font-display text-lg font-bold text-ink">{table.code}</p>
            <p className="text-xs text-muted">{areaLabels[table.area]} · {table.capacity} seats</p>
            <div className="mt-3 flex gap-2 border-t border-line pt-3">
              <Button variant="secondary" size="sm" onClick={() => cycleStatus(table.id)}>Cycle Status</Button>
              <button onClick={() => handleDelete(table.id)} className="rounded-lg p-2 text-muted hover:bg-error/5 hover:text-error"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Table">
        <div className="space-y-4">
          <div><label className="label-field">Table Code</label><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="input-field" placeholder="A-05" /></div>
          <div><label className="label-field">Capacity</label><input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} className="input-field" /></div>
          <div><label className="label-field">Seating Area</label><select value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value as SeatingArea })} className="input-field">{Object.entries(areaLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          <Button variant="primary" size="lg" fullWidth onClick={handleAdd}>Add Table</Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

export function OwnerReservations() {
  const restaurant = useOwnerRestaurant();
  const { reservations, updateReservation } = useReservations();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'active' | 'completed' | 'cancelled'>('all');
  const restaurantRes = reservations.filter((r) => r.restaurantId === restaurant.id);

  const filtered = restaurantRes.filter((r) => {
    if (filter === 'upcoming') return r.status === 'confirmed' || r.status === 'pending';
    if (filter === 'active') return r.status === 'seated';
    if (filter === 'completed') return r.status === 'completed';
    if (filter === 'cancelled') return r.status === 'cancelled' || r.status === 'no_show';
    return true;
  });

  return (
    <DashboardLayout title="Reservations" subtitle={restaurant.name}>
      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide">
        {(['all', 'upcoming', 'active', 'completed', 'cancelled'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn('shrink-0 rounded-full px-4 py-2 text-sm font-semibold capitalize transition-all', filter === f ? 'bg-primary-600 text-white' : 'bg-surface border border-line text-ink hover:border-primary-300')}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface"><EmptyState icon={<Calendar className="h-7 w-7" />} title="No reservations found" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((res) => (
            <div key={res.id} className="rounded-2xl border border-line bg-surface p-4 shadow-card">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-sm font-bold text-white">{res.customerName.charAt(0)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-ink">{res.customerName}</p>
                    <Badge variant={resStatusConfig[res.status].variant}>{resStatusConfig[res.status].label}</Badge>
                  </div>
                  <p className="text-xs text-muted">{formatDate(res.date)} · {formatTime(res.time)} · {res.guests} guests · Table {res.tableCode}</p>
                </div>
                <div className="flex gap-2">
                  {res.status === 'confirmed' && <Button variant="secondary" size="sm" onClick={() => updateReservation(res.id, { status: 'seated' }).catch(() => {})}>Mark Seated</Button>}
                  {res.status === 'seated' && <Button variant="secondary" size="sm" onClick={() => updateReservation(res.id, { status: 'completed' }).catch(() => {})}>Complete</Button>}
                  {(res.status === 'confirmed' || res.status === 'pending') && <Button variant="secondary" size="sm" onClick={() => updateReservation(res.id, { status: 'no_show' }).catch(() => {})}>No Show</Button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export function OwnerOrders() {
  const restaurant = useOwnerRestaurant();
  const { orders, updateOrder } = useReservations();
  const restaurantOrders = orders.filter((o) => o.restaurantId === restaurant.id);

  return (
    <DashboardLayout title="Food Orders" subtitle={restaurant.name}>
      {restaurantOrders.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface"><EmptyState icon={<ChefHat className="h-7 w-7" />} title="No orders yet" description="Customer pre-orders will appear here." /></div>
      ) : (
        <div className="space-y-4">
          {restaurantOrders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-line bg-surface p-5 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-ink">Order #{order.id.slice(-6)}</p>
                  <p className="text-xs text-muted">{formatDate(order.createdAt)} · {order.prepOption === 'prepare_on_arrival' ? 'Timed to arrival' : 'Confirm later'}</p>
                </div>
                <Badge variant={orderStatusConfig[order.status].variant}>{orderStatusConfig[order.status].label}</Badge>
              </div>
              <div className="space-y-1.5">
                {order.items.map((item) => (
                  <div key={item.menuItemId} className="flex justify-between text-sm">
                    <span className="text-ink">{item.quantity}× {item.name}</span>
                    <span className="font-semibold text-ink">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                <span className="font-display text-base font-bold text-primary-700">{formatPrice(order.total)}</span>
                <div className="flex gap-2">
                  {order.status === 'new' && <Button variant="secondary" size="sm" onClick={() => updateOrder(order.id, 'scheduled').catch(() => {})}>Schedule</Button>}
                  {order.status === 'scheduled' && <Button variant="secondary" size="sm" onClick={() => updateOrder(order.id, 'preparing').catch(() => {})}>Start Prep</Button>}
                  {order.status === 'preparing' && <Button variant="secondary" size="sm" onClick={() => updateOrder(order.id, 'ready').catch(() => {})}>Mark Ready</Button>}
                  {order.status === 'ready' && <Button variant="secondary" size="sm" onClick={() => updateOrder(order.id, 'served').catch(() => {})}>Mark Served</Button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export function OwnerKitchen() {
  const restaurant = useOwnerRestaurant();
  const { orders } = useReservations();
  const restaurantOrders = orders.filter((o) => o.restaurantId === restaurant.id);
  const preparing = restaurantOrders.filter((o) => o.status === 'preparing');
  const scheduled = restaurantOrders.filter((o) => o.status === 'scheduled');

  return (
    <DashboardLayout title="Smart Kitchen" subtitle={restaurant.name}>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Kitchen Load" value={`${preparing.length}/${restaurant.maxPrepLoad}`} icon={<ChefHat className="h-5 w-5" />} variant={preparing.length >= restaurant.maxPrepLoad ? 'primary' : 'default'} />
        <StatCard label="Scheduled" value={scheduled.length} icon={<Clock className="h-5 w-5" />} />
        <StatCard label="Capacity" value={`${Math.round((1 - preparing.length / restaurant.maxPrepLoad) * 100)}%`} icon={<TrendingUp className="h-5 w-5" />} variant="accent" />
      </div>

      {preparing.length >= restaurant.maxPrepLoad && (
        <div className="mt-5 rounded-2xl border-2 border-error/30 bg-error/5 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-error" />
            <p className="text-sm font-bold text-error">Kitchen at full capacity</p>
          </div>
          <p className="mt-1 text-xs text-muted">New orders should be offered alternative time slots.</p>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <h2 className="font-display text-base font-bold text-ink mb-4">Preparation Schedule</h2>
          {scheduled.length === 0 && preparing.length === 0 ? (
            <p className="text-sm text-muted text-center py-6">No scheduled preparations.</p>
          ) : (
            <div className="space-y-3">
              {[...scheduled, ...preparing].map((order) => (
                <div key={order.id} className="rounded-xl border border-line p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-ink">Order #{order.id.slice(-6)}</p>
                    <Badge variant={orderStatusConfig[order.status].variant}>{orderStatusConfig[order.status].label}</Badge>
                  </div>
                  <div className="mt-2 space-y-1">
                    {order.items.map((item) => (
                      <p key={item.menuItemId} className="text-xs text-muted">{item.quantity}× {item.name} — {item.prepTime}m prep</p>
                    ))}
                  </div>
                  {order.scheduledPrepTime && <p className="mt-2 text-xs font-semibold text-accent-600">Prep starts at {formatTime(order.scheduledPrepTime)}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <h2 className="font-display text-base font-bold text-ink mb-4">Busy Time Slots</h2>
          <div className="space-y-2">
            {[
              { time: '7:00 PM', load: 'Busy', variant: 'error' as const },
              { time: '7:30 PM', load: 'Busy', variant: 'error' as const },
              { time: '7:45 PM', load: 'Available', variant: 'success' as const },
              { time: '8:00 PM', load: 'Available', variant: 'success' as const },
              { time: '8:30 PM', load: 'Moderate', variant: 'warning' as const },
            ].map((slot) => (
              <div key={slot.time} className="flex items-center justify-between rounded-xl bg-ivory p-3">
                <span className="text-sm font-semibold text-ink">{slot.time}</span>
                <Badge variant={slot.variant}>{slot.load}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export function OwnerReviews() {
  const restaurant = useOwnerRestaurant();
  const { success } = useToast();
  const reviews = sampleReviews.filter((r) => r.restaurantId === restaurant.id);
  const [replies, setReplies] = useState<Record<string, string>>({});

  const handleReply = (reviewId: string) => {
    success('Reply posted', 'Your reply has been published.');
    setReplies({ ...replies, [reviewId]: '' });
  };

  return (
    <DashboardLayout title="Reviews" subtitle={restaurant.name}>
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard label="Average Rating" value={restaurant.rating.toFixed(1)} icon={<Star className="h-5 w-5" />} variant="accent" />
        <StatCard label="Total Reviews" value={restaurant.reviewCount} icon={<MessageSquare className="h-5 w-5" />} />
        <StatCard label="Response Rate" value="68%" icon={<CheckCircle2 className="h-5 w-5" />} variant="primary" />
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-2xl border border-line bg-surface p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">{review.customerName.charAt(0)}</div>
                <div>
                  <p className="text-sm font-bold text-ink">{review.customerName}</p>
                  <p className="text-xs text-muted">{formatDate(review.date)}</p>
                </div>
              </div>
              <StarRating rating={review.rating} size="sm" />
            </div>
            <p className="mt-3 text-sm text-ink">{review.comment}</p>
            {review.ownerReply && (
              <div className="mt-3 rounded-xl bg-ivory p-3 border-l-4 border-primary-300">
                <p className="text-xs font-bold text-primary-700">Your Reply</p>
                <p className="mt-1 text-xs text-muted">{review.ownerReply}</p>
              </div>
            )}
            {!review.ownerReply && (
              <div className="mt-3 flex gap-2">
                <input value={replies[review.id] || ''} onChange={(e) => setReplies({ ...replies, [review.id]: e.target.value })} placeholder="Write a reply..." className="input-field flex-1 text-sm" />
                <Button variant="primary" size="sm" onClick={() => handleReply(review.id)}>Reply</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export function OwnerAnalytics() {
  const restaurant = useOwnerRestaurant();
  const { reservations, orders } = useReservations();
  const restaurantRes = reservations.filter((r) => r.restaurantId === restaurant.id);
  const restaurantOrders = orders.filter((o) => o.restaurantId === restaurant.id);
  const completed = restaurantRes.filter((r) => r.status === 'completed').length;
  const cancelled = restaurantRes.filter((r) => r.status === 'cancelled').length;
  const noShow = restaurantRes.filter((r) => r.status === 'no_show').length;
  const total = restaurantRes.length || 1;
  const cancellationRate = Math.round((cancelled / total) * 100);
  const noShowRate = Math.round((noShow / total) * 100);
  const revenue = restaurantOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <DashboardLayout title="Analytics" subtitle={restaurant.name}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Reservations" value={restaurantRes.length} icon={<Calendar className="h-5 w-5" />} variant="primary" />
        <StatCard label="Total Orders" value={restaurantOrders.length} icon={<ChefHat className="h-5 w-5" />} />
        <StatCard label="Revenue" value={formatPrice(revenue)} icon={<TrendingUp className="h-5 w-5" />} variant="accent" />
        <StatCard label="Completed" value={completed} icon={<CheckCircle2 className="h-5 w-5" />} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <h3 className="font-display text-sm font-bold text-ink mb-4">Cancellation Rate</h3>
          <div className="flex items-center justify-center">
            <div className="relative h-32 w-32">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#E8E5DE" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#C94B4B" strokeWidth="8" strokeDasharray={`${cancellationRate * 2.51} 251`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-2xl font-bold text-ink">{cancellationRate}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <h3 className="font-display text-sm font-bold text-ink mb-4">No-Show Rate</h3>
          <div className="flex items-center justify-center">
            <div className="relative h-32 w-32">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#E8E5DE" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#D98A24" strokeWidth="8" strokeDasharray={`${noShowRate * 2.51} 251`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-2xl font-bold text-ink">{noShowRate}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <h3 className="font-display text-sm font-bold text-ink mb-4">Popular Items</h3>
          <div className="space-y-2">
            {sampleMenuItems.filter((m) => m.restaurantId === restaurant.id && m.popular).slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl bg-ivory p-2.5">
                <span className="text-xs font-semibold text-ink">{item.name}</span>
                <span className="text-xs font-bold text-primary-700">{formatPrice(item.price)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
