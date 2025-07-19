import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  min_purchase_amount: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string;
  active: boolean;
}

export function useCoupons() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const validateCoupon = async (code: string, purchaseAmount: number): Promise<Coupon | null> => {
    if (!code.trim()) return null;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('active', true)
        .gte('valid_until', new Date().toISOString())
        .single();

      if (error) {
        toast({
          title: "Cupom inválido",
          description: "Este cupom não existe ou expirou.",
          variant: "destructive",
        });
        return null;
      }

      const coupon = data as Coupon;

      // Check if coupon has reached max uses
      if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
        toast({
          title: "Cupom esgotado",
          description: "Este cupom já atingiu o limite de usos.",
          variant: "destructive",
        });
        return null;
      }

      // Check minimum purchase amount
      if (purchaseAmount < coupon.min_purchase_amount) {
        toast({
          title: "Valor mínimo não atingido",
          description: `Este cupom requer um valor mínimo de R$ ${coupon.min_purchase_amount.toFixed(2)}.`,
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Cupom aplicado!",
        description: `${coupon.name} - ${coupon.discount_type === 'percentage' ? `${coupon.discount_value}% de desconto` : `R$ ${coupon.discount_value.toFixed(2)} de desconto`}`,
      });

      return coupon;
    } catch (error) {
      console.error('Error validating coupon:', error);
      toast({
        title: "Erro ao validar cupom",
        description: "Não foi possível validar o cupom. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = (coupon: Coupon, amount: number): number => {
    if (coupon.discount_type === 'percentage') {
      return (amount * coupon.discount_value) / 100;
    } else {
      return Math.min(coupon.discount_value, amount);
    }
  };

  const incrementCouponUsage = async (couponId: string): Promise<boolean> => {
    try {
      // First get current usage count
      const { data: coupon, error: fetchError } = await supabase
        .from('coupons')
        .select('current_uses')
        .eq('id', couponId)
        .single();

      if (fetchError) throw fetchError;

      // Then increment it
      const { error } = await supabase
        .from('coupons')
        .update({ current_uses: (coupon.current_uses || 0) + 1 })
        .eq('id', couponId);

      return !error;
    } catch (error) {
      console.error('Error incrementing coupon usage:', error);
      return false;
    }
  };

  return {
    loading,
    validateCoupon,
    calculateDiscount,
    incrementCouponUsage,
  };
}