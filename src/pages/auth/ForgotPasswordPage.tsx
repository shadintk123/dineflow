import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Mail, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

export function ForgotPasswordPage() {
  const { success, error } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: funcData, error: funcError } = await supabase.functions.invoke('password-reset', {
        body: JSON.stringify({ action: 'request', email }),
      });

      if (funcError) {
        error('Request failed', 'Something went wrong. Please try again.');
      } else {
        setSent(true);
        success('Check your email', 'If an account exists, reset instructions have been sent.');
        // For demo: if a reset link is returned, show it (email not configured)
        if (funcData?.resetLink) {
          // Will be displayed below
        }
      }
    } catch {
      error('Request failed', 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

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
          {sent ? (
            <div className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }} className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </motion.div>
              <h1 className="font-display text-xl font-bold text-ink">Check Your Email</h1>
              <p className="mt-2 text-sm text-muted">
                If an account exists for this email, you will receive password-reset instructions.
              </p>
              <Link to="/login" className="mt-6 inline-block">
                <Button variant="secondary" size="md"><ArrowLeft className="h-4 w-4" /> Back to Login</Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-ink">Forgot Password</h1>
              <p className="mt-1 text-sm text-muted">Enter your email and we'll send you reset instructions.</p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="label-field">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input-field pl-10" />
                  </div>
                </div>
                <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                  Send Reset Link <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              <Link to="/login" className="mt-6 block text-center text-sm text-muted hover:text-primary-700">
                ← Back to Login
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
