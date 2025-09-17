
"use client"

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WeeklyMenuInputSchema, type WeeklyMenuInput } from '@/lib/types';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '../ui/checkbox';


interface PlannerFormProps {
  onSubmit: (values: WeeklyMenuInput) => Promise<void>;
  isLoading: boolean;
}

const ageGroups = ['Niños (3-10)', 'Adolescentes (11-17)', 'Adultos (18-64)', 'Adultos Mayores (65+)'];
const mealTypes = [
  { id: 'breakfast', label: 'Desayuno' },
  { id: 'lunch', label: 'Almuerzo' },
  { id: 'dinner', label: 'Cena' },
] as const;

export function PlannerForm({ onSubmit, isLoading }: PlannerFormProps) {
  const form = useForm<WeeklyMenuInput>({
    resolver: zodResolver(WeeklyMenuInputSchema),
    defaultValues: {
      diners: [{ ageGroup: 'Adultos (18-64)', people: 1 }],
      goal: 'Comer balanceado',
      meals: ['breakfast', 'lunch', 'dinner'],
      restrictions: '',
      days: 7,
      cuisine: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "diners",
  });

  const handleSubmit = async (values: WeeklyMenuInput) => {
    await onSubmit(values);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Planificador de Menú Semanal</CardTitle>
        <CardDescription>Dinos tus preferencias y generaremos un plan de comidas personalizado para ti.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            <div className="space-y-4">
              <FormLabel>¿Para quiénes es el plan?</FormLabel>
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
                      <FormLabel>Objetivo Nutricional</FormLabel>
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
                      <FormLabel>Número de Días del Plan: {field.value}</FormLabel>
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
                        <FormLabel className="text-base">Comidas a Incluir</FormLabel>
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
                      <FormLabel>Alergias o Restricciones (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: sin gluten, vegetariano, alergia a las nueces" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cuisine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Cocina (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Italiana, Mexicana, Mediterránea" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
           
            <Button type="submit" disabled={isLoading} size="lg" className="w-full sm:w-auto shadow-md hover:shadow-lg hover:scale-105 transition-all">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
  );
}
