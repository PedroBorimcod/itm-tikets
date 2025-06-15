
import { Button } from '@/components/ui/button';
import { Search, Sparkles } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-background py-14 md:py-20 lg:py-32">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:20px_20px]" />
      <div className="absolute -top-20 -right-20 w-60 h-60 md:w-72 md:h-72 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 md:w-72 md:h-72 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-2 md:px-4 relative z-10">
        <div className="max-w-2xl md:max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-bold mb-4 md:mb-6">
            <Sparkles className="h-3 w-3 md:h-4 md:w-4 mr-2" />
            Mais de 500 eventos disponíveis
          </div>
          
          {/* Main heading */}
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-black tracking-tight mb-4 md:mb-6 text-foreground">
            Encontre seu
            <span className="text-primary block">
              próximo evento
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed font-medium">
            Na ITM Tikets você encontra shows, workshops, palestras e muito mais. Compre seus ingressos de forma segura e receba-os instantaneamente.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-8 md:mb-12">
            <Button size="lg" className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 bg-primary hover:bg-primary/90 text-white font-bold">
              <Search className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              Explorar Eventos
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 text-xs md:text-sm text-foreground font-medium">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-primary rounded-full" />
              Pagamentos 100% seguros
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-primary rounded-full" />
              Ingressos digitais instantâneos
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-primary rounded-full" />
              Suporte 24/7
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

