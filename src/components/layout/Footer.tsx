import { Link } from 'react-router-dom';
import { UtensilsCrossed, Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const sections = [
  {
    title: 'Discover',
    links: [
      { label: 'Explore Restaurants', to: '/explore' },
      { label: 'Top Rated', to: '/explore?sort=rating' },
      { label: 'Nearby', to: '/explore?filter=nearby' },
      { label: 'Open Now', to: '/explore?filter=open' },
    ],
  },
  {
    title: 'For Customers',
    links: [
      { label: 'How It Works', to: '/#how-it-works' },
      { label: 'Reserve a Table', to: '/reserve' },
      { label: 'My Reservations', to: '/customer/reservations' },
      { label: 'Help & Support', to: '/#contact' },
    ],
  },
  {
    title: 'For Restaurants',
    links: [
      { label: 'List Your Restaurant', to: '/owner/register' },
      { label: 'Owner Dashboard', to: '/owner/dashboard' },
      { label: 'Partner Benefits', to: '/#owner-benefits' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-primary-900 text-white/80">
      <div className="container-app py-16">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-400">
                <UtensilsCrossed className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-white">Dinevia</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-white/60">
              Reserve Smart. Arrive Ready. Dine Without Waiting. The smart way to discover and reserve tables at the best restaurants.
            </p>
            <div className="mt-5 flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/70 hover:bg-accent-400 hover:text-white transition-all duration-200"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="font-display text-sm font-bold uppercase tracking-wide text-white">{section.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-white/60 hover:text-accent-300 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-white/50">© 2025 Dinevia. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6 text-xs text-white/50">
            <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> hello@dineflow.in</span>
            <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> +91 90000 12345</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Kozhikode, Kerala</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
