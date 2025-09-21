
"use client"

import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Trash2, Wand2, Users, Goal, CalendarDays, UtensilsCrossed, Wheat, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WeeklyMenuInputSchema, type WeeklyMenuInput, type UserPreferences } from '@/lib/types';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '../ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useState } from 'react';
import { NutritionalGoalsCalculator } from './NutritionalGoalsCalculator';


interface PlannerFormProps {
  onSubmit: (values: WeeklyMenuInput) => Promise<void>;
  isLoading: boolean;
  userPreferences: Partial<UserPreferences>;
  onProfileSave: (data: Partial<UserPreferences>) => void;
}

const ageGroups = ['Niños (3-10)', 'Adolescentes (11-17)', 'Adultos (18-64)', 'Adultos Mayores (65+)'];
const mealTypes = [
  { id: 'breakfast', label: 'Desayuno' },
  { id: 'lunch', label: 'Almuerzo' },
  { id: 'dinner', label: 'Cena' },
] as const;

export function PlannerForm({ onSubmit, isLoading, userPreferences, onProfileSave }: PlannerFormProps) {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  
  const form = useForm<WeeklyMenuInput>({
    resolver: zodResolver(WeeklyMenuInputSchema),
    defaultValues: {
      diners: [{ ageGroup: 'Adultos (18-64)', people: 1 }],
      goal: 'Comer balanceado',
      meals: ['breakfast', 'lunch', 'dinner'],
      restrictions: userPreferences.restrictions?.join(', ') || '',
      days: 7,
      cuisine: userPreferences.cuisines?.join(', ') || '',
      targetCalories: undefined,
      targetProtein: undefined,
      targetCarbs: undefined,
      targetFat: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "diners",
  });
  
  const currentGoal = useWatch({
    control: form.control,
    name: 'goal'
  });

  const handleSubmit = async (values: WeeklyMenuInput) => {
    const processedValues = {
        ...values,
        targetCalories: values.targetCalories || undefined,
        targetProtein: values.targetProtein || undefined,
        targetCarbs: values.targetCarbs || undefined,
        targetFat: values.targetFat || undefined,
    };
    await onSubmit(processedValues);
  };
  
  const handleGoalsCalculated = (goals: {calories: number, protein: number, carbs: number, fat: number}) => {
    form.setValue('targetCalories', goals.calories);
    form.setValue('targetProtein', goals.protein);
    form.setValue('targetCarbs', goals.carbs);
    form.setValue('targetFat', goals.fat);
    setIsCalculatorOpen(false);
  }
  
  const handleProfileSaveForCalc = (data: Omit<UserPreferences, 'restrictions' | 'cuisines' | 'otherCuisines' | 'totalPoints'>) => {
      onProfileSave(data);
  }

  return (
    <Dialog open={isCalculatorOpen} onOpenChange={setIsCalculatorOpen}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="font-headline text-4xl">Planificador de Menú Semanal</CardTitle>
          <CardDescription className="text-lg">Dinos tus preferencias y generaremos un plan de comidas personalizado para ti.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              
              <div className="space-y-4">
                <FormLabel className="font-semibold text-lg flex items-center gap-2"><Users /> ¿Para quiénes es el plan?</FormLabel>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2 p-2 border rounded-md">
                    <FormField
                        control={form.control}
                        name={`diners.${index}.ageGroup`}
                        render={({ field }) => (
                          <FormItem className="flex-grow">
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Grupo de edad" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ageGroups.map(group => (
                                  <SelectItem key={group} value={group}>{group}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`diners.${index}.people`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                placeholder="Nº Personas"
                                className="w-28"
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value, 10))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 1}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                  </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ ageGroup: 'Adultos (18-64)', people: 1 })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir otro grupo
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="goal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold flex items-center gap-2"><Goal /> Objetivo Nutricional</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un objetivo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Perder peso">Perder peso</SelectItem>
                            <SelectItem value="Ganar músculo">Ganar músculo</SelectItem>
                            <SelectItem value="Comer balanceado">Comer balanceado</SelectItem>
                            <SelectItem value="Controlar diabetes">Controlar diabetes</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold flex items-center gap-2"><CalendarDays /> Días del Plan: {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                              min={1}
                              max={7}
                              step={1}
                              defaultValue={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>
              <FormField
                  control={form.control}
                  name="meals"
                  render={() => (
                      <FormItem>
                      <div className="mb-4">
                          <FormLabel className="font-semibold text-lg flex items-center gap-2"><UtensilsCrossed /> Comidas a Incluir</FormLabel>
                          <FormDescription>
                          Selecciona qué comidas quieres en tu plan semanal.
                          </FormDescription>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4">
                      {mealTypes.map((item) => (
                          <FormField
                          key={item.id}
                          control={form.control}
                          name="meals"
                          render={({ field }) => {
                              return (
                              <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                  <FormControl>
                                  <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                      return checked
                                          ? field.onChange([...field.value, item.id])
                                          : field.onChange(
                                              field.value?.filter(
                                              (value) => value !== item.id
                                              )
                                          )
                                      }}
                                  />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                      {item.label}
                                  </FormLabel>
                              </FormItem>
                              )
                          }}
                          />
                      ))}
                      </div>
                      <FormMessage />
                      </FormItem>
                  )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="restrictions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold flex items-center gap-2"><Wheat /> Alergias o Restricciones (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: sin gluten, vegetariano, alergia a las nueces" {...field} />
                        </FormControl>
                         <FormDescription>Tus preferencias guardadas se usan automáticamente.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cuisine"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold flex items-center gap-2"><Globe /> Tipo de Cocina (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Italiana, Mexicana, Mediterránea" {...field} />
                        </FormControl>
                        <FormDescription>Tus preferencias guardadas se usan automáticamente.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>
              
              <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                      <div className="flex justify-between items-center w-full">
                        <AccordionTrigger className="flex-grow text-lg">
                          <span>Metas Nutricionales (Opcional)</span>
                        </AccordionTrigger>
                         <DialogTrigger asChild>
                            <Button type="button" variant="outline" size="sm" className="mr-4 gap-2">
                              <Wand2 />
                              Calcular mis metas
                            </Button>
                         </DialogTrigger>
                      </div>
                      <AccordionContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                              <FormField
                              control={form.control}
                              name="targetCalories"
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>Calorías (kcal)</FormLabel>
                                  <FormControl>
                                      <Input type="number" placeholder="Ej: 2000" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} />
                                  </FormControl>
                                  </FormItem>
                              )}
                              />
                              <FormField
                              control={form.control}
                              name="targetProtein"
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>Proteínas (g)</FormLabel>
                                  <FormControl>
                                      <Input type="number" placeholder="Ej: 150" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} />
                                  </FormControl>
                                  </FormItem>
                              )}
                              />
                              <FormField
                              control={form.control}
                              name="targetCarbs"
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>Hidratos (g)</FormLabel>
                                  <FormControl>
                                      <Input type="number" placeholder="Ej: 250" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} />
                                  </FormControl>
                                  </FormItem>
                              )}
                              />
                              <FormField
                              control={form.control}
                              name="targetFat"
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>Grasas (g)</FormLabel>
                                  <FormControl>
                                      <Input type="number" placeholder="Ej: 70" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} />
                                  </FormControl>
                                  </FormItem>
                              )}
                              />
                          </div>
                      </AccordionContent>
                  </AccordionItem>
              </Accordion>
            
              <Button type="submit" disabled={isLoading} size="lg" className="w-full text-lg py-7 shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generando Plan...
                  </>
                ) : (
                  'Generar Mi Plan de Menú'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asistente de Metas Nutricionales</DialogTitle>
          <DialogDescription>
            Proporciona tus datos para que podamos calcular una estimación de tus necesidades diarias. Esta es solo una recomendación.
          </DialogDescription>
        </DialogHeader>
        <NutritionalGoalsCalculator
          userGoal={currentGoal}
          onGoalsCalculated={handleGoalsCalculated}
          onProfileSave={handleProfileSaveForCalc}
          initialData={userPreferences}
        />
      </DialogContent>
    </Dialog>
  );
}
