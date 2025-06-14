
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Link, useNavigate } from 'react-router-dom';
import { Ticket, User, LogIn, Building2 } from 'lucide-react';
import UserDropdown from './UserDropdown';

const Navbar = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Ticket className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">ITM TIKETS</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/producer-auth')}
              className="hidden md:flex"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Produtoras
            </Button>

            {user?.email === 'pepedr13@gmail.com' && (
              <Button variant="ghost" onClick={() => navigate('/admin/events')}>
                Administração
              </Button>
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
