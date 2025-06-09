import { Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import CartIcon from './CartIcon';
import UserDropdown from './UserDropdown';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Ticket className="h-8 w-8 text-primary mr-3" />
            <span className="text-2xl font-black text-foreground">ITM Tickets</span>
          </div>
          
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="#eventos"
                  className={navigationMenuTriggerStyle()}
                >
                  Eventos
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="#contato"
                  className={navigationMenuTriggerStyle()}
                >
                  Contato
                </NavigationMenuLink>
              </NavigationMenuItem>
              {user?.email === 'pepedr12@gmail.com' && (
                <NavigationMenuItem>
                  <NavigationMenuLink
                    onClick={() => navigate('/admin/events')}
                    className={navigationMenuTriggerStyle()}
                    style={{ cursor: 'pointer' }}
                  >
                    Admin
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center space-x-4">
            {user && <CartIcon />}
            {user ? (
              <UserDropdown />
            ) : (
              <Button onClick={() => navigate('/auth')}>
                Entrar
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
