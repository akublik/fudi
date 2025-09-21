import Image from 'next/image';
import { AuthButton } from '../auth/AuthButton';
import { InstallPWAButton } from '../common/InstallPWAButton';

export function Header() {
  return (
    <header className="w-full py-12">
       <div className="container mx-auto flex justify-end items-center gap-2 mb-4">
        <InstallPWAButton />
        <AuthButton />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 items-center justify-center gap-8 text-center md:text-left p-4">
        {/* Columna Izquierda: Logo y Texto */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
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

        {/* Columna Derecha: Video */}
        <div className="w-full h-full flex items-center justify-center">
            <video 
                className="rounded-lg shadow-lg w-full h-auto max-h-[300px] object-cover" 
                autoPlay 
                loop 
                muted 
                playsInline
            >
            <source src="/videos/home.mp4" type="video/mp4" />
            Your browser does not support the video tag.
            </video>
        </div>
      </div>
    </header>
  );
}
