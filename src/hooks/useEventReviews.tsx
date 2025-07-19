import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface Review {
  id: string;
  event_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export function useEventReviews(eventId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [eventId]);

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data || []);
      
      // Find user's review if they have one
      if (user) {
        const userReviewData = data?.find(review => review.user_id === user.id);
        setUserReview(userReviewData || null);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast({
        title: "Erro ao carregar avaliações",
        description: "Não foi possível carregar as avaliações do evento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (rating: number, comment: string) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para avaliar um evento.",
        variant: "destructive",
      });
      return false;
    }

    setSubmitting(true);
    try {
      if (userReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({ rating, comment })
          .eq('id', userReview.id);

        if (error) throw error;

        toast({
          title: "Avaliação atualizada!",
          description: "Sua avaliação foi atualizada com sucesso.",
        });
      } else {
        // Create new review
        const { error } = await supabase
          .from('reviews')
          .insert({
            event_id: eventId,
            user_id: user.id,
            rating,
            comment,
          });

        if (error) throw error;

        toast({
          title: "Avaliação enviada!",
          description: "Obrigado por avaliar este evento.",
        });
      }

      await loadReviews();
      return true;
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Erro ao enviar avaliação",
        description: "Não foi possível enviar sua avaliação. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReview = async () => {
    if (!userReview) return false;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', userReview.id);

      if (error) throw error;

      toast({
        title: "Avaliação removida",
        description: "Sua avaliação foi removida com sucesso.",
      });

      await loadReviews();
      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: "Erro ao remover avaliação",
        description: "Não foi possível remover sua avaliação.",
        variant: "destructive",
      });
      return false;
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return {
    reviews,
    userReview,
    loading,
    submitting,
    averageRating,
    totalReviews: reviews.length,
    submitReview,
    deleteReview,
    refreshReviews: loadReviews,
  };
}