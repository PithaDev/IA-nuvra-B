import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types/database';

interface UserContextType {
  user: User | null;
  loading: boolean;
  register: (name: string, phone: string, email?: string) => Promise<void>;
  checkUsageLimit: () => boolean;
  logUsage: (inputText: string, analysisType: 'marketing' | 'code' | 'chat') => Promise<void>;
  remainingUses: number;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const FREE_LIMIT = 10;

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem('nuvra_user_id');
    if (storedUserId) {
      loadUser(storedUserId);
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setUser(data);
      } else {
        localStorage.removeItem('nuvra_user_id');
      }
    } catch (error) {
      console.error('Error loading user:', error);
      localStorage.removeItem('nuvra_user_id');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, phone: string, email?: string) => {
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .maybeSingle();

      if (existingUser) {
        setUser(existingUser);
        localStorage.setItem('nuvra_user_id', existingUser.id);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .insert({
          name,
          phone,
          email: email || null,
          subscription_status: 'free',
          total_uses: 0,
        })
        .select()
        .single();

      if (error) throw error;

      setUser(data);
      localStorage.setItem('nuvra_user_id', data.id);
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  };

  const checkUsageLimit = (): boolean => {
    if (!user) return false;

    if (user.subscription_status === 'active' || user.subscription_status === 'client') {
      return true;
    }

    return user.total_uses < FREE_LIMIT;
  };

  const logUsage = async (inputText: string, analysisType: 'marketing' | 'code' | 'chat') => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('usage_logs')
        .insert({
          user_id: user.id,
          input_text: inputText.substring(0, 500),
          analysis_type: analysisType,
        });

      if (error) throw error;

      const { data: updatedUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (updatedUser) {
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error logging usage:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nuvra_user_id');
  };

  const remainingUses = user
    ? user.subscription_status === 'active' || user.subscription_status === 'client'
      ? Infinity
      : Math.max(0, FREE_LIMIT - user.total_uses)
    : 0;

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        register,
        checkUsageLimit,
        logUsage,
        remainingUses,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
