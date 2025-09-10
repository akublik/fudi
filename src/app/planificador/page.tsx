
"use client";

import { useState } from 'react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { PlannerForm } from '@/components/forms/PlannerForm';
import { PlannerView } from '@/components/planner/PlannerView';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { WeeklyMenuInput, WeeklyMenuOutput } from '@/lib/types';
import { generateWeeklyMenu } from '@/lib/actions';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PlannerPage() {
  const [menuPlan, setMenuPlan] = useState<WeeklyMenuOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePlannerSubmit = async (values: WeeklyMenuInput) => {
    setIsLoading(true);
    setMenuPlan(null);
    try {
      const result = await generateWeeklyMenu(values);
      if (!result || result.plan.length === 0) {
        toast({ title: "Sin resultados", description: "No pudimos generar un plan con esas opciones. ¡Intenta de nuevo!", variant: "destructive" });
      }
      setMenuPlan(result);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Ocurrió un error al generar el planificador de menús.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="container mx-auto px-4 py-8 flex-grow">
        <Button asChild variant="outline" className="mb-4">
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Inicio
            </Link>
        </Button>
        <Header />
        
        <div className="w-full max-w-4xl mx-auto mt-8 space-y-8">
            <PlannerForm onSubmit={handlePlannerSubmit} isLoading={isLoading} />
        </div>

        {isLoading && (
          <div className="text-center py-16">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-lg text-muted-foreground">Generando tu plan de menú personalizado...</p>
          </div>
        )}

        {menuPlan && !isLoading && (
            <div className="w-full max-w-6xl mx-auto mt-12">
                <PlannerView plan={menuPlan} />
            </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
