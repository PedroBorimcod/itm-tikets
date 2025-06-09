
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Producer = Tables<'producers'>;

interface ProducerAuthContextType {
  producer: Producer | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => void;
}

const ProducerAuthContext = createContext<ProducerAuthContextType | undefined>(undefined);

export function ProducerAuthProvider({ children }: { children: React.ReactNode }) {
  const [producer, setProducer] = useState<Producer | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if producer is logged in from localStorage
    const storedProducer = localStorage.getItem('producer');
    if (storedProducer) {
      setProducer(JSON.parse(storedProducer));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // For now, we'll use a simple check. In production, use proper password hashing
      const { data: producers, error } = await supabase
        .from('producers')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !producers) {
        return { error: { message: 'Credenciais inválidas' } };
      }

      // Simple password check (in production, use bcrypt)
      if (producers.password_hash !== password) {
        return { error: { message: 'Credenciais inválidas' } };
      }

      setProducer(producers);
      localStorage.setItem('producer', JSON.stringify(producers));
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = () => {
    setProducer(null);
    localStorage.removeItem('producer');
  };

  return (
    <ProducerAuthContext.Provider value={{
      producer,
      loading,
      signIn,
      signOut
    }}>
      {children}
    </ProducerAuthContext.Provider>
  );
}

export function useProducerAuth() {
  const context = useContext(ProducerAuthContext);
  if (context === undefined) {
    throw new Error('useProducerAuth must be used within a ProducerAuthProvider');
  }
  return context;
}
