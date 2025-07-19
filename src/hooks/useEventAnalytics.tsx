import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useEventAnalytics() {
  const { user } = useAuth();

  const trackView = async (eventId: string) => {
    try {
      await supabase
        .from('event_analytics')
        .insert({
          event_id: eventId,
          metric_type: 'view',
          user_id: user?.id || null,
        });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const trackPurchase = async (eventId: string, metadata: Record<string, any> = {}) => {
    try {
      await supabase
        .from('event_analytics')
        .insert({
          event_id: eventId,
          metric_type: 'purchase',
          user_id: user?.id || null,
          metadata,
        });
    } catch (error) {
      console.error('Error tracking purchase:', error);
    }
  };

  const trackShare = async (eventId: string, platform?: string) => {
    try {
      await supabase
        .from('event_analytics')
        .insert({
          event_id: eventId,
          metric_type: 'share',
          user_id: user?.id || null,
          metadata: { platform },
        });
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  };

  return {
    trackView,
    trackPurchase,
    trackShare,
  };
}