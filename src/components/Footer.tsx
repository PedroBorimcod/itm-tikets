
import { Mail, Whatsapp, Telegram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border py-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="text-muted-foreground text-sm mb-2 md:mb-0">
          &copy; {new Date().getFullYear()} ITM Tikets. Todos os direitos reservados.
        </span>
        <div className="flex gap-6 items-center">
          <a
            href="mailto:contato@itmtikets.com"
            rel="noopener noreferrer"
            className="flex items-center text-muted-foreground hover:text-primary transition-colors"
            title="Contato por E-mail"
          >
            <Mail className="h-5 w-5" />
            <span className="ml-2 hidden md:inline">E-mail</span>
          </a>
          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-muted-foreground hover:text-primary transition-colors"
            title="Contato via WhatsApp"
          >
            <Whatsapp className="h-5 w-5" />
            <span className="ml-2 hidden md:inline">WhatsApp</span>
          </a>
          <a
            href="https://t.me/itmtikets"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-muted-foreground hover:text-primary transition-colors"
            title="Contato via Telegram"
          >
            <Telegram className="h-5 w-5" />
            <span className="ml-2 hidden md:inline">Telegram</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
