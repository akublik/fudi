import { Utensils } from 'lucide-react';
import Image from 'next/image';

export function Header() {
  return (
    <header className="py-8 text-center space-y-4">
       <div className="relative w-full max-w-4xl mx-auto h-64 rounded-lg overflow-hidden shadow-lg">
          <Image
            src="https://storage.googleapis.com/stedi-assets/andre-ai-recipe-app/hero-image.jpg"
            alt="Amigos cocinando juntos"
            fill
            className="object-cover"
            data-ai-hint="people cooking"
          />
       </div>
      <div className="inline-flex flex-col items-center gap-2">
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
    </header>
  );
}
