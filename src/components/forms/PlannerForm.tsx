
"use client"

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WeeklyMenuInputSchema, type WeeklyMenuInput } from '@/lib/types';
import { Slider } from '@/components/ui/slider';


interface PlannerFormProps {
  onSubmit: (values: WeeklyMenuInput) => Promise<void>;
  isLoading: boolean;
}

export function PlannerForm({ onSubmit, isLoading }: PlannerFormProps) {
  const form = useForm<WeeklyMenuInput>({
    resolver: zodResolver(WeeklyMenuInputSchema),
    defaultValues: {
      ageGroup: 'Adultos (18-59)',
      goal: 'Comer balanceado',
      restrictions: '',
      days: 7,
    },
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                  control={form.control}
                  name="ageGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grupo de Edad</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un grupo de edad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Niños (3-10)">Niños (3-10 años)</SelectItem>
                          <SelectItem value="Adolescentes (11-17)">Adolescentes (11-17 años)</SelectItem>
                          <SelectItem value="Adultos (18-59)">Adultos (18-59 años)</SelectItem>
                          <SelectItem value="Adultos Mayores (60+)">Adultos Mayores (60+)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
            </div>

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
