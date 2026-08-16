import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UtensilsCrossed, ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';

export function AdminLoginPage() {
  const { loginAdmin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await loginAdmin(email, password);
    if (result.success) {
      success('Admin access granted', 'Welcome to the admin panel.');
      navigate('/admin/dashboard');
    } else {
      error('Access denied', result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-900 bg-grid p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-400">
            <UtensilsCrossed className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-2xl font-bold text-white">Dinevia</span>
        </Link>

        <div className="rounded-2xl border border-white/10 bg-surface p-8 shadow-lift">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-error/10">
              <ShieldCheck className="h-6 w-6 text-error" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-ink">Admin Access</h1>
              <p className="text-xs text-muted">Secure platform administration</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-field">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@dineflow.in" className="input-field pl-10" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="label-field">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-primary-700 hover:text-primary-800">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input-field pl-10" />
              </div>
            </div>
            <Button type="submit" variant="danger" size="lg" fullWidth loading={loading}>
              Secure Sign In <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted">
            Admin accounts are provisioned securely. No public registration.
          </p>
          <Link to="/" className="mt-5 block text-center text-sm text-muted hover:text-primary-700">
            ← Back to Dinevia
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
