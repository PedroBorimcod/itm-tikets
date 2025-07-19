import { useState } from 'react';
import { Star, MessageSquare, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useEventReviews } from '@/hooks/useEventReviews';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface EventReviewsProps {
  eventId: string;
}

export function EventReviews({ eventId }: EventReviewsProps) {
  const { user } = useAuth();
  const {
    reviews,
    userReview,
    loading,
    submitting,
    averageRating,
    totalReviews,
    submitReview,
    deleteReview,
  } = useEventReviews(eventId);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(userReview?.rating || 5);
  const [comment, setComment] = useState(userReview?.comment || '');

  const handleSubmitReview = async () => {
    const success = await submitReview(rating, comment);
    if (success) {
      setShowReviewForm(false);
      setRating(5);
      setComment('');
    }
  };

  const handleDeleteReview = async () => {
    const success = await deleteReview();
    if (success) {
      setShowReviewForm(false);
      setRating(5);
      setComment('');
    }
  };

  const StarRating = ({ value, onChange, readonly = false }: { value: number; onChange?: (value: number) => void; readonly?: boolean }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 cursor-pointer transition-colors ${
              star <= value 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-muted-foreground'
            } ${readonly ? 'cursor-default' : 'hover:text-yellow-400'}`}
            onClick={() => !readonly && onChange?.(star)}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Avaliações ({totalReviews})</span>
          </div>
          {totalReviews > 0 && (
            <div className="flex items-center space-x-2">
              <StarRating value={Math.round(averageRating)} readonly />
              <span className="text-sm text-muted-foreground">
                {averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Review Form */}
        {user && (
          <div className="space-y-4">
            {!showReviewForm && !userReview && (
              <Button onClick={() => setShowReviewForm(true)} className="w-full">
                Avaliar este evento
              </Button>
            )}

            {!showReviewForm && userReview && (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowReviewForm(true);
                    setRating(userReview.rating);
                    setComment(userReview.comment || '');
                  }}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Avaliação
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir avaliação</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir sua avaliação? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteReview}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            {showReviewForm && (
              <div className="space-y-4 p-4 border rounded-lg">
                <div>
                  <label className="text-sm font-medium">Sua avaliação</label>
                  <StarRating value={rating} onChange={setRating} />
                </div>
                <div>
                  <label className="text-sm font-medium">Comentário (opcional)</label>
                  <Textarea
                    placeholder="Compartilhe sua experiência sobre este evento..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleSubmitReview} 
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? 'Enviando...' : userReview ? 'Atualizar' : 'Enviar Avaliação'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowReviewForm(false)}
                    disabled={submitting}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma avaliação ainda. Seja o primeiro a avaliar!
            </p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <StarRating value={review.rating} readonly />
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(review.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm">{review.comment}</p>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}