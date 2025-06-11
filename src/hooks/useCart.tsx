
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
  totalAmount: number;
  addToCart: (eventId: string, quantity?: number) => Promise<void>;
  removeFromCart: (eventId: string) => Promise<void>;
  updateQuantity: (eventId: string, quantity: number) => Promise<void>;
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

  const addToCart = async (eventId: string, quantity: number = 1) => {
    if (!user) return;

    // Verificar se o item já existe no carrinho
    const existingItem = cartItems.find(item => item.event_id === parseInt(eventId));
    
    if (existingItem) {
      // Se já existe, atualizar a quantidade
      await updateQuantity(eventId, existingItem.quantity + quantity);
      return;
    }

    const { error } = await supabase
      .from('cart_items')
      .insert({
        user_id: user.id,
        event_id: parseInt(eventId),
        quantity: quantity
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

  const updateQuantity = async (eventId: string, quantity: number) => {
    if (!user) return;

    if (quantity <= 0) {
      await removeFromCart(eventId);
      return;
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('user_id', user.id)
      .eq('event_id', parseInt(eventId));

    if (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Erro ao atualizar quantidade",
        description: "Tente novamente.",
        variant: "destructive"
      });
    } else {
      loadCartItems();
    }
  };

  const removeFromCart = async (eventId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('event_id', parseInt(eventId));

    if (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Erro ao remover do carrinho",
        description: "Tente novamente.",
        variant: "destructive"
      });
    } else {
      loadCartItems();
      toast({
        title: "Item removido do carrinho",
        description: "O item foi removido com sucesso."
      });
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

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.events?.price || 0) * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      totalAmount,
      addToCart,
      removeFromCart,
      updateQuantity,
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
