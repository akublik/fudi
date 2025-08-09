import { Utensils } from 'lucide-react';

export function Header() {
  return (
    <header className="py-8 text-center">
      <div className="inline-flex items-center gap-4">
        <Utensils className="h-12 w-12 text-primary" />
        <h1 className="font-headline text-5xl font-bold text-foreground">
          Qué Cocino Hoy
        </h1>
      </div>
    </header>
  );
}
