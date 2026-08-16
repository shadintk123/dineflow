import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UtensilsCrossed, User, Mail, Phone, Lock, Store, MapPin, Clock,
  CheckCircle2, ArrowRight, ArrowLeft, Upload, BadgeCheck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { allAmenities, menuCategories } from '@/data/restaurants';
import { cn } from '@/lib/utils';

const steps = ['Owner Details', 'Restaurant Details', 'Facilities & Media', 'Review & Submit'];

export function OwnerRegisterPage() {
  const { registerOwner } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    restaurantName: '', description: '', cuisine: '', restaurantPhone: '', restaurantEmail: '',
    address: '', city: '', district: '', state: '', postalCode: '', landmark: '',
    openingHours: '11:00', closingHours: '23:00', seatingCapacity: 50, tables: 15, priceRange: 2,
    amenities: [] as string[],
  });

  const toggleAmenity = (a: string) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));
  };

  const handleSubmit = async () => {
    if (form.password.length < 6) {
      error('Password too short', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const result = await registerOwner({
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
      restaurantName: form.restaurantName,
      description: form.description,
      cuisine: form.cuisine,
      restaurantPhone: form.restaurantPhone,
      restaurantEmail: form.restaurantEmail,
      address: form.address,
      city: form.city,
      district: form.district,
      state: form.state,
      postalCode: form.postalCode,
      landmark: form.landmark,
      openingHours: form.openingHours,
      closingHours: form.closingHours,
      seatingCapacity: form.seatingCapacity,
      tables: form.tables,
      priceRange: form.priceRange,
      amenities: form.amenities,
    });
    setLoading(false);
    if (result.success) {
      setSubmitted(true);
      success('Application submitted!', 'Your restaurant is pending approval.');
    } else {
      error('Registration failed', result.error);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory bg-grid p-4 pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg rounded-2xl border border-line bg-surface p-10 text-center shadow-card"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10"
          >
            <CheckCircle2 className="h-10 w-10 text-success" />
          </motion.div>
          <h1 className="font-display text-2xl font-bold text-ink">Application Submitted!</h1>
          <p className="mt-3 text-muted">
            Your restaurant application has been submitted. Our admin team will review it and notify you once it's approved.
          </p>
          <div className="mt-6 rounded-xl bg-ivory p-4 text-left">
            <p className="text-xs font-semibold text-muted">Your restaurant status</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-bold text-warning">
              <Clock className="h-4 w-4" /> Pending Review
            </p>
          </div>
          <Link to="/owner/dashboard" className="mt-6 inline-block">
            <Button variant="primary" size="lg">Go to Owner Dashboard <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory bg-grid pt-20 pb-12">
      <div className="container-narrow">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600">
            <UtensilsCrossed className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-2xl font-bold text-ink">Dinevia</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-line bg-surface p-6 shadow-card lg:p-8"
        >
          <div className="text-center">
            <BadgeCheck className="mx-auto mb-3 h-10 w-10 text-accent-400" />
            <h1 className="font-display text-2xl font-bold text-ink">Join as a Restaurant Partner</h1>
            <p className="mt-1 text-sm text-muted">List your restaurant on Dinevia and reach more diners.</p>
          </div>

          {/* Stepper */}
          <div className="mt-8 flex items-center justify-between">
            {steps.map((label, i) => (
              <div key={label} className="flex flex-1 items-center">
                <div className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors',
                  i === step ? 'bg-primary-600 text-white' : i < step ? 'bg-success text-white' : 'bg-ivory text-muted border border-line'
                )}>
                  {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className={cn('mx-2 h-0.5 flex-1 rounded', i < step ? 'bg-success' : 'bg-line')} />
                )}
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-sm font-semibold text-primary-700">{steps[step]}</p>

          <div className="mt-6">
            {step === 0 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="label-field">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                    <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" className="input-field pl-10" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-field">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                      <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="input-field pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="label-field">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                      <input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98470 12345" className="input-field pl-10" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="label-field">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                    <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className="input-field pl-10" />
                  </div>
                </div>
                <Button variant="primary" size="lg" fullWidth onClick={() => setStep(1)} disabled={!form.name || !form.email || !form.phone || !form.password}>
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="label-field">Restaurant Name</label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                    <input required value={form.restaurantName} onChange={(e) => setForm({ ...form, restaurantName: e.target.value })} placeholder="Malabar Spice House" className="input-field pl-10" />
                  </div>
                </div>
                <div>
                  <label className="label-field">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tell diners about your restaurant..." rows={3} className="input-field resize-none" />
                </div>
                <div>
                  <label className="label-field">Cuisine Type</label>
                  <input required value={form.cuisine} onChange={(e) => setForm({ ...form, cuisine: e.target.value })} placeholder="Kerala, Seafood, Biriyani" className="input-field" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-field">Restaurant Phone</label>
                    <input required value={form.restaurantPhone} onChange={(e) => setForm({ ...form, restaurantPhone: e.target.value })} placeholder="+91 98470 12345" className="input-field" />
                  </div>
                  <div>
                    <label className="label-field">Restaurant Email</label>
                    <input type="email" value={form.restaurantEmail} onChange={(e) => setForm({ ...form, restaurantEmail: e.target.value })} placeholder="hello@restaurant.in" className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="label-field">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                    <input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street address" className="input-field pl-10" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="label-field">City</label>
                    <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Kozhikode" className="input-field" />
                  </div>
                  <div>
                    <label className="label-field">District</label>
                    <input required value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="Kozhikode" className="input-field" />
                  </div>
                  <div>
                    <label className="label-field">State</label>
                    <input required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="Kerala" className="input-field" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="label-field">Postal Code</label>
                    <input required value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} placeholder="673004" className="input-field" />
                  </div>
                  <div>
                    <label className="label-field">Landmark</label>
                    <input value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} placeholder="Near..." className="input-field" />
                  </div>
                  <div>
                    <label className="label-field">Price Range</label>
                    <select value={form.priceRange} onChange={(e) => setForm({ ...form, priceRange: Number(e.target.value) })} className="input-field">
                      <option value={1}>₹ — Budget</option>
                      <option value={2}>₹₹ — Moderate</option>
                      <option value={3}>₹₹₹ — Premium</option>
                      <option value={4}>₹₹₹₹ — Fine Dining</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <label className="label-field">Opening</label>
                    <input type="time" value={form.openingHours} onChange={(e) => setForm({ ...form, openingHours: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="label-field">Closing</label>
                    <input type="time" value={form.closingHours} onChange={(e) => setForm({ ...form, closingHours: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="label-field">Seats</label>
                    <input type="number" value={form.seatingCapacity} onChange={(e) => setForm({ ...form, seatingCapacity: Number(e.target.value) })} className="input-field" />
                  </div>
                  <div>
                    <label className="label-field">Tables</label>
                    <input type="number" value={form.tables} onChange={(e) => setForm({ ...form, tables: Number(e.target.value) })} className="input-field" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" size="lg" onClick={() => setStep(0)}><ArrowLeft className="h-4 w-4" /> Back</Button>
                  <Button variant="primary" size="lg" fullWidth onClick={() => setStep(2)} disabled={!form.restaurantName || !form.address || !form.city}>
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <label className="label-field">Facilities & Amenities</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {allAmenities.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => toggleAmenity(a)}
                        className={cn('chip', form.amenities.includes(a) && 'chip-active')}
                      >
                        {form.amenities.includes(a) && <CheckCircle2 className="h-3.5 w-3.5" />}
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label-field">Media</label>
                  <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {['Restaurant Logo', 'Cover Image', 'Restaurant Photos', 'Food Photos'].map((label) => (
                      <div key={label} className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-line p-6 text-center hover:border-primary-300 transition-colors cursor-pointer">
                        <Upload className="h-6 w-6 text-muted" />
                        <p className="mt-2 text-xs font-semibold text-muted">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label-field">Business Verification</label>
                  <div className="mt-2 rounded-xl border-2 border-dashed border-line p-6 text-center hover:border-primary-300 transition-colors cursor-pointer">
                    <Upload className="mx-auto h-6 w-6 text-muted" />
                    <p className="mt-2 text-xs font-semibold text-muted">Upload license, GST certificate, or ID proof</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="secondary" size="lg" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4" /> Back</Button>
                  <Button variant="primary" size="lg" fullWidth onClick={() => setStep(3)}>
                    Review & Submit <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div className="rounded-xl bg-ivory p-5">
                  <h3 className="font-display text-sm font-bold uppercase tracking-wide text-muted">Owner</h3>
                  <p className="mt-2 text-sm font-bold text-ink">{form.name}</p>
                  <p className="text-sm text-muted">{form.email} · {form.phone}</p>
                </div>
                <div className="rounded-xl bg-ivory p-5">
                  <h3 className="font-display text-sm font-bold uppercase tracking-wide text-muted">Restaurant</h3>
                  <p className="mt-2 text-sm font-bold text-ink">{form.restaurantName}</p>
                  <p className="text-sm text-muted">{form.address}, {form.city}, {form.state} {form.postalCode}</p>
                  <p className="text-sm text-muted">{form.openingHours} – {form.closingHours} · {form.seatingCapacity} seats · {form.tables} tables</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {form.amenities.map((a) => (
                      <span key={a} className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700">{a}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" size="lg" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4" /> Back</Button>
                  <Button variant="accent" size="lg" fullWidth onClick={handleSubmit} loading={loading}>
                    Submit Application <CheckCircle2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
