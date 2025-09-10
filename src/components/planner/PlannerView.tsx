
"use client";

import type { WeeklyMenuOutput, Meal, ShoppingListItem, UserInfo } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Utensils, BarChart2, ListChecks, Save } from 'lucide-react';
import { ShoppingList } from '../recipe/ShoppingList';
import { Button } from '../ui/button';


interface PlannerViewProps {
  plan: WeeklyMenuOutput;
  shoppingList: ShoppingListItem[];
  userInfo: UserInfo;
  onAddItem: (item: Omit<ShoppingListItem, 'id' | 'checked'>) => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateItem: (itemId: string, newValues: Partial<ShoppingListItem>) => void;
  onToggleItem: (itemId: string) => void;
  onClearList: () => void;
  onSaveUserInfo: (data: UserInfo) => void;
  onSaveToMainList: () => void;
}

const COLORS = {
  carbs: 'hsl(var(--chart-1))',
  protein: 'hsl(var(--chart-2))',
  fat: 'hsl(var(--chart-3))'
};


function MealCard({ meal }: { meal: Meal }) {
  if (!meal || !meal.name) return null;
  const { nutritionalInfo } = meal;

  const nutritionData = nutritionalInfo ? [
    { name: 'Hidratos', value: nutritionalInfo.carbs, fill: COLORS.carbs, kcal: nutritionalInfo.carbs * 4 },
    { name: 'Proteínas', value: nutritionalInfo.protein, fill: COLORS.protein, kcal: nutritionalInfo.protein * 4 },
    { name: 'Grasas', value: nutritionalInfo.fat, fill: COLORS.fat, kcal: nutritionalInfo.fat * 9 },
  ] : [];

  const totalGrams = (nutritionalInfo?.carbs || 0) + (nutritionalInfo?.protein || 0) + (nutritionalInfo?.fat || 0);

  return (
    <Card className="shadow-md w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{meal.name}</CardTitle>
        <CardDescription>{meal.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h4 className="font-semibold text-lg mb-2 flex items-center gap-2"><Utensils size={20}/> PREPARA ESTA RECETA</h4>
            <div className="space-y-4">
              <div>
                <h5 className="font-semibold">Ingredientes:</h5>
                <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1 mt-1">
                  {meal.ingredients.map((ing, i) => (
                    <li key={i}>{`${ing.quantity ? ing.quantity.toString().replace(/\.0+$/, '') : ''} ${ing.unit || ''} de ${ing.name}`.trim()}</li>
                  ))}
                </ul>
              </div>
               <div>
                <h5 className="font-semibold">Preparación:</h5>
                <p className="text-muted-foreground text-sm whitespace-pre-line mt-1">{meal.instructions}</p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2 flex items-center gap-2"><BarChart2 size={20}/> RACIONES Y NUTRICIÓN</h4>
             {nutritionalInfo && (
              <div className="space-y-4">
                 <div className="relative h-32 w-32 mx-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={nutritionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={50}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {nutritionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          background: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 'var(--radius)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold">{nutritionalInfo.calories.toFixed(0)}</span>
                    <span className="text-xs text-muted-foreground">Kcal</span>
                  </div>
                 </div>
                 <div className="text-xs text-center text-muted-foreground mb-4">kcal/ración, de las cuales:</div>
                 <div className="space-y-2 text-sm">
                   {nutritionData.map(item => (
                     <div key={item.name} className="flex justify-between items-center p-2 rounded-md" style={{backgroundColor: `${item.fill}20`}}>
                        <div className="flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full" style={{backgroundColor: item.fill}}></div>
                           <span>{item.name.toUpperCase()}</span>
                        </div>
                        <div className="flex gap-4 font-mono">
                           <span>{((item.value / totalGrams) * 100).toFixed(0)}%</span>
                           <span>{item.value.toFixed(0)}gr</span>
                           <span className="w-12 text-right">{item.kcal.toFixed(0)} Kcal</span>
                        </div>
                     </div>
                   ))}
                 </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


export function PlannerView({ plan, shoppingList, ...listProps }: PlannerViewProps) {
  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-4xl text-center">Tu Plan de Menú Semanal</CardTitle>
        <CardDescription className="text-center text-lg">{plan.summary}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-8">
        <Accordion type="multiple" defaultValue={plan.plan.map(p => p.day)} className="w-full space-y-4">
          {plan.plan.map((dailyPlan) => (
            <AccordionItem value={dailyPlan.day} key={dailyPlan.day} className="border rounded-lg shadow-sm">
              <AccordionTrigger className="px-6 py-4 hover:no-underline text-xl font-bold">
                <div className="flex justify-between w-full pr-4">
                    <span>{dailyPlan.day}</span>
                    <span className="text-sm font-normal text-muted-foreground self-end">
                        {dailyPlan.totalCalories.toFixed(0)} Kcal totales por persona
                    </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-2 sm:px-6 space-y-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-primary">Desayuno</h3>
                  <MealCard meal={dailyPlan.breakfast} />
                </div>
                 <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-primary">Almuerzo</h3>
                  <MealCard meal={dailyPlan.lunch} />
                </div>
                 <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-primary">Cena</h3>
                  <MealCard meal={dailyPlan.dinner} />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        <Card className="shadow-md">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                        <ListChecks size={24}/>
                        Lista de Compras Semanal
                    </CardTitle>
                    <CardDescription>
                        Todos los ingredientes que necesitas para tu plan, consolidados en una sola lista.
                    </CardDescription>
                  </div>
                  <Button onClick={listProps.onSaveToMainList} disabled={shoppingList.length === 0} className="w-full sm:w-auto">
                    <Save className="mr-2 h-4 w-4" />
                    Guardar en mi Lista Principal
                  </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ShoppingList items={shoppingList} {...listProps} isPlannerView={true} />
            </CardContent>
        </Card>

      </CardContent>
    </Card>
  );
}
