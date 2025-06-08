
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, User, ShoppingCart, Ticket } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Eventos', href: '#eventos' },
    { label: 'Categorias', href: '#categorias' },
    { label: 'Sobre', href: '#sobre' },
    { label: 'Contato', href: '#contato' }
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Ticket className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              TicketHub
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Carrinho
            </Button>
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4 mr-2" />
              Entrar
            </Button>
            <Button size="sm">
              Criar Evento
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="text-sm font-medium transition-colors hover:text-primary p-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
                <div className="border-t pt-4 space-y-2">
                  <Button variant="ghost" className="w-full justify-start">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Carrinho
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Entrar
                  </Button>
                  <Button className="w-full">
                    Criar Evento
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
