
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Link, useNavigate } from 'react-router-dom';
import { Ticket, User, LogIn, Building2 } from 'lucide-react';
import UserDropdown from './UserDropdown';
import { useAdminRole } from '@/hooks/useAdminRole';

const Navbar = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdminRole();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Ticket className="h-6 w-6 text-primary" />
            <span
              className="font-bold text-xl whitespace-nowrap overflow-x-auto truncate"
              style={{ maxWidth: '130px' }}
            >
              ITM TIKETS
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {/* Exibe "Produtoras" somente para administradores */}
            {isAdmin && (
              <Button
                variant="ghost"
                onClick={() => navigate('/producer-auth')}
                className="hidden md:flex"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Produtoras
              </Button>
            )}

            {isAdmin && (
              <Button
                variant="ghost"
                onClick={() => navigate('/admin/events')}
                className="h-7 px-2 text-xs min-w-0 sm:h-10 sm:px-4 sm:text-sm"
              >
                Administração
              </Button>
            )}

            {/* Mostra status do admin para debug */}
            {user && !adminLoading && (
              <span className="text-xs text-muted-foreground ml-2">
                {isAdmin ? 'Admin' : 'Usuário comum'}
              </span>
            )}

            {user ? (
              <UserDropdown />
            ) : (
              <Button onClick={() => navigate('/auth')}>
                <LogIn className="h-4 w-4 mr-2" />
                {t('auth.login')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

