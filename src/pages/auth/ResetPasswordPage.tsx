import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

export function ResetPasswordPage() {
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      error('Password mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      error('Password too short', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);

    try {
      const { error: funcError } = await supabase.functions.invoke('password-reset', {
        body: JSON.stringify({ action: 'reset', token, password }),
      });

      if (funcError) {
        error('Reset failed', 'Invalid or expired reset link.');
      } else {
        setDone(true);
        success('Password reset!', 'You can now log in with your new password.');
      }
    } catch {
      error('Reset failed', 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory bg-grid p-4 pt-20">
        <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-card text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-error" />
          <h1 className="font-display text-xl font-bold text-ink">Invalid Reset Link</h1>
          <p className="mt-2 text-sm text-muted">This reset link is missing a valid token.</p>
          <Link to="/forgot-password" className="mt-6 inline-block">
            <Button variant="primary" size="md">Request New Link</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory bg-grid p-4 pt-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600">
            <UtensilsCrossed className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-2xl font-bold text-ink">Dinevia</span>
        </Link>

        <div className="rounded-2xl border border-line bg-surface p-8 shadow-card">
          {done ? (
            <div className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }} className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </motion.div>
              <h1 className="font-display text-xl font-bold text-ink">Password Reset</h1>
              <p className="mt-2 text-sm text-muted">Your password has been reset. You can now log in with your new password.</p>
              <Link to="/login" className="mt-6 inline-block">
                <Button variant="primary" size="lg">Go to Login <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-ink">Reset Password</h1>
              <p className="mt-1 text-sm text-muted">Enter your new password below.</p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="label-field">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input-field pl-10" />
                  </div>
                </div>
                <div>
                  <label className="label-field">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                    <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" className="input-field pl-10" />
                  </div>
                </div>
                <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                  Reset Password <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
