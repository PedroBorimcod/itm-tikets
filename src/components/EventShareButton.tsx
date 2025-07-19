import { useState } from 'react';
import { Share2, Copy, Facebook, Twitter, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useEventAnalytics } from '@/hooks/useEventAnalytics';

interface EventShareButtonProps {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  className?: string;
}

export function EventShareButton({ 
  eventId, 
  eventTitle, 
  eventDate, 
  className 
}: EventShareButtonProps) {
  const { toast } = useToast();
  const { trackShare } = useEventAnalytics();
  const [loading, setLoading] = useState(false);

  const eventUrl = `${window.location.origin}/?event=${eventId}`;
  const shareText = `Confira este evento: ${eventTitle} - ${eventDate}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      await trackShare(eventId, 'copy');
      toast({
        title: "Link copiado!",
        description: "O link do evento foi copiado para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (platform: string, url: string) => {
    setLoading(true);
    try {
      window.open(url, '_blank', 'width=600,height=400');
      await trackShare(eventId, platform);
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setLoading(false);
    }
  };

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(eventUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + eventUrl)}`,
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`flex items-center space-x-2 ${className}`}
          disabled={loading}
        >
          <Share2 className="h-4 w-4" />
          <span>Compartilhar</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopyLink}>
          <Copy className="h-4 w-4 mr-2" />
          Copiar link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('facebook', shareUrls.facebook)}>
          <Facebook className="h-4 w-4 mr-2" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('twitter', shareUrls.twitter)}>
          <Twitter className="h-4 w-4 mr-2" />
          Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('whatsapp', shareUrls.whatsapp)}>
          <MessageCircle className="h-4 w-4 mr-2" />
          WhatsApp
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}