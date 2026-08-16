import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';

interface OwnerRegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  restaurantName: string;
  description?: string;
  cuisine?: string;
  restaurantPhone?: string;
  restaurantEmail?: string;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  landmark?: string;
  openingHours?: string;
  closingHours?: string;
  seatingCapacity?: number;
  tables?: number;
  priceRange?: number;
  amenities?: string[];
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  registerCustomer: (data: { name: string; email: string; phone?: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  registerOwner: (data: OwnerRegisterData) => Promise<{ success: boolean; error?: string }>;
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function getProfile(session: { user: { id: string; email?: string } | null }) {
      if (!session.user) {
        if (mounted) setUser(null);
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email, name, phone, role, avatar, created_at')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile && mounted) {
        setUser({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          phone: profile.phone,
          role: profile.role as UserRole,
          avatar: profile.avatar,
          createdAt: profile.created_at,
        });
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      getProfile(data.session);
      if (mounted) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        await getProfile(session);
        if (event === 'SIGNED_OUT') {
          if (mounted) setUser(null);
        }
        if (mounted) setLoading(false);
      })();
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const login: AuthContextValue['login'] = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: 'Invalid email or password.' };

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, name, phone, role, avatar, created_at')
      .eq('id', data.user.id)
      .maybeSingle();

    if (!profile) return { success: false, error: 'Account not found.' };
    if (profile.role === 'admin') {
      await supabase.auth.signOut();
      return { success: false, error: 'Admin login is separate.' };
    }

    return { success: true, role: profile.role as UserRole };
  };

  const registerCustomer: AuthContextValue['registerCustomer'] = async (data) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          phone: data.phone || '',
          role: 'customer',
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return { success: false, error: 'An account with this email already exists.' };
      }
      return { success: false, error: error.message };
    }
    if (!authData.user) return { success: false, error: 'Registration failed.' };

    return { success: true };
  };

  const registerOwner: AuthContextValue['registerOwner'] = async (data) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          phone: data.phone,
          role: 'owner',
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return { success: false, error: 'An account with this email already exists.' };
      }
      return { success: false, error: error.message };
    }
    if (!authData.user) return { success: false, error: 'Registration failed.' };

    // Create restaurant application for admin review
    const cuisineArray = data.cuisine ? data.cuisine.split(',').map((c) => c.trim()).filter(Boolean) : [];
    const { error: appError } = await supabase.from('restaurant_applications').insert({
      owner_id: authData.user.id,
      owner_name: data.name,
      owner_email: data.email,
      owner_phone: data.phone,
      restaurant_name: data.restaurantName,
      description: data.description || '',
      cuisine: cuisineArray,
      restaurant_phone: data.restaurantPhone || '',
      restaurant_email: data.restaurantEmail || '',
      address: data.address || '',
      city: data.city || '',
      district: data.district || '',
      state: data.state || '',
      postal_code: data.postalCode || '',
      landmark: data.landmark || '',
      opening_hours: data.openingHours || '11:00',
      closing_hours: data.closingHours || '23:00',
      seating_capacity: data.seatingCapacity || 50,
      tables_count: data.tables || 15,
      price_range: data.priceRange || 2,
      amenities: data.amenities || [],
      status: 'pending',
    });

    if (appError) {
      return { success: false, error: 'Account created but application submission failed.' };
    }

    return { success: true };
  };

  const signInWithGoogle: AuthContextValue['signInWithGoogle'] = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const loginAdmin: AuthContextValue['loginAdmin'] = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: 'Invalid admin credentials.' };

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle();

    if (!profile || profile.role !== 'admin') {
      await supabase.auth.signOut();
      return { success: false, error: 'Invalid admin credentials.' };
    }

    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateUser: AuthContextValue['updateUser'] = async (data) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({
        name: data.name,
        phone: data.phone,
        avatar: data.avatar,
      })
      .eq('id', user.id);

    if (!error) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, registerCustomer, registerOwner, loginAdmin, signInWithGoogle, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
