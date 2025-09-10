
"use client";

import type { WeeklyMenuOutput } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from '@/components/ui/separator';

interface PlannerViewProps {
  plan: WeeklyMenuOutput;
}

export function PlannerView({ plan }: PlannerViewProps) {
  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-4xl text-center">Tu Plan de Menú Semanal</CardTitle>
        <CardDescription className="text-center text-lg">{plan.summary}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <Accordion type="multiple" defaultValue={plan.plan.map(p => p.day)} className="w-full space-y-4">
          {plan.plan.map((dailyPlan) => (
            <AccordionItem value={dailyPlan.day} key={dailyPlan.day} className="border rounded-lg shadow-sm">
              <AccordionTrigger className="px-6 py-4 hover:no-underline text-xl font-bold">
                <div className="flex justify-between w-full pr-4">
                    <span>{dailyPlan.day}</span>
                    <span className="text-sm font-normal text-muted-foreground self-end">
                        {dailyPlan.totalCalories.toFixed(0)} Kcal totales
                    </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-2 sm:px-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/6">Comida</TableHead>
                      <TableHead>Plato</TableHead>
                      <TableHead className="text-right">Calorías</TableHead>
                      <TableHead className="text-right hidden sm:table-cell">Proteínas</TableHead>
                      <TableHead className="text-right hidden sm:table-cell">Carbs.</TableHead>
                      <TableHead className="text-right hidden sm:table-cell">Grasas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Desayuno</TableCell>
                      <TableCell>
                        <p className="font-semibold">{dailyPlan.breakfast.name}</p>
                        <p className="text-xs text-muted-foreground">{dailyPlan.breakfast.description}</p>
                      </TableCell>
                      <TableCell className="text-right">{dailyPlan.breakfast.calories.toFixed(0)}</TableCell>
                      <TableCell className="text-right hidden sm:table-cell">{dailyPlan.breakfast.protein.toFixed(1)}g</TableCell>
                      <TableCell className="text-right hidden sm:table-cell">{dailyPlan.breakfast.carbs.toFixed(1)}g</TableCell>
                      <TableCell className="text-right hidden sm:table-cell">{dailyPlan.breakfast.fat.toFixed(1)}g</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Almuerzo</TableCell>
                      <TableCell>
                         <p className="font-semibold">{dailyPlan.lunch.name}</p>
                         <p className="text-xs text-muted-foreground">{dailyPlan.lunch.description}</p>
                      </TableCell>
                      <TableCell className="text-right">{dailyPlan.lunch.calories.toFixed(0)}</TableCell>
                      <TableCell className="text-right hidden sm:table-cell">{dailyPlan.lunch.protein.toFixed(1)}g</TableCell>
                      <TableCell className="text-right hidden sm:table-cell">{dailyPlan.lunch.carbs.toFixed(1)}g</TableCell>
                      <TableCell className="text-right hidden sm:table-cell">{dailyPlan.lunch.fat.toFixed(1)}g</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Cena</TableCell>
                       <TableCell>
                         <p className="font-semibold">{dailyPlan.dinner.name}</p>
                         <p className="text-xs text-muted-foreground">{dailyPlan.dinner.description}</p>
                      </TableCell>
                      <TableCell className="text-right">{dailyPlan.dinner.calories.toFixed(0)}</TableCell>
                      <TableCell className="text-right hidden sm:table-cell">{dailyPlan.dinner.protein.toFixed(1)}g</TableCell>
                      <TableCell className="text-right hidden sm:table-cell">{dailyPlan.dinner.carbs.toFixed(1)}g</TableCell>
                      <TableCell className="text-right hidden sm:table-cell">{dailyPlan.dinner.fat.toFixed(1)}g</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
