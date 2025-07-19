import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export function useEventInterests(eventId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isInterested, setIsInterested] = useState(false);
  const [interestCount, setInterestCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInterests();
  }, [eventId, user]);

  const loadInterests = async () => {
    try {
      // Get total interest count
      const { count, error: countError } = await supabase
        .from('event_interests')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);

      if (countError) throw countError;
      setInterestCount(count || 0);

      // Check if current user is interested
      if (user) {
        const { data, error } = await supabase
          .from('event_interests')
          .select('id')
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .single();

        setIsInterested(!!data && !error);
      } else {
        setIsInterested(false);
      }
    } catch (error) {
      console.error('Error loading interests:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para demonstrar interesse.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isInterested) {
        // Remove interest
        const { error } = await supabase
          .from('event_interests')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);

        if (error) throw error;

        setIsInterested(false);
        setInterestCount(prev => prev - 1);

        toast({
          title: "Interesse removido",
          description: "Você não tem mais interesse neste evento.",
        });
      } else {
        // Add interest
        const { error } = await supabase
          .from('event_interests')
          .insert({
            event_id: eventId,
            user_id: user.id,
          });

        if (error) throw error;

        setIsInterested(true);
        setInterestCount(prev => prev + 1);

        // Track analytics
        await supabase
          .from('event_analytics')
          .insert({
            event_id: eventId,
            metric_type: 'interest',
            user_id: user.id,
          });

        toast({
          title: "Interesse demonstrado!",
          description: "Você demonstrou interesse neste evento.",
        });
      }
    } catch (error) {
      console.error('Error toggling interest:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar seu interesse.",
        variant: "destructive",
      });
    }
  };

  return {
    isInterested,
    interestCount,
    loading,
    toggleInterest,
    refreshInterests: loadInterests,
  };
}