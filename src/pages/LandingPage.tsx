import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import {
  Search, Calendar, UtensilsCrossed, Clock, MapPin, Star, Heart, ShoppingBag,
  QrCode, Bell, TrendingDown, Users, Table2, ChefHat, Leaf, ShieldCheck,
  ArrowRight, Sparkles, Quote, CheckCircle2, Timer, Smartphone
} from 'lucide-react';
import { ScrollReveal, Parallax } from '@/components/ui/ScrollReveal';
import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/ui/StarRating';
import { Badge } from '@/components/ui/Badge';
import { sampleRestaurants, sampleReviews } from '@/data/restaurants';
import { RestaurantCard } from '@/components/restaurant/RestaurantCard';

const stats = [
  { value: '500+', label: 'Restaurants', icon: Store },
  { value: '50K+', label: 'Happy Diners', icon: Users },
  { value: '120K+', label: 'Reservations', icon: Calendar },
  { value: '40%', label: 'Less Waiting', icon: Clock },
];

const features = [
  { icon: Search, title: 'Smart Discovery', desc: 'Find restaurants by location, cuisine, or vibe. Filter by what matters — open now, nearby, family-friendly.' },
  { icon: Table2, title: 'Table Selection', desc: 'See real-time table availability and choose your exact seat — main hall, outdoor, family area, or VIP.' },
  { icon: UtensilsCrossed, title: 'Pre-Order Food', desc: 'Browse the menu before you arrive. Your meal is timed to your arrival so it comes out fresh.' },
  { icon: QrCode, title: 'QR Check-In', desc: 'Skip the wait. Scan your reservation QR at the door and your table is ready, your food is on the way.' },
  { icon: Timer, title: 'Smart Arrival', desc: 'Running late? Update your arrival time in one tap. The kitchen adjusts preparation automatically.' },
  { icon: Bell, title: 'Live Updates', desc: 'Get notified about your reservation, preparation status, and table readiness — no more guessing.' },
];

const steps = [
  { icon: Search, title: 'Discover', desc: 'Search restaurants by location, cuisine, or availability.' },
  { icon: Calendar, title: 'Reserve', desc: 'Pick your date, time, seating area, and exact table.' },
  { icon: UtensilsCrossed, title: 'Pre-Order', desc: 'Add food to your reservation. Choose preparation timing.' },
  { icon: QrCode, title: 'Arrive & Dine', desc: 'Scan your QR, sit down, and enjoy your meal — no waiting.' },
];

const customerBenefits = [
  'No more waiting for a table',
  'Browse menus before you arrive',
  'Choose your exact seating area',
  'Food timed to your arrival',
  'Update arrival if running late',
  'QR check-in for instant seating',
];

const ownerBenefits = [
  'Reduce food waste with smart prep',
  'Minimize no-shows with reminders',
  'Optimize table utilization',
  'Manage walk-in vs online capacity',
  'Prevent kitchen overload',
  'Track performance with analytics',
];

const testimonials = [
  { name: 'Arjun Menon', role: 'Frequent Diner', text: 'I showed up at 7:30, my table was ready, and the biriyani came out 5 minutes later. This is how dining should work.', rating: 5 },
  { name: 'Fatima Rashid', role: 'Food Blogger', text: 'The pre-order feature is brilliant. I ordered ahead, timed it to my arrival, and everything was fresh and hot.', rating: 5 },
  { name: 'Vishnu Kumar', role: 'Restaurant Owner', text: 'Dinevia cut our no-shows by 60% and food waste by a third. The smart kitchen timing is a game changer.', rating: 5 },
];

import { Store } from 'lucide-react';

const easeOut = [0.22, 1, 0.36, 1] as const;

export function LandingPage() {
  const topRestaurants = sampleRestaurants.slice(0, 6);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroImageY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroContentY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const heroContentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center bg-primary-900 pt-16">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900 via-primary-900 to-primary-800" />
        <div className="absolute top-1/4 right-0 h-96 w-96 rounded-full bg-accent-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-primary-400/20 blur-3xl" />

        <div className="container-app relative z-10 py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div style={{ y: heroContentY, opacity: heroContentOpacity }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: easeOut }}
              >
                <Badge variant="accent" className="mb-5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Smart Restaurant Platform
                </Badge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.12, ease: easeOut }}
                className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl text-balance"
              >
                Find Your Table
                <span className="block text-accent-400">Before You Arrive.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25, ease: easeOut }}
                className="mt-6 max-w-lg text-lg text-white/70"
              >
                Discover restaurants, reserve your preferred table, and pre-order your meal with smarter timing.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.38, ease: easeOut }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <Link to="/explore">
                  <Button variant="accent" size="lg">
                    <Search className="h-5 w-5" />
                    Explore Restaurants
                  </Button>
                </Link>
                <Link to="/reserve">
                  <Button variant="secondary" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/15 hover:border-white/30">
                    <Calendar className="h-5 w-5" />
                    Reserve a Table
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.55, ease: easeOut }}
                className="mt-10 flex items-center gap-6"
              >
                <div className="flex -space-x-2">
                  {sampleRestaurants.slice(0, 4).map((r) => (
                    <img key={r.id} src={r.logo} alt="" className="h-10 w-10 rounded-full border-2 border-primary-900 object-cover" />
                  ))}
                </div>
                <div>
                  <StarRating rating={4.7} showValue size="md" className="text-white" />
                  <p className="text-xs text-white/60">Loved by 50,000+ diners</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero visual with parallax */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: easeOut }}
              className="relative hidden lg:block"
            >
              <motion.div style={{ y: heroImageY }} className="relative rounded-3xl overflow-hidden shadow-lift">
                <img
                  src="https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Restaurant table"
                  className="h-[500px] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/50 to-transparent" />
              </motion.div>

              {/* Floating cards */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -left-6 top-12 rounded-2xl border border-line bg-surface p-4 shadow-lift w-56"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ink">Table Reserved</p>
                    <p className="text-[10px] text-muted">A-01 · Main Hall · 7:30 PM</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -right-4 top-1/2 rounded-2xl border border-line bg-surface p-4 shadow-lift w-52"
              >
                <div className="flex items-center gap-2 mb-2">
                  <ChefHat className="h-4 w-4 text-accent-500" />
                  <p className="text-xs font-bold text-ink">Prep Starting</p>
                </div>
                <p className="text-[10px] text-muted">Food will be ready at 7:25 PM — timed to your arrival</p>
                <div className="mt-2 h-1.5 rounded-full bg-ivory">
                  <div className="h-1.5 w-2/3 rounded-full bg-accent-400" />
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-4 left-1/4 rounded-2xl border border-line bg-surface p-3 shadow-lift"
              >
                <div className="flex items-center gap-2">
                  <QrCode className="h-8 w-8 text-primary-600" />
                  <div>
                    <p className="text-xs font-bold text-ink">DF847291</p>
                    <p className="text-[10px] text-muted">Scan to check in</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full h-auto">
            <path d="M0 80L1440 80L1440 20Q720 80 0 20Z" fill="#F8F7F2" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-ivory py-16">
        <div className="container-app">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <ScrollReveal key={stat.label} delay={i * 80} variant="fade-up">
                <div className="group text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white">
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <p className="font-display text-3xl font-bold text-ink">{stat.value}</p>
                  <p className="mt-1 text-sm text-muted">{stat.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-ivory py-20">
        <div className="container-app">
          <ScrollReveal className="mx-auto max-w-2xl text-center" variant="fade-up">
            <Badge variant="primary" className="mb-4">Features</Badge>
            <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl text-balance">
              Everything you need for a perfect dining experience
            </h2>
            <p className="mt-4 text-muted">
              From discovery to check-in, Dinevia handles every step so you can focus on enjoying your meal.
            </p>
          </ScrollReveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <ScrollReveal key={feature.title} delay={(i % 3) * 100} variant="fade-up">
                <div className="group h-full rounded-2xl border border-line bg-surface p-6 shadow-card transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-lift">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-ink">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted leading-relaxed">{feature.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-surface py-20">
        <div className="container-app">
          <ScrollReveal className="mx-auto max-w-2xl text-center" variant="fade-up">
            <Badge variant="accent" className="mb-4">How It Works</Badge>
            <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl text-balance">
              From search to seated in four simple steps
            </h2>
          </ScrollReveal>

          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <ScrollReveal key={step.title} delay={i * 120} variant="fade-up">
                <div className="group relative text-center">
                  <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-soft transition-transform duration-500 group-hover:scale-105">
                    <step.icon className="h-7 w-7" />
                    <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-accent-400 text-xs font-bold text-white shadow-soft">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted">{step.desc}</p>
                  {i < steps.length - 1 && (
                    <ArrowRight className="absolute -right-4 top-8 hidden h-6 w-6 text-line lg:block" />
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Top Restaurants */}
      <section className="bg-ivory py-20">
        <div className="container-app">
          <ScrollReveal className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-end" variant="fade-up">
            <div>
              <Badge variant="primary" className="mb-3">Top Rated</Badge>
              <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">Featured Restaurants</h2>
            </div>
            <Link to="/explore">
              <Button variant="outline" size="md">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </ScrollReveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {topRestaurants.map((restaurant, i) => (
              <ScrollReveal key={restaurant.id} delay={(i % 3) * 100} variant="fade-up">
                <RestaurantCard restaurant={restaurant} index={i} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits split */}
      <section className="bg-surface py-20">
        <div className="container-app">
          <div className="grid gap-12 lg:grid-cols-2">
            <ScrollReveal variant="fade-right">
              <div className="group h-full rounded-3xl border border-line bg-ivory p-8 transition-all duration-500 hover:shadow-card lg:p-10">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white transition-transform duration-500 group-hover:scale-105">
                  <Users className="h-7 w-7" />
                </div>
                <h3 className="font-display text-2xl font-bold text-ink">For Customers</h3>
                <p className="mt-2 text-muted">Your table is planned. Your meal is timed. Your waiting is reduced.</p>
                <ul className="mt-6 space-y-3">
                  {customerBenefits.map((benefit, i) => (
                    <motion.li
                      key={benefit}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-50px' }}
                      transition={{ duration: 0.4, delay: i * 60, ease: easeOut }}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                      <span className="text-sm font-medium text-ink">{benefit}</span>
                    </motion.li>
                  ))}
                </ul>
                <Link to="/register" className="mt-8 inline-block">
                  <Button variant="primary" size="md">Create Account <ArrowRight className="h-4 w-4" /></Button>
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100} variant="fade-left">
              <div id="owner-benefits" className="group h-full rounded-3xl border border-line bg-primary-900 p-8 transition-all duration-500 hover:shadow-lift lg:p-10">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-400 text-white transition-transform duration-500 group-hover:scale-105">
                  <Store className="h-7 w-7" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white">For Restaurants</h3>
                <p className="mt-2 text-white/60">Reduce waste, optimize tables, and deliver a better dining experience.</p>
                <ul className="mt-6 space-y-3">
                  {ownerBenefits.map((benefit, i) => (
                    <motion.li
                      key={benefit}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-50px' }}
                      transition={{ duration: 0.4, delay: i * 60, ease: easeOut }}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent-400" />
                      <span className="text-sm font-medium text-white/90">{benefit}</span>
                    </motion.li>
                  ))}
                </ul>
                <Link to="/owner/register" className="mt-8 inline-block">
                  <Button variant="accent" size="md">List Your Restaurant <ArrowRight className="h-4 w-4" /></Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-ivory py-20">
        <div className="container-app">
          <ScrollReveal className="mx-auto max-w-2xl text-center" variant="fade-up">
            <Badge variant="accent" className="mb-4">Testimonials</Badge>
            <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl text-balance">
              Loved by diners and restaurant owners alike
            </h2>
          </ScrollReveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 100} variant="fade-up">
                <div className="group h-full rounded-2xl border border-line bg-surface p-6 shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-lift">
                  <Quote className="h-8 w-8 text-accent-300 transition-transform duration-500 group-hover:scale-110" />
                  <p className="mt-4 text-sm text-ink leading-relaxed">"{t.text}"</p>
                  <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink">{t.name}</p>
                      <p className="text-xs text-muted">{t.role}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-900 py-20 relative overflow-hidden">
        <Parallax speed={0.15} className="absolute top-0 right-0 h-72 w-72 rounded-full bg-accent-400/20 blur-3xl" />
        <div className="container-app relative z-10">
          <ScrollReveal className="mx-auto max-w-3xl text-center" variant="fade-scale">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl text-balance">
              Your table is planned. Your meal is timed. Your waiting is reduced.
            </h2>
            <p className="mt-5 text-lg text-white/70">
              Join thousands of diners who've made waiting a thing of the past.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/explore">
                <Button variant="accent" size="lg"><Search className="h-5 w-5" /> Explore Restaurants</Button>
              </Link>
              <Link to="/owner/register">
                <Button variant="secondary" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/15">
                  <Store className="h-5 w-5" /> List Your Restaurant
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
