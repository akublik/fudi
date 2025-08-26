import { Utensils } from 'lucide-react';
import Image from 'next/image';

export function Header() {
  return (
    <header className="py-8 w-full max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
        {/* Text content on the left */}
        <div className="flex-1 space-y-2">
          <div className="inline-flex items-center gap-4">
            <Utensils className="h-12 w-12 text-primary" />
            <h1 className="font-headline text-5xl font-bold text-foreground">
              ¿Qué Cocino Hoy?
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Recetas deliciosas para tus comidas dulces, saladas, y ahora también bebidas
          </p>
        </div>
        
        {/* Image on the right */}
        <div className="relative w-48 h-48 shrink-0">
          <Image
            src="https://storage.googleapis.com/stedi-assets/andre-ai-recipe-app/Fudo.png"
            alt="Fudo Logo"
            fill
            className="object-contain"
            data-ai-hint="logo"
          />
        </div>
      </div>
    </header>
  );
}
