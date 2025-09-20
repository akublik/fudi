

"use client"

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Soup, ChefHat, Wind, Flame, Search, GlassWater } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  query: z.string().min(3, { message: 'Debe tener al menos 3 caracteres.' }),
  style: z.enum(['Sencillo', 'Gourmet', 'Fryer', 'Parrillada'], {
    required_error: "Debes seleccionar un estilo de cocina.",
  }),
  cuisine: z.string().optional(),
});

export type SuggestionFormValues = z.infer<typeof formSchema>;

interface SuggestionFormProps {
  title: string;
  description: string;
  label: string;
  placeholder: string;
  onSubmit: (values: SuggestionFormValues) => Promise<void>;
  isLoading: boolean;
}

const styleOptions = [
  { value: 'Sencillo', label: 'Sencillo', description: 'Para el día a día', icon: Soup },
  { value: 'Gourmet', label: 'Gourmet', description: 'Ocasiones especiales', icon: ChefHat },
  { value: 'Fryer', label: 'Fryer', description: 'Freidora de aire', icon: Wind },
  { value: 'Parrillada', label: 'Parrillada', description: 'Asados y BBQ', icon: Flame },
] as const;

export function SuggestionForm({ title, description, label, placeholder, onSubmit, isLoading }: SuggestionFormProps) {
  const form = useForm<SuggestionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: '',
      cuisine: '',
    },
  });

  const handleSubmit = async (values: SuggestionFormValues) => {
    await onSubmit(values);
  };

  return (
    <Card className="w-full border-2 border-primary/20 shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-4xl">{title}</CardTitle>
        <CardDescription className="text-lg">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold flex items-center gap-2">
                      <Soup />
                      <GlassWater />
                      {label}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: carne, papas, cebolla, whisky, limones" {...field} className="py-6 text-base"/>
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
                    <FormLabel className="text-base font-semibold flex items-center gap-2">
                        <span className="font-mono text-lg">Ψq</span>
                        Tipo de Cocina (Opcional)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Para picar, Cócteles, Italiana, Postres" {...field} className="py-6 text-base"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="style"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-semibold">Estilo de Cocina</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                      {styleOptions.map((option) => (
                        <FormItem key={option.value}>
                          <FormControl>
                            <RadioGroupItem value={option.value} className="sr-only" />
                          </FormControl>
                          <FormLabel 
                             className={cn(
                              "flex flex-col items-center justify-center rounded-md border-2 bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors group",
                              field.value === option.value && "border-primary bg-accent text-accent-foreground"
                            )}
                          >
                            <option.icon className="h-8 w-8 mb-2" />
                            <span className="font-bold">{option.label}</span>
                            <span className={cn("text-xs text-muted-foreground group-hover:text-accent-foreground", field.value === option.value && "text-accent-foreground")}>{option.description}</span>
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
           
            <Button type="submit" disabled={isLoading} size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-xl hover:scale-105 transition-all text-lg py-7">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Buscar Ideas
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
