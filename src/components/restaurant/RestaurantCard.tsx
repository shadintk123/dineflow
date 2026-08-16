import { Link } from 'react-router-dom';
import { Heart, MapPin, Clock, Star, Users } from 'lucide-react';
import type { Restaurant } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { StarRating } from '@/components/ui/StarRating';
import { useFavorites } from '@/context/FavoritesContext';
import { cn, formatPrice, priceRangeLabel, isRestaurantOpen, mockDistance } from '@/lib/utils';

interface RestaurantCardProps {
  restaurant: Restaurant;
  index?: number;
}

export function RestaurantCard({ restaurant, index = 0 }: RestaurantCardProps) {
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(restaurant.id);
  const open = isRestaurantOpen(restaurant);
  const distance = mockDistance(restaurant.lat, restaurant.lng);

  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      className="group block overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-lift"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={restaurant.cover}
          alt={restaurant.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 via-transparent to-transparent" />
        <button
          onClick={(e) => { e.preventDefault(); toggle(restaurant.id); }}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-soft transition-all hover:scale-110 active:scale-95"
          aria-label={fav ? 'Remove favorite' : 'Add to favorites'}
        >
          <Heart className={cn('h-4.5 w-4.5 transition-colors', fav ? 'fill-error text-error' : 'text-ink/60')} />
        </button>
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge variant={open ? 'success' : 'error'}>
            <span className={cn('h-1.5 w-1.5 rounded-full', open ? 'bg-success' : 'bg-error')} />
            {open ? 'Open Now' : 'Closed'}
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <img src={restaurant.logo} alt="" className="h-10 w-10 rounded-xl border-2 border-white object-cover" />
          <div>
            <h3 className="font-display text-base font-bold text-white drop-shadow-sm">{restaurant.name}</h3>
            <p className="text-xs text-white/80">{restaurant.cuisine.slice(0, 2).join(' · ')}</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between">
          <StarRating rating={restaurant.rating} showValue count={restaurant.reviewCount} size="md" />
          <span className="text-xs font-bold text-primary-700">{priceRangeLabel(restaurant.priceRange)}</span>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{restaurant.address}, {restaurant.city}</span>
            <span className="shrink-0 font-semibold text-primary-700">· {distance} km</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>{restaurant.openingHours} – {restaurant.closingHours}</span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {restaurant.amenities.slice(0, 3).map((a) => (
            <span key={a} className="rounded-full bg-ivory px-2 py-0.5 text-[10px] font-semibold text-muted">
              {a}
            </span>
          ))}
          {restaurant.amenities.length > 3 && (
            <span className="rounded-full bg-ivory px-2 py-0.5 text-[10px] font-semibold text-muted">
              +{restaurant.amenities.length - 3}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-ink">
            <Users className="h-3.5 w-3.5 text-primary-500" />
            {restaurant.onlineCapacity} tables online
          </span>
          <span className="text-xs font-bold text-accent-600 group-hover:text-accent-500 transition-colors">
            View Restaurant →
          </span>
        </div>
      </div>
    </Link>
  );
}
