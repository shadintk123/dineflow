import { type ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, ShoppingBag, Heart, User as UserIcon, Bell,
  UtensilsCrossed, Menu, X, LogOut, ChevronDown, Store, ClipboardList,
  Users, BarChart3, Settings, Utensils, Table2, MessageSquare, Star,
  ShieldCheck, Building2, AlertCircle, Tags, MessageCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
}

const customerNav: NavItem[] = [
  { label: 'Dashboard', to: '/customer/dashboard', icon: LayoutDashboard },
  { label: 'Reservations', to: '/customer/reservations', icon: Calendar },
  { label: 'Orders', to: '/customer/orders', icon: ShoppingBag },
  { label: 'Favorites', to: '/customer/favorites', icon: Heart },
  { label: 'Profile', to: '/customer/profile', icon: UserIcon },
];

const ownerNav: NavItem[] = [
  { label: 'Dashboard', to: '/owner/dashboard', icon: LayoutDashboard },
  { label: 'My Restaurants', to: '/owner/restaurants', icon: Store },
  { label: 'Menu', to: '/owner/menu', icon: Utensils },
  { label: 'Tables', to: '/owner/tables', icon: Table2 },
  { label: 'Reservations', to: '/owner/reservations', icon: Calendar },
  { label: 'Food Orders', to: '/owner/orders', icon: ClipboardList },
  { label: 'Smart Kitchen', to: '/owner/kitchen', icon: BarChart3 },
  { label: 'Reviews', to: '/owner/reviews', icon: MessageSquare },
  { label: 'Analytics', to: '/owner/analytics', icon: BarChart3 },
  { label: 'WhatsApp', to: '/owner/whatsapp', icon: MessageCircle },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Restaurants', to: '/admin/restaurants', icon: Store },
  { label: 'Owners', to: '/admin/owners', icon: Users },
  { label: 'Customers', to: '/admin/customers', icon: UserIcon },
  { label: 'Reservations', to: '/admin/reservations', icon: Calendar },
  { label: 'Complaints', to: '/admin/complaints', icon: AlertCircle },
  { label: 'Categories', to: '/admin/categories', icon: Tags },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
];

const roleConfig = {
  customer: { nav: customerNav, title: 'Customer', basePath: '/customer' },
  owner: { nav: ownerNav, title: 'Owner Panel', basePath: '/owner' },
  admin: { nav: adminNav, title: 'Admin Panel', basePath: '/admin' },
};

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function DashboardLayout({ children, title, subtitle, actions }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  if (!user) return null;
  const config = roleConfig[user.role];
  const nav = config.nav;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-ivory">
      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-line bg-surface lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2.5 border-b border-line px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <UtensilsCrossed className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold text-ink">Dinevia</span>
          </Link>
        </div>
        <div className="border-b border-line px-4 py-3">
          <span className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide',
            user.role === 'admin' ? 'bg-error/10 text-error' : user.role === 'owner' ? 'bg-accent-50 text-accent-600' : 'bg-primary-50 text-primary-700'
          )}>
            {user.role === 'admin' && <ShieldCheck className="h-3 w-3" />}
            {user.role === 'owner' && <Building2 className="h-3 w-3" />}
            {user.role === 'customer' && <UserIcon className="h-3 w-3" />}
            {config.title}
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {nav.map((item) => {
              const active = location.pathname === item.to;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
                      active
                        ? 'bg-primary-600 text-white shadow-soft'
                        : 'text-ink/70 hover:bg-primary-50 hover:text-primary-700'
                    )}
                  >
                    <item.icon className="h-4.5 w-4.5 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-line p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-error hover:bg-error/5 transition-colors"
          >
            <LogOut className="h-4.5 w-4.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-primary-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-surface shadow-lift animate-fade-in">
            <div className="flex h-16 items-center justify-between border-b border-line px-6">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                  <UtensilsCrossed className="h-4 w-4 text-white" />
                </div>
                <span className="font-display text-lg font-bold text-ink">Dinevia</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="p-2 text-muted hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="px-3 py-4">
              <ul className="space-y-1">
                {nav.map((item) => {
                  const active = location.pathname === item.to;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all',
                          active ? 'bg-primary-600 text-white' : 'text-ink/70 hover:bg-primary-50'
                        )}
                      >
                        <item.icon className="h-4.5 w-4.5" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <button
                onClick={handleLogout}
                className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-error hover:bg-error/5"
              >
                <LogOut className="h-4.5 w-4.5" />
                Sign Out
              </button>
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-surface/95 backdrop-blur-md px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-ink hover:bg-ivory lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              {title && <h1 className="font-display text-lg font-bold text-ink lg:text-xl">{title}</h1>}
              {subtitle && <p className="text-xs text-muted lg:text-sm">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <button className="relative rounded-xl p-2.5 text-ink/70 hover:bg-ivory transition-colors" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent-400" />
            </button>
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-xl border border-line bg-ivory py-1.5 pl-1.5 pr-3 hover:bg-primary-50 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-xs font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden text-sm font-semibold text-ink sm:block">{user.name.split(' ')[0]}</span>
                <ChevronDown className="hidden h-4 w-4 text-muted sm:block" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-line bg-surface shadow-lift animate-fade-in">
                  <div className="border-b border-line p-4">
                    <p className="text-sm font-bold text-ink">{user.name}</p>
                    <p className="text-xs text-muted">{user.email}</p>
                  </div>
                  <div className="p-2">
                    <Link to={`/${user.role}/profile`} onClick={() => setProfileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-ink hover:bg-ivory">
                      <Settings className="h-4 w-4" /> Settings
                    </Link>
                    <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-error hover:bg-error/5">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
