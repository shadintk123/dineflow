import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { GoogleSignInButton } from '@/components/ui/GoogleSignInButton';

export function LoginPage() {
  const { login, signInWithGoogle } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      success('Welcome back!', 'You are now logged in.');
      navigate(result.role === 'owner' ? '/owner/dashboard' : '/customer/dashboard');
    } else {
      error('Login failed', result.error);
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
    // On success, Supabase redirects to Google; the auth state listener handles the rest.
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
          <h1 className="font-display text-2xl font-bold text-ink">Welcome Back</h1>
          <p className="mt-1 text-sm text-muted">Sign in to manage your reservations and orders.</p>

          <div className="mt-6">
            <GoogleSignInButton onClick={handleGoogle} loading={googleLoading} label="Sign in with Google" />
          </div>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs font-semibold text-muted">or sign in with email</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-field">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input-field pl-10" />
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
            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              Sign In <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-primary-700 hover:text-primary-800">Create Account</Link>
          </p>
          <p className="mt-2 text-center text-sm text-muted">
            Restaurant partner?{' '}
            <Link to="/owner/register" className="font-bold text-accent-600 hover:text-accent-700">List Your Restaurant</Link>
          </p>
          <p className="mt-2 text-center text-sm text-muted">
            Admin?{' '}
            <Link to="/admin/login" className="font-bold text-error hover:opacity-80">Admin Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

