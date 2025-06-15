
import { useState, useEffect } from 'react';
import { User, Settings, Ticket, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const UserDropdown = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [hasTickets, setHasTickets] = useState<boolean>(false);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) {
        setHasTickets(false);
        return;
      }
      const { data, error } = await supabase
        .from('order_items')
        .select('id')
        .eq('orders.user_id', user.id)
        .limit(1)
        .select(`
          id,
          orders:user_id
        `);
      // Se encontrar algum registro, então possui ingresso
      if (data && data.length > 0) {
        setHasTickets(true);
      } else {
        setHasTickets(false);
      }
    };

    fetchTickets();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2">
          <User className="h-4 w-4" />
          <span className="hidden md:inline">{user.email?.split('@')[0]}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {hasTickets && (
          <DropdownMenuItem onClick={() => navigate('/my-tickets')}>
            <Ticket className="mr-2 h-4 w-4" />
            {t('user.myTickets')}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <User className="mr-2 h-4 w-4" />
          {t('user.myData')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          {t('user.settings')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          {t('auth.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
