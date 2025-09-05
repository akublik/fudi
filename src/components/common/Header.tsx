
import Image from 'next/image';

export function Header() {
  return (
    <header className="w-full py-12 flex items-center justify-center">
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left p-4">
        <div className="relative w-48 h-48 shrink-0">
          <Image
            src="https://i.imgur.com/soZkYAE.png"
            alt="Fudo Logo"
            fill
            className="object-contain"
            data-ai-hint="logo"
          />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-4">
            <h1 className="font-headline text-5xl font-bold text-foreground">
              ¿Qué Cocino Hoy?
            </h1>
          </div>
          <p className="text-xl font-bold text-accent">
            ¡Bienvenido al vibe cooking, la nueva forma de cocinar!
          </p>
          <p className="text-lg text-muted-foreground">
            Recetas deliciosas para tus comidas dulces, saladas, y ahora también bebidas
          </p>
        </div>
      </div>
    </header>
  );
}
