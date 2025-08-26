import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function CookbookBanner() {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <div className="grid md:grid-cols-2">
        <div className="p-8 flex flex-col justify-center">
          <h2 className="font-headline text-3xl font-bold text-foreground mb-3">
            ¿Buscas más inspiración?
          </h2>
          <p className="text-muted-foreground mb-6">
            Explora nuestra cuidada selección de libros de cocina y lleva tus
            habilidades al siguiente nivel. Encuentra tu próxima receta
            favorita en papel y descubre los secretos de los grandes chefs.
          </p>
          <Button asChild size="lg" className="self-start shadow-md hover:shadow-lg hover:scale-105 transition-all">
            <Link href="https://alicialibros.com/search?q=cocina" target="_blank">
              <BookOpen className="mr-2" />
              Explorar Libros de Cocina
            </Link>
          </Button>
        </div>
        <div className="relative min-h-[200px] md:min-h-[300px]">
          <Image
            src="https://i.imgur.com/CVBXQ8W.jpeg"
            alt="Libros de cocina"
            fill
            className="object-cover"
            data-ai-hint="cookbooks kitchen"
          />
        </div>
      </div>
    </Card>
  );
}
