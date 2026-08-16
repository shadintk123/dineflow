import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Clock, Phone, Mail, Star, Heart, Share2, Navigation,
  Calendar, UtensilsCrossed, ShoppingBag, Check, ArrowLeft, Plus, Minus,
  Leaf, Flame, Search, ChevronRight, MessageSquare
} from 'lucide-react';
import { sampleRestaurants, sampleMenuItems, sampleReviews, menuCategories } from '@/data/restaurants';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StarRating } from '@/components/ui/StarRating';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useToast } from '@/context/ToastContext';
import { cn, formatPrice, priceRangeLabel, isRestaurantOpen, mockDistance } from '@/lib/utils';
import type { MenuItem } from '@/types';

export function RestaurantDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const restaurant = sampleRestaurants.find((r) => r.id === id);
  const { items, addItem, updateQuantity, total, count, setRestaurantId } = useCart();
  const { isFavorite, toggle } = useFavorites();
  const { success } = useToast();
  const [activeCategory, setActiveCategory] = useState('All');
  const [menuSearch, setMenuSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);

  const menuItems = useMemo(() => {
    if (!restaurant) return [];
    let items = sampleMenuItems.filter((m) => m.restaurantId === restaurant.id);
    if (activeCategory !== 'All') items = items.filter((m) => m.category === activeCategory);
    if (menuSearch) {
      const q = menuSearch.toLowerCase();
      items = items.filter((m) => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
    }
    return items;
  }, [restaurant, activeCategory, menuSearch]);

  if (!restaurant) {
    return (
      <div className="pt-24 container-app">
        <p className="text-muted">Restaurant not found.</p>
        <Link to="/explore"><Button variant="primary" size="md" className="mt-4">Back to Explore</Button></Link>
      </div>
    );
  }

  const fav = isFavorite(restaurant.id);
  const open = isRestaurantOpen(restaurant);
  const distance = mockDistance(restaurant.lat, restaurant.lng);
  const reviews = sampleReviews.filter((r) => r.restaurantId === restaurant.id);
  const categories = ['All', ...menuCategories.filter((c) => sampleMenuItems.some((m) => m.restaurantId === restaurant.id && m.category === c))];

  const getItemQty = (menuItemId: string) => items.find((i) => i.menuItemId === menuItemId)?.quantity || 0;

  const handleAddItem = (item: MenuItem) => {
    if (items.length > 0 && items[0] && items[0].menuItemId !== item.id) {
      // different restaurant cart — just clear and start fresh for this restaurant
    }
    setRestaurantId(restaurant.id);
    addItem(item);
    success('Added to cart', item.name);
  };

  return (
    <div className="pt-16 min-h-screen bg-ivory">
      {/* Cover */}
      <div className="relative h-72 lg:h-96 overflow-hidden">
        <img src={restaurant.cover} alt={restaurant.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-primary-900/20 to-transparent" />
        <div className="absolute top-4 left-4">
          <Link to="/explore">
            <Button variant="secondary" size="sm" className="bg-white/90 backdrop-blur-sm border-white/20">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => { toggle(restaurant.id); success(fav ? 'Removed from favorites' : 'Added to favorites'); }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-soft hover:scale-110 transition-transform"
          >
            <Heart className={cn('h-5 w-5', fav ? 'fill-error text-error' : 'text-ink/60')} />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-soft hover:scale-110 transition-transform">
            <Share2 className="h-5 w-5 text-ink/60" />
          </button>
        </div>
      </div>

      <div className="container-app -mt-20 relative z-10">
        {/* Header card */}
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-lift">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <img src={restaurant.logo} alt="" className="h-20 w-20 rounded-2xl border-2 border-surface object-cover shadow-soft -mt-12 sm:mt-0" />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="font-display text-2xl font-bold text-ink lg:text-3xl">{restaurant.name}</h1>
                  <p className="mt-1 text-sm text-muted">{restaurant.cuisine.join(' · ')} · {priceRangeLabel(restaurant.priceRange)}</p>
                </div>
                <Badge variant={open ? 'success' : 'error'}>
                  <span className={cn('h-1.5 w-1.5 rounded-full', open ? 'bg-success' : 'bg-error')} />
                  {open ? 'Open Now' : 'Closed'}
                </Badge>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                <StarRating rating={restaurant.rating} showValue count={restaurant.reviewCount} size="md" />
                <span className="flex items-center gap-1.5 text-muted"><MapPin className="h-4 w-4" /> {distance} km away</span>
                <span className="flex items-center gap-1.5 text-muted"><Clock className="h-4 w-4" /> {restaurant.openingHours} – {restaurant.closingHours}</span>
              </div>

              <p className="mt-3 text-sm text-ink leading-relaxed">{restaurant.description}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {restaurant.amenities.map((a) => (
                  <span key={a} className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">{a}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3 border-t border-line pt-5">
            <Link to={`/reserve?restaurant=${restaurant.id}`} className="flex-1 sm:flex-initial">
              <Button variant="primary" size="lg" fullWidth><Calendar className="h-4 w-4" /> Reserve a Table</Button>
            </Link>
            <Button variant="accent" size="lg" onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}>
              <UtensilsCrossed className="h-4 w-4" /> Browse Menu
            </Button>
            <Button variant="secondary" size="lg"><Navigation className="h-4 w-4" /> Get Directions</Button>
          </div>
        </div>

        {/* Info grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-center gap-2 text-primary-600"><MapPin className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-wide">Address</span></div>
            <p className="mt-2 text-sm text-ink">{restaurant.address}</p>
            <p className="text-sm text-muted">{restaurant.city}, {restaurant.state} {restaurant.postalCode}</p>
            {restaurant.landmark && <p className="mt-1 text-xs text-muted">Landmark: {restaurant.landmark}</p>}
          </div>
          <div className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-center gap-2 text-primary-600"><Phone className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-wide">Contact</span></div>
            <p className="mt-2 text-sm text-ink">{restaurant.phone}</p>
            <p className="text-sm text-muted">{restaurant.email}</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-center gap-2 text-primary-600"><Clock className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-wide">Hours</span></div>
            <p className="mt-2 text-sm text-ink">{restaurant.openingHours} – {restaurant.closingHours}</p>
            <p className="text-sm text-muted">{restaurant.workingDays.join(', ')}</p>
          </div>
        </div>

        {/* Photo gallery */}
        <div className="mt-6">
          <h2 className="font-display text-xl font-bold text-ink mb-4">Photo Gallery</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {restaurant.photos.map((photo, i) => (
              <div key={i} className={cn('overflow-hidden rounded-xl', i === 0 && 'col-span-2 row-span-2')}>
                <img src={photo} alt="" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
              </div>
            ))}
          </div>
        </div>

        {/* Menu */}
        <div id="menu" className="mt-8">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-display text-xl font-bold text-ink lg:text-2xl">Menu</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                placeholder="Search menu..."
                className="input-field pl-10 py-2 text-sm w-full sm:w-64"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all',
                  activeCategory === cat ? 'bg-primary-600 text-white shadow-soft' : 'bg-surface border border-line text-ink hover:border-primary-300'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {menuItems.map((item) => {
              const qty = getItemQty(item.id);
              return (
                <div key={item.id} className="flex gap-4 rounded-2xl border border-line bg-surface p-4 shadow-card transition-all hover:shadow-lift">
                  <img src={item.image} alt={item.name} className="h-24 w-24 shrink-0 rounded-xl object-cover" loading="lazy" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={cn('flex h-4 w-4 items-center justify-center rounded-sm border', item.isVeg ? 'border-success' : 'border-error')}>
                            <span className={cn('h-2 w-2 rounded-full', item.isVeg ? 'bg-success' : 'bg-error')} />
                          </span>
                          <h3 className="font-display text-sm font-bold text-ink">{item.name}</h3>
                          {item.popular && <Badge variant="accent" className="text-[10px] py-0.5">Popular</Badge>}
                        </div>
                        <p className="mt-1 text-xs text-muted line-clamp-2">{item.description}</p>
                      </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center gap-3">
                        <span className="font-display text-base font-bold text-ink">{formatPrice(item.price)}</span>
                        <span className="flex items-center gap-1 text-[10px] text-muted">
                          <Clock className="h-3 w-3" /> {item.prepTime}m
                        </span>
                      </div>
                      {qty === 0 ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAddItem(item)}
                          disabled={!item.available}
                        >
                          <Plus className="h-4 w-4" /> Add
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 rounded-xl bg-primary-600 p-1">
                          <button onClick={() => updateQuantity(item.id, qty - 1)} className="flex h-7 w-7 items-center justify-center rounded-lg text-white hover:bg-primary-700 transition-colors">
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-6 text-center text-sm font-bold text-white">{qty}</span>
                          <button onClick={() => updateQuantity(item.id, qty + 1)} className="flex h-7 w-7 items-center justify-center rounded-lg text-white hover:bg-primary-700 transition-colors">
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    {!item.available && <p className="text-xs text-error font-semibold">Currently unavailable</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-8">
          <h2 className="font-display text-xl font-bold text-ink lg:text-2xl">Reviews</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-line bg-surface p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                      {review.customerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink">{review.customerName}</p>
                      <p className="text-xs text-muted">{review.date}</p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                </div>
                <p className="mt-3 text-sm text-ink leading-relaxed">{review.comment}</p>
                {review.ownerReply && (
                  <div className="mt-3 rounded-xl bg-ivory p-3 border-l-4 border-primary-300">
                    <p className="text-xs font-bold text-primary-700">Restaurant Reply</p>
                    <p className="mt-1 text-xs text-muted">{review.ownerReply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating cart bar */}
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-2xl"
          >
            <button
              onClick={() => setCartOpen(true)}
              className="flex w-full items-center justify-between rounded-2xl bg-primary-600 px-5 py-4 text-white shadow-lift hover:bg-primary-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingBag className="h-6 w-6" />
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-400 px-1 text-[10px] font-bold text-white animate-pop">{count}</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">{count} items · {formatPrice(total)}</p>
                  <p className="text-xs text-white/70">View cart & pre-order</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart drawer */}
      <AnimatePresence>
        {cartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <div className="absolute inset-0 bg-primary-900/40 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 top-0 h-full w-full max-w-md bg-surface shadow-lift overflow-y-auto"
            >
              <div className="sticky top-0 flex items-center justify-between border-b border-line bg-surface px-5 py-4">
                <h3 className="font-display text-lg font-bold text-ink">Your Cart</h3>
                <button onClick={() => setCartOpen(false)} className="rounded-lg p-2 text-muted hover:bg-ivory">✕</button>
              </div>
              <div className="p-5">
                {items.length === 0 ? (
                  <p className="text-center text-sm text-muted py-8">Your cart is empty.</p>
                ) : (
                  <>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.menuItemId} className="flex gap-3 rounded-xl border border-line p-3">
                          <img src={item.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
                          <div className="flex-1">
                            <p className="text-sm font-bold text-ink">{item.name}</p>
                            <p className="text-xs text-muted">{formatPrice(item.price)} · {item.prepTime}m prep</p>
                            <div className="mt-2 flex items-center gap-2">
                              <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-ink hover:bg-ivory"><Minus className="h-3 w-3" /></button>
                              <span className="min-w-6 text-center text-sm font-bold">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-ink hover:bg-ivory"><Plus className="h-3 w-3" /></button>
                            </div>
                          </div>
                          <p className="text-sm font-bold text-ink">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 border-t border-line pt-4">
                      <div className="flex justify-between text-sm"><span className="text-muted">Subtotal</span><span className="font-bold text-ink">{formatPrice(total)}</span></div>
                      <div className="mt-1 flex justify-between text-sm"><span className="text-muted">Platform fee</span><span className="font-bold text-ink">₹0</span></div>
                      <div className="mt-3 flex justify-between border-t border-line pt-3"><span className="font-bold text-ink">Total</span><span className="font-display text-lg font-bold text-primary-700">{formatPrice(total)}</span></div>
                    </div>
                    <Link to={`/reserve?restaurant=${restaurant.id}`} onClick={() => setCartOpen(false)}>
                      <Button variant="primary" size="lg" fullWidth className="mt-5">
                        Proceed to Reserve <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
