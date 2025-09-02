
"use client"

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  query: z.string().min(3, { message: 'Debe tener al menos 3 caracteres.' }),
  style: z.enum(['Sencillo', 'Gourmet']),
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

export function SuggestionForm({ title, description, label, placeholder, onSubmit, isLoading }: SuggestionFormProps) {
  const form = useForm<SuggestionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: '',
      style: 'Sencillo',
      cuisine: '',
    },
  });

  const handleSubmit = async (values: SuggestionFormValues) => {
    await onSubmit(values);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <FormControl>
                    <Input placeholder={placeholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="style"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Estilo de Cocina</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Sencillo" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Sencillo (Para el día a día)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Gourmet" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Gourmet (Para ocasiones especiales)
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
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
                    <FormLabel>Tipo de Cocina (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Para picar, Snacks, Italiana, Vegetariana" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
           
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto shadow-md hover:shadow-lg hover:scale-105 transition-all">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                'Buscar'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

    
