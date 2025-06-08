
import { Button } from '@/components/ui/button';
import { Search, Calendar, MapPin, Sparkles } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-background py-20 lg:py-32">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:20px_20px]" />
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6">
            <Sparkles className="h-4 w-4 mr-2" />
            Mais de 500 eventos disponíveis
          </div>
          
          {/* Main heading */}
          <h1 className="text-4xl lg:text-6xl font-black tracking-tight mb-6 text-foreground">
            Encontre seu
            <span className="text-primary block">
              próximo evento
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed font-medium">
            Na ITM Tikets você encontra shows, workshops, palestras e muito mais. Compre seus ingressos de forma segura e receba-os instantaneamente.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-white font-bold">
              <Search className="h-5 w-5 mr-2" />
              Explorar Eventos
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-2 border-foreground text-foreground hover:bg-foreground hover:text-background font-bold">
              <Calendar className="h-5 w-5 mr-2" />
              Criar Evento
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-foreground font-medium">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full" />
              Pagamentos 100% seguros
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full" />
              Ingressos digitais instantâneos
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full" />
              Suporte 24/7
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
