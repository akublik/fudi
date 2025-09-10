
import Image from "next/image";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function PlannerBanner() {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <div className="grid md:grid-cols-2">
         <div className="relative min-h-[200px] md:min-h-[300px]">
          <Image
            src="https://i.imgur.com/gE2434G.jpeg"
            alt="Plan de comidas"
            fill
            className="object-cover"
            data-ai-hint="meal plan food"
          />
        </div>
        <div className="p-8 flex flex-col justify-center">
          <h2 className="font-headline text-3xl font-bold text-foreground mb-3">
            ¡Nuevo! Planificador de Menús Semanales
          </h2>
          <p className="text-muted-foreground mb-6">
            Organiza tus comidas de la semana según tus metas y restricciones.
            Recibe un plan personalizado hecho por nuestro chef de IA.
          </p>
          <Button asChild size="lg" className="self-start shadow-md hover:shadow-lg hover:scale-105 transition-all">
            <Link href="/planificador">
              <CalendarDays className="mr-2" />
              Crear mi plan
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
