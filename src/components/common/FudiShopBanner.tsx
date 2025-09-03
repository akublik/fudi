
import Image from "next/image";
import { Card } from "@/components/ui/card";

export function FudiShopBanner() {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <div className="grid md:grid-cols-2">
        <div className="p-8 flex flex-col justify-center items-center text-center order-first md:order-last">
          <h2 className="font-headline text-4xl font-bold text-foreground">
            ¡Muy pronto!
          </h2>
           <h3 className="font-headline text-3xl font-bold text-accent">
            Tienda Fudi Chef
          </h3>
        </div>
        <div className="relative min-h-[200px] md:min-h-[300px]">
          <Image
            src="https://firebasestorage.googleapis.com/v0/b/enlaceimagen.firebasestorage.app/o/images%2F221084b3-ef17-48e9-88a8-14c07292f562.png?alt=media&token=711d4ccc-0cf0-4759-bcee-78b59b590723"
            alt="Tienda Fudi Chef"
            fill
            className="object-contain"
            data-ai-hint="kitchen products"
          />
        </div>
      </div>
    </Card>
  );
}
