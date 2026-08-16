import { useState, useEffect } from 'react';
import {
  Store, Users, Calendar, AlertCircle, BarChart3, Tags, CheckCircle2,
  XCircle, Clock, TrendingUp, TrendingDown, ShieldCheck, Search,
  User as UserIcon, UtensilsCrossed, MapPin, Star
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { StarRating } from '@/components/ui/StarRating';
import { useToast } from '@/context/ToastContext';
import { sampleRestaurants, allCuisines, popularLocations } from '@/data/restaurants';
import { formatDate, cn } from '@/lib/utils';
import { getApplications, updateApplicationStatus } from '@/lib/applications';
import type { RestaurantStatus, Complaint, RestaurantApplication } from '@/types';

const restaurantStatusConfig: Record<RestaurantStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'default' }> = {
  draft: { label: 'Draft', variant: 'default' },
  submitted: { label: 'Submitted', variant: 'warning' },
  pending_review: { label: 'Pending', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'error' },
  suspended: { label: 'Suspended', variant: 'error' },
};

const sampleComplaints: Complaint[] = [
  { id: 'c1', type: 'fake_restaurant', reporterName: 'Arjun Menon', restaurantId: 'r5', description: 'This restaurant does not exist at the listed address.', status: 'open', createdAt: '2024-11-20T10:00:00Z' },
  { id: 'c2', type: 'reservation', reporterName: 'Fatima Rashid', restaurantId: 'r2', description: 'Table was not ready at the reserved time.', status: 'investigating', createdAt: '2024-11-18T14:00:00Z' },
  { id: 'c3', type: 'incorrect_info', reporterName: 'Vishnu Kumar', restaurantId: 'r1', description: 'Opening hours are incorrect, restaurant opens at 12 not 11.', status: 'resolved', createdAt: '2024-11-15T09:00:00Z' },
];

const complaintTypeLabels: Record<Complaint['type'], string> = {
  fake_restaurant: 'Fake Restaurant',
  incorrect_info: 'Incorrect Info',
  reservation: 'Reservation Issue',
  payment: 'Payment Issue',
  service: 'Service Complaint',
};

const complaintStatusConfig: Record<Complaint['status'], { label: string; variant: 'default' | 'warning' | 'success' | 'error' }> = {
  open: { label: 'Open', variant: 'error' },
  investigating: { label: 'Investigating', variant: 'warning' },
  resolved: { label: 'Resolved', variant: 'success' },
  dismissed: { label: 'Dismissed', variant: 'default' },
};

const sampleCustomers = [
  { id: 'c1', name: 'Arjun Menon', email: 'arjun@example.com', phone: '+91 98470 11111', reservations: 12, joined: '2024-09-01' },
  { id: 'c2', name: 'Fatima Rashid', email: 'fatima@example.com', phone: '+91 98470 22222', reservations: 8, joined: '2024-09-15' },
  { id: 'c3', name: 'Vishnu Kumar', email: 'vishnu@example.com', phone: '+91 98470 33333', reservations: 5, joined: '2024-10-01' },
];

const sampleOwners = [
  { id: 'o1', name: 'Yusuf Malabar', email: 'owner@malabarspice.in', phone: '+91 98470 12345', restaurants: 1, status: 'approved' },
  { id: 'o2', name: 'Sara Backwater', email: 'dine@backwaterbistro.in', phone: '+91 98460 67890', restaurants: 1, status: 'approved' },
  { id: 'o3', name: 'Kochi Saffron', email: 'reserve@saffronkochi.in', phone: '+91 99461 22345', restaurants: 1, status: 'approved' },
];

export function AdminDashboard() {
  const [applications, setApplications] = useState<RestaurantApplication[]>(getApplications());
  const approved = sampleRestaurants.filter((r) => r.status === 'approved').length;
  const pendingApps = applications.filter((a) => a.status === 'pending');

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="Platform overview">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Restaurants" value={sampleRestaurants.length} icon={<Store className="h-5 w-5" />} variant="primary" />
        <StatCard label="Approved" value={approved} icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard label="Pending Review" value={pendingApps.length} icon={<Clock className="h-5 w-5" />} variant="accent" />
        <StatCard label="Total Customers" value="1,247" icon={<Users className="h-5 w-5" />} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Owners" value={sampleOwners.length} icon={<ShieldCheck className="h-5 w-5" />} />
        <StatCard label="Reservations" value="8,432" icon={<Calendar className="h-5 w-5" />} variant="primary" />
        <StatCard label="Pre-Orders" value="3,219" icon={<UtensilsCrossed className="h-5 w-5" />} variant="accent" />
        <StatCard label="Open Complaints" value={sampleComplaints.filter((c) => c.status === 'open').length} icon={<AlertCircle className="h-5 w-5" />} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <h2 className="font-display text-base font-bold text-ink mb-4">Pending Restaurant Approvals</h2>
          <div className="space-y-3">
            {pendingApps.length === 0 ? (
              <EmptyState icon={<CheckCircle2 className="h-7 w-7" />} title="No pending requests" description="New owner applications will appear here." />
            ) : (
              pendingApps.slice(0, 5).map((app) => (
                <div key={app.id} className="flex items-center gap-3 rounded-xl border border-line p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
                    <UtensilsCrossed className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-ink truncate">{app.restaurantName}</p>
                    <p className="text-xs text-muted">{app.city} · {app.cuisine[0] || 'Cuisine not set'}</p>
                  </div>
                  <Badge variant="warning">Pending</Badge>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <h2 className="font-display text-base font-bold text-ink mb-4">Platform Metrics</h2>
          <div className="space-y-3">
            {[
              { label: 'Cancellation Rate', value: '12%', trend: '-3%', positive: true, icon: TrendingDown },
              { label: 'No-Show Rate', value: '5%', trend: '-1%', positive: true, icon: TrendingDown },
              { label: 'Active Restaurants', value: String(approved), trend: '+2', positive: true, icon: TrendingUp },
              { label: 'Avg. Rating', value: '4.6', trend: '+0.2', positive: true, icon: Star },
            ].map((m) => (
              <div key={m.label} className="flex items-center justify-between rounded-xl bg-ivory p-3">
                <div className="flex items-center gap-2">
                  <m.icon className="h-4 w-4 text-primary-600" />
                  <span className="text-sm font-semibold text-ink">{m.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-base font-bold text-ink">{m.value}</span>
                  <span className={cn('text-xs font-bold', m.positive ? 'text-success' : 'text-error')}>{m.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export function AdminRestaurants() {
  const { success, error } = useToast();
  const [restaurants, setRestaurants] = useState(sampleRestaurants);
  const [applications, setApplications] = useState<RestaurantApplication[]>(getApplications());
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | RestaurantStatus>('all');
  const [tab, setTab] = useState<'applications' | 'existing'>('applications');

  const filtered = restaurants.filter((r) => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.city.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const pendingApps = applications.filter((a) => a.status === 'pending');
  const reviewedApps = applications.filter((a) => a.status !== 'pending');

  const updateStatus = (id: string, status: RestaurantStatus) => {
    setRestaurants(restaurants.map((r) => r.id === id ? { ...r, status } : r));
    success('Status updated', `Restaurant marked as ${status}.`);
  };

  const handleApprove = (app: RestaurantApplication) => {
    updateApplicationStatus(app.id, 'approved');
    setApplications(getApplications());
    success('Application approved', `${app.restaurantName} can now operate on the platform.`);
  };

  const handleReject = (app: RestaurantApplication) => {
    updateApplicationStatus(app.id, 'rejected');
    setApplications(getApplications());
    error('Application rejected', `${app.restaurantName} was rejected.`);
  };

  return (
    <DashboardLayout title="Restaurants" subtitle="Manage all restaurant listings">
      <div className="flex gap-2 mb-5">
        <button onClick={() => setTab('applications')} className={cn('rounded-full px-4 py-2 text-sm font-semibold transition-all', tab === 'applications' ? 'bg-primary-600 text-white' : 'bg-surface border border-line text-ink hover:border-primary-300')}>
          New Applications {pendingApps.length > 0 && <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-accent-400 px-1.5 py-0.5 text-[10px] font-bold text-white">{pendingApps.length}</span>}
        </button>
        <button onClick={() => setTab('existing')} className={cn('rounded-full px-4 py-2 text-sm font-semibold transition-all', tab === 'existing' ? 'bg-primary-600 text-white' : 'bg-surface border border-line text-ink hover:border-primary-300')}>
          Existing Restaurants
        </button>
      </div>

      {tab === 'applications' && (
        <div className="space-y-4">
          {pendingApps.length === 0 && reviewedApps.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface p-8 shadow-card">
              <EmptyState icon={<CheckCircle2 className="h-7 w-7" />} title="No applications yet" description="When restaurant owners register, their applications will appear here for approval." />
            </div>
          ) : (
            <>
              {pendingApps.length > 0 && (
                <div className="space-y-3">
                  <h2 className="font-display text-sm font-bold text-ink uppercase tracking-wide">Pending Review</h2>
                  {pendingApps.map((app) => (
                    <div key={app.id} className="rounded-2xl border border-warning/30 bg-warning/5 p-5 shadow-card">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                          <UtensilsCrossed className="h-7 w-7" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <p className="text-base font-bold text-ink">{app.restaurantName}</p>
                            <Badge variant="warning">Pending</Badge>
                          </div>
                          <p className="text-sm text-muted">{app.description}</p>
                          <div className="grid gap-2 text-xs text-muted sm:grid-cols-2 lg:grid-cols-3">
                            <p><span className="font-semibold text-ink">Owner:</span> {app.ownerName}</p>
                            <p><span className="font-semibold text-ink">Email:</span> {app.ownerEmail}</p>
                            <p><span className="font-semibold text-ink">Phone:</span> {app.ownerPhone}</p>
                            <p><span className="font-semibold text-ink">Cuisine:</span> {app.cuisine.join(', ') || 'Not specified'}</p>
                            <p><span className="font-semibold text-ink">Location:</span> {app.address}, {app.city}, {app.state} {app.postalCode}</p>
                            <p><span className="font-semibold text-ink">Hours:</span> {app.openingHours} - {app.closingHours}</p>
                            <p><span className="font-semibold text-ink">Seating:</span> {app.seatingCapacity} seats · {app.tables} tables</p>
                            <p><span className="font-semibold text-ink">Price Range:</span> {'₹'.repeat(app.priceRange)}</p>
                            <p><span className="font-semibold text-ink">Amenities:</span> {app.amenities.join(', ') || 'None'}</p>
                          </div>
                          <p className="text-xs text-muted">Submitted {formatDate(app.submittedAt)}</p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <Button variant="primary" size="sm" onClick={() => handleApprove(app)}><CheckCircle2 className="h-4 w-4" /> Approve</Button>
                          <Button variant="secondary" size="sm" onClick={() => handleReject(app)}><XCircle className="h-4 w-4" /> Reject</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {reviewedApps.length > 0 && (
                <div className="space-y-3">
                  <h2 className="font-display text-sm font-bold text-ink uppercase tracking-wide mt-6">Recently Reviewed</h2>
                  {reviewedApps.map((app) => (
                    <div key={app.id} className="rounded-2xl border border-line bg-surface p-4 shadow-card opacity-75">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ivory text-muted">
                          <UtensilsCrossed className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-ink">{app.restaurantName}</p>
                            <Badge variant={app.status === 'approved' ? 'success' : 'error'}>{app.status === 'approved' ? 'Approved' : 'Rejected'}</Badge>
                          </div>
                          <p className="text-xs text-muted">{app.ownerName} · {app.city} · Reviewed {app.reviewedAt ? formatDate(app.reviewedAt) : ''}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === 'existing' && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search restaurants..." className="input-field pl-10" />
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {(['all', 'pending_review', 'approved', 'rejected', 'suspended'] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={cn('shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-all', filter === f ? 'bg-primary-600 text-white' : 'bg-surface border border-line text-ink hover:border-primary-300')}>
                  {f === 'all' ? 'All' : f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filtered.map((r) => (
              <div key={r.id} className="rounded-2xl border border-line bg-surface p-4 shadow-card">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <img src={r.logo} alt="" className="h-14 w-14 rounded-xl object-cover" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-ink">{r.name}</p>
                      <Badge variant={restaurantStatusConfig[r.status].variant}>{restaurantStatusConfig[r.status].label}</Badge>
                    </div>
                    <p className="text-xs text-muted">{r.cuisine.join(', ')} · {r.city}, {r.state}</p>
                    <div className="mt-1 flex items-center gap-3">
                      <StarRating rating={r.rating} showValue count={r.reviewCount} size="sm" />
                      <span className="text-xs text-muted">{r.onlineCapacity + r.walkInCapacity + r.flexibleCapacity} tables</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {r.status !== 'approved' && <Button variant="primary" size="sm" onClick={() => updateStatus(r.id, 'approved')}><CheckCircle2 className="h-3.5 w-3.5" /> Approve</Button>}
                    {r.status !== 'rejected' && <Button variant="secondary" size="sm" onClick={() => updateStatus(r.id, 'rejected')}><XCircle className="h-3.5 w-3.5" /> Reject</Button>}
                    {r.status !== 'suspended' && <Button variant="secondary" size="sm" onClick={() => updateStatus(r.id, 'suspended')}>Suspend</Button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export function AdminOwners() {
  return (
    <DashboardLayout title="Restaurant Owners" subtitle="Manage owner accounts">
      <div className="space-y-3">
        {sampleOwners.map((owner) => (
          <div key={owner.id} className="rounded-2xl border border-line bg-surface p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-600"><ShieldCheck className="h-6 w-6" /></div>
              <div className="flex-1">
                <p className="text-sm font-bold text-ink">{owner.name}</p>
                <p className="text-xs text-muted">{owner.email} · {owner.phone}</p>
              </div>
              <Badge variant="success">Approved</Badge>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">Manage</Button>
                <Button variant="secondary" size="sm">Suspend</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export function AdminCustomers() {
  return (
    <DashboardLayout title="Customers" subtitle="Manage customer accounts">
      <div className="space-y-3">
        {sampleCustomers.map((c) => (
          <div key={c.id} className="rounded-2xl border border-line bg-surface p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-sm font-bold text-white">{c.name.charAt(0)}</div>
              <div className="flex-1">
                <p className="text-sm font-bold text-ink">{c.name}</p>
                <p className="text-xs text-muted">{c.email} · {c.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-ink">{c.reservations}</p>
                <p className="text-xs text-muted">reservations</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted">Joined</p>
                <p className="text-xs font-semibold text-ink">{formatDate(c.joined)}</p>
              </div>
              <Button variant="secondary" size="sm">Manage</Button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export function AdminReservations() {
  return (
    <DashboardLayout title="All Reservations" subtitle="Platform-wide reservation activity">
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
        <EmptyState icon={<Calendar className="h-7 w-7" />} title="Reservation data" description="Platform-wide reservations will appear here." />
      </div>
    </DashboardLayout>
  );
}

export function AdminComplaints() {
  const { success } = useToast();
  const [complaints, setComplaints] = useState(sampleComplaints);

  const updateStatus = (id: string, status: Complaint['status']) => {
    setComplaints(complaints.map((c) => c.id === id ? { ...c, status } : c));
    success('Complaint updated', `Marked as ${status}.`);
  };

  return (
    <DashboardLayout title="Complaints" subtitle="Handle reports and issues">
      <div className="space-y-4">
        {complaints.map((c) => {
          const restaurant = sampleRestaurants.find((r) => r.id === c.restaurantId);
          return (
            <div key={c.id} className="rounded-2xl border border-line bg-surface p-5 shadow-card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={complaintStatusConfig[c.status].variant}>{complaintStatusConfig[c.status].label}</Badge>
                    <Badge variant="default">{complaintTypeLabels[c.type]}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-ink">{c.description}</p>
                  <p className="mt-1 text-xs text-muted">Reported by {c.reporterName} · {restaurant?.name || 'Unknown'} · {formatDate(c.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  {c.status === 'open' && <Button variant="secondary" size="sm" onClick={() => updateStatus(c.id, 'investigating')}>Investigate</Button>}
                  {c.status !== 'resolved' && <Button variant="primary" size="sm" onClick={() => updateStatus(c.id, 'resolved')}><CheckCircle2 className="h-3.5 w-3.5" /> Resolve</Button>}
                  {c.status !== 'dismissed' && <Button variant="secondary" size="sm" onClick={() => updateStatus(c.id, 'dismissed')}>Dismiss</Button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}

export function AdminCategories() {
  const { success } = useToast();
  const [cuisines, setCuisines] = useState(allCuisines);
  const [locations, setLocations] = useState(popularLocations.map((l) => l.name));
  const [newCuisine, setNewCuisine] = useState('');
  const [newLocation, setNewLocation] = useState('');

  return (
    <DashboardLayout title="Categories" subtitle="Manage cuisines and locations">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <h2 className="font-display text-base font-bold text-ink mb-4">Cuisines</h2>
          <div className="flex gap-2 mb-4">
            <input value={newCuisine} onChange={(e) => setNewCuisine(e.target.value)} placeholder="Add cuisine..." className="input-field flex-1" />
            <Button variant="primary" size="md" onClick={() => { if (newCuisine) { setCuisines([...cuisines, newCuisine]); setNewCuisine(''); success('Cuisine added'); } }}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {cuisines.map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700">
                {c}
                <button onClick={() => setCuisines(cuisines.filter((x) => x !== c))} className="text-primary-400 hover:text-error"><XCircle className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <h2 className="font-display text-base font-bold text-ink mb-4">Locations</h2>
          <div className="flex gap-2 mb-4">
            <input value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="Add location..." className="input-field flex-1" />
            <Button variant="primary" size="md" onClick={() => { if (newLocation) { setLocations([...locations, newLocation]); setNewLocation(''); success('Location added'); } }}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {locations.map((l) => (
              <span key={l} className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1.5 text-xs font-semibold text-accent-600">
                <MapPin className="h-3 w-3" /> {l}
                <button onClick={() => setLocations(locations.filter((x) => x !== l))} className="text-accent-400 hover:text-error"><XCircle className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export function AdminAnalytics() {
  const approved = sampleRestaurants.filter((r) => r.status === 'approved').length;
  const pending = sampleRestaurants.filter((r) => r.status === 'pending_review').length;

  return (
    <DashboardLayout title="Platform Analytics" subtitle="Platform-wide insights">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Customers" value="1,247" icon={<Users className="h-5 w-5" />} variant="primary" />
        <StatCard label="Total Owners" value={sampleOwners.length} icon={<ShieldCheck className="h-5 w-5" />} />
        <StatCard label="Total Restaurants" value={sampleRestaurants.length} icon={<Store className="h-5 w-5" />} variant="accent" />
        <StatCard label="Active Restaurants" value={approved} icon={<CheckCircle2 className="h-5 w-5" />} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <h3 className="font-display text-base font-bold text-ink mb-4">Reservations Over Time</h3>
          <div className="flex items-end justify-between gap-2 h-40">
            {[40, 65, 50, 80, 70, 95, 85, 100, 75, 90, 60, 88].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-lg bg-primary-600 transition-all hover:bg-primary-700" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => <span key={m}>{m}</span>)}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <h3 className="font-display text-base font-bold text-ink mb-4">Platform Health</h3>
          <div className="space-y-3">
            {[
              { label: 'Cancellation Rate', value: '12%', max: '30%', color: 'bg-success', width: '40%' },
              { label: 'No-Show Rate', value: '5%', max: '15%', color: 'bg-success', width: '33%' },
              { label: 'Customer Satisfaction', value: '4.6/5', max: '5', color: 'bg-accent-400', width: '92%' },
              { label: 'Restaurant Approval Rate', value: `${Math.round((approved / sampleRestaurants.length) * 100)}%`, max: '100%', color: 'bg-primary-600', width: `${(approved / sampleRestaurants.length) * 100}%` },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-ink">{m.label}</span>
                  <span className="font-bold text-ink">{m.value}</span>
                </div>
                <div className="h-2 rounded-full bg-ivory"><div className={cn('h-2 rounded-full', m.color)} style={{ width: m.width }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
