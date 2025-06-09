
import { createContext, useContext, useState, useEffect } from 'react';

type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations = {
  pt: {
    'events.title': 'Eventos Disponíveis',
    'events.description': 'Encontre o evento perfeito para você',
    'events.search': 'Buscar eventos...',
    'events.category': 'Categoria',
    'events.date': 'Data',
    'events.noResults': 'Nenhum evento encontrado',
    'events.buyTicket': 'Comprar Ingresso',
    'events.soldOut': 'Esgotado',
    'events.lastTickets': 'Últimos ingressos!',
    'cart.title': 'Carrinho',
    'cart.empty': 'Seu carrinho está vazio',
    'cart.total': 'Total',
    'cart.checkout': 'Finalizar Compra',
    'user.myTickets': 'Meus Ingressos',
    'user.myData': 'Meus Dados',
    'user.settings': 'Configurações',
    'auth.login': 'Entrar',
    'auth.signup': 'Cadastrar',
    'auth.logout': 'Sair'
  },
  en: {
    'events.title': 'Available Events',
    'events.description': 'Find the perfect event for you',
    'events.search': 'Search events...',
    'events.category': 'Category',
    'events.date': 'Date',
    'events.noResults': 'No events found',
    'events.buyTicket': 'Buy Ticket',
    'events.soldOut': 'Sold Out',
    'events.lastTickets': 'Last tickets!',
    'cart.title': 'Cart',
    'cart.empty': 'Your cart is empty',
    'cart.total': 'Total',
    'cart.checkout': 'Checkout',
    'user.myTickets': 'My Tickets',
    'user.myData': 'My Data',
    'user.settings': 'Settings',
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.logout': 'Logout'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('pt');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['pt']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
