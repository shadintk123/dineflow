import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function AuthCallbackPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (user) {
      navigate(user.role === 'owner' ? '/owner/dashboard' : '/customer/dashboard', { replace: true });
    } else {
      const timer = setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory bg-grid">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-600">
          <UtensilsCrossed className="h-7 w-7 text-white" />
        </div>
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-600" />
        <p className="mt-4 text-sm font-semibold text-muted">Completing sign-in…</p>
      </motion.div>
    </div>
  );
}
