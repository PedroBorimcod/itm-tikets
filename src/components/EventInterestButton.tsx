import { Heart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEventInterests } from '@/hooks/useEventInterests';
import { useAuth } from '@/hooks/useAuth';

interface EventInterestButtonProps {
  eventId: string;
  className?: string;
}

export function EventInterestButton({ eventId, className }: EventInterestButtonProps) {
  const { user } = useAuth();
  const { isInterested, interestCount, loading, toggleInterest } = useEventInterests(eventId);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Button
        variant={isInterested ? "default" : "outline"}
        size="sm"
        onClick={toggleInterest}
        disabled={loading}
        className="flex items-center space-x-2"
      >
        <Heart 
          className={`h-4 w-4 ${isInterested ? 'fill-current' : ''}`}
        />
        <span>
          {isInterested ? 'Interessado' : 'Tenho Interesse'}
        </span>
      </Button>
      
      {interestCount > 0 && (
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{interestCount} interessado{interestCount !== 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
}