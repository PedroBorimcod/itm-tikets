
import { Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border py-6 md:py-8 px-2 md:px-0">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="text-muted-foreground text-xs md:text-sm mb-2 md:mb-0 text-center">
          &copy; {new Date().getFullYear()} ITM Tikets. Todos os direitos reservados.
        </span>
        <div className="flex gap-3 md:gap-6 items-center">
          <a
            href="mailto:contato@itmtikets.com"
            rel="noopener noreferrer"
            className="flex items-center text-muted-foreground hover:text-primary transition-colors text-xs md:text-base"
            title="Contato por E-mail"
          >
            <Mail className="h-4 w-4 md:h-5 md:w-5" />
            <span className="ml-2 hidden md:inline">E-mail</span>
          </a>
          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-muted-foreground hover:text-primary transition-colors text-xs md:text-base"
            title="Contato via WhatsApp"
          >
            <span className="h-4 w-4 md:h-5 md:w-5 flex items-center justify-center text-lg">💬</span>
            <span className="ml-2 hidden md:inline">WhatsApp</span>
          </a>
          <a
            href="https://t.me/itmtikets"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-muted-foreground hover:text-primary transition-colors text-xs md:text-base"
            title="Contato via Telegram"
          >
            <span className="h-4 w-4 md:h-5 md:w-5 flex items-center justify-center text-lg">✈️</span>
            <span className="ml-2 hidden md:inline">Telegram</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

