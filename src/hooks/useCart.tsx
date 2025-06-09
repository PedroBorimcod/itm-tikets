
import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type CartItem = Tables<'cart_items'> & {
  events: Tables<'events'>;
};

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (eventId: string) => Promise<void>;
  removeFromCart: (eventId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadCartItems();
    } else {
      setCartItems([]);
    }
  }, [user]);

  const loadCartItems = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        events (*)
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error loading cart:', error);
      toast({
        title: "Erro ao carregar carrinho",
        description: "Tente novamente.",
        variant: "destructive"
      });
    } else {
      setCartItems(data || []);
    }
    setLoading(false);
  };

  const addToCart = async (eventId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('cart_items')
      .upsert({
        user_id: user.id,
        event_id: eventId,
        quantity: 1
      });

    if (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Erro ao adicionar ao carrinho",
        description: "Tente novamente.",
        variant: "destructive"
      });
    } else {
      loadCartItems();
      toast({
        title: "Ingresso adicionado ao carrinho!",
        description: "Vá para o carrinho para finalizar a compra."
      });
    }
  };

  const removeFromCart = async (eventId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('event_id', eventId);

    if (error) {
      console.error('Error removing from cart:', error);
    } else {
      loadCartItems();
    }
  };

  const clearCart = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing cart:', error);
    } else {
      setCartItems([]);
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount: cartItems.length,
      addToCart,
      removeFromCart,
      clearCart,
      loading
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
