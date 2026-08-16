import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UtensilsCrossed, User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { GoogleSignInButton } from '@/components/ui/GoogleSignInButton';

export function RegisterPage() {
  const { registerCustomer, signInWithGoogle } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      error('Password mismatch', 'Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      error('Password too short', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const result = await registerCustomer(form);
    if (result.success) {
      success('Account created!', 'Welcome to Dinevia. Please sign in to continue.');
      navigate('/login');
    } else {
      error('Registration failed', result.error);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const result = await signInWithGoogle();
    if (!result.success) {
      error('Google sign-in failed', result.error);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory bg-grid p-4 pt-20 pb-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600">
            <UtensilsCrossed className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-2xl font-bold text-ink">Dinevia</span>
        </Link>

        <div className="rounded-2xl border border-line bg-surface p-8 shadow-card">
          <h1 className="font-display text-2xl font-bold text-ink">Create Account</h1>
          <p className="mt-1 text-sm text-muted">Join Dinevia and start reserving smarter.</p>

          <div className="mt-6">
            <GoogleSignInButton onClick={handleGoogle} loading={googleLoading} label="Sign up with Google" />
          </div>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs font-semibold text-muted">or sign up with email</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-field">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" className="input-field pl-10" />
              </div>
            </div>
            <div>
              <label className="label-field">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="input-field pl-10" />
              </div>
            </div>
            <div>
              <label className="label-field">Phone (optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98470 12345" className="input-field pl-10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-field">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                  <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className="input-field pl-10" />
                </div>
              </div>
              <div>
                <label className="label-field">Confirm</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                  <input type="password" required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="••••••••" className="input-field pl-10" />
                </div>
              </div>
            </div>
            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              Create Account <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary-700 hover:text-primary-800">Sign In</Link>
          </p>
          <p className="mt-2 text-center text-sm text-muted">
            Restaurant partner?{' '}
            <Link to="/owner/register" className="font-bold text-accent-600 hover:text-accent-700">List Your Restaurant</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
