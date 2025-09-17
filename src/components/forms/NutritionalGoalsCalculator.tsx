
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { NutritionalGoalsInputSchema, type NutritionalGoalsInput, type NutritionalGoalsOutput } from '@/lib/types';
import { calculateNutritionalGoals } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

interface NutritionalGoalsCalculatorProps {
  userGoal: NutritionalGoalsInput['goal'];
  onGoalsCalculated: (goals: NutritionalGoalsOutput) => void;
}

// We don't need the goal in the form, as it's passed via props
const FormSchema = NutritionalGoalsInputSchema.omit({ goal: true });
type FormValues = z.infer<typeof FormSchema>;

export function NutritionalGoalsCalculator({ userGoal, onGoalsCalculated }: NutritionalGoalsCalculatorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      gender: 'masculino',
      activityLevel: 'sedentario',
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const input: NutritionalGoalsInput = { ...values, goal: userGoal };
      const result = await calculateNutritionalGoals(input);
      toast({
        title: '¡Metas Calculadas!',
        description: 'Hemos autocompletado el formulario con tus metas estimadas.',
      });
      onGoalsCalculated(result);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'No se pudieron calcular las metas. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Género</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Selecciona tu género" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="femenino">Femenino</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Edad (años)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Ej: 30" value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="Ej: 70" value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Altura (cm)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Ej: 175" value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
            control={form.control}
            name="activityLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nivel de Actividad Física</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Selecciona tu nivel de actividad" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="sedentario">Sedentario (poco o nada de ejercicio)</SelectItem>
                    <SelectItem value="ligero">Ligero (ejercicio 1-3 días/semana)</SelectItem>
                    <SelectItem value="moderado">Moderado (ejercicio 3-5 días/semana)</SelectItem>
                    <SelectItem value="activo">Activo (ejercicio 6-7 días/semana)</SelectItem>
                    <SelectItem value="muy-activo">Muy Activo (trabajo físico o ejercicio intenso)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        
        <div className="bg-muted p-3 rounded-md text-center">
            <p className="text-sm font-semibold text-muted-foreground">Tu objetivo actual es: <span className="text-primary">{userGoal}</span></p>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Calcular y Usar Metas'}
        </Button>
      </form>
    </Form>
  );
}
