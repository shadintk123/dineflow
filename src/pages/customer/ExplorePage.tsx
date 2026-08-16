import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, SlidersHorizontal, X, Navigation, Clock, Star, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { sampleRestaurants, popularLocations, allCuisines, allAmenities } from '@/data/restaurants';
import { RestaurantCard } from '@/components/restaurant/RestaurantCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { useGeolocation } from '@/hooks/useGeolocation';
import { cn, isRestaurantOpen, mockDistance } from '@/lib/utils';

type SortOption = 'nearest' | 'rating' | 'reviewed' | 'popular' | 'price_low' | 'earliest';

export function ExplorePage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    openNow: false,
    nearby: false,
    available: false,
    familyFriendly: false,
    vegetarian: false,
    halal: false,
    outdoor: false,
    privateDining: false,
    parking: false,
  });
  const [cuisineFilter, setCuisineFilter] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState<number[]>([]);
  const [sort, setSort] = useState<SortOption>('nearest');

  const geo = useGeolocation();
  const useUserCoords = geo.status === 'success' && geo.coords !== null;

  const toggleCuisine = (c: string) => {
    setCuisineFilter((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  };
  const togglePrice = (p: number) => {
    setPriceFilter((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  };

  const filtered = useMemo(() => {
    let result = sampleRestaurants.filter((r) => r.status === 'approved');

    if (query) {
      const q = query.toLowerCase();
      result = result.filter((r) =>
        r.name.toLowerCase().includes(q) ||
        r.cuisine.some((c) => c.toLowerCase().includes(q)) ||
        r.city.toLowerCase().includes(q) ||
        r.district.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q)
      );
    }

    if (location) {
      const loc = location.toLowerCase();
      result = result.filter((r) =>
        r.city.toLowerCase().includes(loc) ||
        r.district.toLowerCase().includes(loc) ||
        r.address.toLowerCase().includes(loc)
      );
    }

    if (filters.openNow) result = result.filter((r) => isRestaurantOpen(r));
    if (filters.nearby) result = result.filter((r) => {
      if (useUserCoords) return mockDistance(r.lat, r.lng, geo.coords!.lat, geo.coords!.lng) < 50;
      return mockDistance(r.lat, r.lng) < 50;
    });
    if (filters.available) result = result.filter((r) => r.onlineCapacity > 0);
    if (filters.familyFriendly) result = result.filter((r) => r.amenities.includes('Family Seating'));
    if (filters.vegetarian) result = result.filter((r) => r.amenities.includes('Vegetarian Food'));
    if (filters.halal) result = result.filter((r) => r.amenities.includes('Halal Food'));
    if (filters.outdoor) result = result.filter((r) => r.amenities.includes('Outdoor Seating'));
    if (filters.privateDining) result = result.filter((r) => r.amenities.includes('Private Dining'));
    if (filters.parking) result = result.filter((r) => r.amenities.includes('Parking'));

    if (cuisineFilter.length) result = result.filter((r) => cuisineFilter.some((c) => r.cuisine.includes(c)));
    if (priceFilter.length) result = result.filter((r) => priceFilter.includes(r.priceRange));

    switch (sort) {
      case 'rating': result = [...result].sort((a, b) => b.rating - a.rating); break;
      case 'reviewed': result = [...result].sort((a, b) => b.reviewCount - a.reviewCount); break;
      case 'popular': result = [...result].sort((a, b) => b.reviewCount * b.rating - a.reviewCount * a.rating); break;
      case 'price_low': result = [...result].sort((a, b) => a.priceRange - b.priceRange); break;
      case 'nearest': result = [...result].sort((a, b) => {
        if (useUserCoords) return mockDistance(a.lat, a.lng, geo.coords!.lat, geo.coords!.lng) - mockDistance(b.lat, b.lng, geo.coords!.lat, geo.coords!.lng);
        return mockDistance(a.lat, a.lng) - mockDistance(b.lat, b.lng);
      }); break;
      case 'earliest': result = [...result].sort((a, b) => a.openingHours.localeCompare(b.openingHours)); break;
    }

    return result;
  }, [query, location, filters, cuisineFilter, priceFilter, sort, useUserCoords, geo.coords]);

  const activeFilterCount =
    Object.values(filters).filter(Boolean).length +
    cuisineFilter.length + priceFilter.length;

  const clearFilters = () => {
    setFilters({ openNow: false, nearby: false, available: false, familyFriendly: false, vegetarian: false, halal: false, outdoor: false, privateDining: false, parking: false });
    setCuisineFilter([]);
    setPriceFilter([]);
  };

  const handleShareLocation = () => {
    geo.requestLocation();
    setLocation('');
  };

  return (
    <div className="pt-16 min-h-screen bg-ivory">
      {/* Search header */}
      <div className="bg-surface border-b border-line">
        <div className="container-app py-6">
          <h1 className="font-display text-2xl font-bold text-ink lg:text-3xl">Explore Restaurants</h1>
          <p className="mt-1 text-sm text-muted">Discover the best dining spots near you.</p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search restaurants, cuisines, or locations…"
                className="input-field pl-11 py-3"
              />
            </div>
            <div className="relative sm:w-56">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location (e.g. Kozhikode)"
                className="input-field pl-11 py-3"
              />
            </div>
            <Button
              variant={showFilters ? 'primary' : 'secondary'}
              size="md"
              onClick={() => setShowFilters(!showFilters)}
              className="shrink-0"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 rounded-full bg-accent-400 px-1.5 py-0.5 text-[10px] font-bold text-white">{activeFilterCount}</span>
              )}
            </Button>
          </div>

          {/* Popular locations + Share Location */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted">Popular:</span>
            {popularLocations.map((loc) => (
              <button
                key={loc.name}
                onClick={() => { setLocation(loc.name); geo.reset(); }}
                className="chip text-xs"
              >
                <MapPin className="h-3 w-3" /> {loc.name} ({loc.count})
              </button>
            ))}
            <button
              onClick={handleShareLocation}
              disabled={geo.status === 'loading'}
              className={cn(
                'chip text-xs',
                geo.status === 'success' && 'chip-active',
                geo.status === 'loading' && 'opacity-60 cursor-wait'
              )}
            >
              {geo.status === 'loading' ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : geo.status === 'success' ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <Navigation className="h-3 w-3" />
              )}
              {geo.status === 'loading' ? 'Detecting…' : geo.status === 'success' ? 'Location detected' : 'Share my location'}
            </button>
          </div>

          {/* Geolocation error message */}
          {geo.status !== 'idle' && geo.status !== 'loading' && geo.status !== 'success' && geo.error && (
            <div className={cn(
              'mt-3 flex items-start gap-2.5 rounded-xl border p-3 text-sm',
              geo.status === 'denied' && 'border-warning/30 bg-warning/5',
              geo.status === 'timeout' && 'border-warning/30 bg-warning/5',
              geo.status === 'unavailable' && 'border-error/30 bg-error/5',
              geo.status === 'error' && 'border-error/30 bg-error/5'
            )}>
              <AlertCircle className={cn('h-4 w-4 shrink-0 mt-0.5', (geo.status === 'denied' || geo.status === 'timeout') ? 'text-warning' : 'text-error')} />
              <div className="flex-1">
                <p className="text-ink">{geo.error}</p>
                {geo.status === 'denied' && (
                  <p className="mt-1 text-xs text-muted">You can still search by entering a location name above.</p>
                )}
              </div>
              {(geo.status === 'timeout' || geo.status === 'unavailable' || geo.status === 'error') && (
                <button onClick={handleShareLocation} className="shrink-0 text-xs font-bold text-primary-700 hover:underline">Retry</button>
              )}
            </div>
          )}

          {/* Location detected banner */}
          {geo.status === 'success' && (
            <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-success/30 bg-success/5 p-3 text-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
              <p className="text-ink">Showing restaurants sorted by distance from your current location.</p>
              <button onClick={geo.reset} className="ml-auto shrink-0 text-xs font-bold text-muted hover:text-ink">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container-app py-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Filter sidebar */}
          {showFilters && (
            <aside className="lg:w-72 shrink-0">
              <div className="sticky top-24 rounded-2xl border border-line bg-surface p-5 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-base font-bold text-ink">Filters</h3>
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="text-xs font-semibold text-error hover:underline">Clear all</button>
                  )}
                </div>

                <div className="space-y-5">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Quick Filters</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: 'openNow', label: 'Open Now', icon: Clock },
                        { key: 'nearby', label: 'Nearby', icon: Navigation },
                        { key: 'available', label: 'Available', icon: Star },
                      ].map((f) => (
                        <button
                          key={f.key}
                          onClick={() => setFilters({ ...filters, [f.key]: !filters[f.key as keyof typeof filters] })}
                          className={cn('chip', filters[f.key as keyof typeof filters] && 'chip-active')}
                        >
                          <f.icon className="h-3.5 w-3.5" /> {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Cuisine</p>
                    <div className="flex flex-wrap gap-2">
                      {allCuisines.map((c) => (
                        <button key={c} onClick={() => toggleCuisine(c)} className={cn('chip', cuisineFilter.includes(c) && 'chip-active')}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Price Range</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map((p) => (
                        <button
                          key={p}
                          onClick={() => togglePrice(p)}
                          className={cn(
                            'flex h-9 w-12 items-center justify-center rounded-lg border text-sm font-bold transition-all',
                            priceFilter.includes(p) ? 'border-primary-600 bg-primary-600 text-white' : 'border-line bg-ivory text-ink hover:border-primary-300'
                          )}
                        >
                          {'₹'.repeat(p)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: 'familyFriendly', label: 'Family' },
                        { key: 'vegetarian', label: 'Vegetarian' },
                        { key: 'halal', label: 'Halal' },
                        { key: 'outdoor', label: 'Outdoor' },
                        { key: 'privateDining', label: 'Private' },
                        { key: 'parking', label: 'Parking' },
                      ].map((f) => (
                        <button
                          key={f.key}
                          onClick={() => setFilters({ ...filters, [f.key]: !filters[f.key as keyof typeof filters] })}
                          className={cn('chip', filters[f.key as keyof typeof filters] && 'chip-active')}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Results */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-muted">
                <span className="font-bold text-ink">{filtered.length}</span> restaurants found
                {useUserCoords && <span className="ml-1 text-primary-700">· sorted by distance</span>}
              </p>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="rounded-xl border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink shadow-soft focus:outline-none focus:ring-4 focus:ring-primary-500/10"
              >
                <option value="nearest">Nearest</option>
                <option value="rating">Highest Rated</option>
                <option value="reviewed">Most Reviewed</option>
                <option value="popular">Most Popular</option>
                <option value="price_low">Lowest Price</option>
                <option value="earliest">Earliest Available</option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                icon={<Search className="h-7 w-7" />}
                title="No restaurants found"
                description="Try adjusting your search or filters to find more options."
                action={<Button variant="secondary" size="md" onClick={clearFilters}>Clear Filters</Button>}
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((restaurant, i) => (
                  <ScrollReveal key={restaurant.id} delay={(i % 3) * 80} variant="fade-up">
                    <RestaurantCard restaurant={restaurant} index={i} />
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
