import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UtensilsCrossed, Menu, X, Calendar, MapPin, Heart, ShoppingBag, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Explore', to: '/explore' },
  { label: 'Restaurants', to: '/restaurants' },
];

const customerLinks = [
  { label: 'Reservations', to: '/customer/reservations' },
  { label: 'Orders', to: '/customer/orders' },
  { label: 'Favorites', to: '/customer/favorites' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const isLanding = location.pathname === '/';
  const links = user?.role === 'customer' ? [...navLinks, ...customerLinks] : navLinks;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled || !isLanding
          ? 'bg-surface/95 backdrop-blur-md shadow-soft border-b border-line'
          : 'bg-transparent'
      )}
    >
      <nav className="container-app flex items-center justify-between h-16 lg:h-18 transition-all duration-300">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className={cn(
            'flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
            scrolled || !isLanding ? 'bg-primary-600' : 'bg-white/15 backdrop-blur-md border border-white/20'
          )}>
            <UtensilsCrossed className={cn('h-5 w-5', scrolled || !isLanding ? 'text-white' : 'text-white')} />
          </div>
          <span className={cn(
            'font-display text-xl font-bold transition-colors',
            scrolled || !isLanding ? 'text-ink' : 'text-white'
          )}>
            Dinevia
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-7">
          {links.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'nav-link',
                  active && 'nav-link-active',
                  !scrolled && isLanding && !active && 'text-white/80 hover:text-white'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {user?.role === 'customer' && (
            <Link to="/customer/cart" className="relative">
              <Button variant={scrolled || !isLanding ? 'secondary' : 'ghost'} size="icon" className={cn(!scrolled && isLanding && 'text-white hover:bg-white/15')}>
                <ShoppingBag className="h-5 w-5" />
              </Button>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-400 px-1 text-[10px] font-bold text-white animate-pop">
                  {count}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <Link to={user.role === 'customer' ? '/customer/dashboard' : user.role === 'owner' ? '/owner/dashboard' : '/admin/dashboard'}>
                <Button variant={scrolled || !isLanding ? 'primary' : 'accent'} size="md">
                  <UserIcon className="h-4 w-4" />
                  {user.name.split(' ')[0]}
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant={scrolled || !isLanding ? 'ghost' : 'ghost'} size="md" className={cn(!scrolled && isLanding && 'text-white hover:bg-white/15')}>
                  Login
                </Button>
              </Link>
              <Link to="/reserve">
                <Button variant="accent" size="md">
                  <Calendar className="h-4 w-4" />
                  Reserve a Table
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={cn('lg:hidden rounded-lg p-2 transition-colors', !scrolled && isLanding ? 'text-white' : 'text-ink')}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="lg:hidden border-t border-line bg-surface animate-fade-in">
          <div className="container-app py-4 space-y-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block rounded-lg px-4 py-2.5 text-sm font-semibold text-ink hover:bg-primary-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-line space-y-2">
              {user ? (
                <Link to={user.role === 'customer' ? '/customer/dashboard' : user.role === 'owner' ? '/owner/dashboard' : '/admin/dashboard'}>
                  <Button variant="primary" size="md" fullWidth>
                    <UserIcon className="h-4 w-4" /> {user.name}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login"><Button variant="secondary" size="md" fullWidth>Login</Button></Link>
                  <Link to="/reserve"><Button variant="accent" size="md" fullWidth><Calendar className="h-4 w-4" /> Reserve a Table</Button></Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
