
import { Utensils } from 'lucide-react';
import Image from 'next/image';

export function Header() {
  return (
    <header className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden flex items-center justify-center">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="https://firebasestorage.googleapis.com/v0/b/your-daily-chef.firebasestorage.app/o/Group_of_milenials_202509051505_q1ltc.mp4?alt=media" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10"></div>
      
      <div className="relative z-20 flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left p-4">
        {/* Image on the left */}
        <div className="relative w-48 h-48 shrink-0">
          <Image
            src="https://i.imgur.com/soZkYAE.png"
            alt="Fudo Logo"
            fill
            className="object-contain"
            data-ai-hint="logo"
          />
        </div>

        {/* Text content on the right */}
        <div className="space-y-2 text-white">
          <div className="inline-flex items-center gap-4">
            <h1 className="font-headline text-5xl font-bold">
              ¿Qué Cocino Hoy?
            </h1>
          </div>
          <p className="text-xl font-bold text-primary">
            ¡Bienvenido al vibe cooking, la nueva forma de cocinar!
          </p>
          <p className="text-lg">
            Recetas deliciosas para tus comidas dulces, saladas, y ahora también bebidas
          </p>
        </div>
      </div>
    </header>
  );
}
