
"use client"

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '../ui/textarea';

const formSchema = z.object({
  recipeName: z.string().min(3, { message: 'Debe tener al menos 3 caracteres.' }),
  authorName: z.string().optional(),
  ingredients: z.string().min(10, { message: 'Describe al menos un ingrediente.' }),
});

export type UserRecipeFormValues = z.infer<typeof formSchema>;

interface UserRecipeFormProps {
  onSubmit: (values: UserRecipeFormValues) => Promise<void>;
  isLoading: boolean;
}

export function UserRecipeForm({ onSubmit, isLoading }: UserRecipeFormProps) {
  const form = useForm<UserRecipeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipeName: '',
      authorName: '',
      ingredients: '',
    },
  });

  const handleSubmit = async (values: UserRecipeFormValues) => {
    await onSubmit(values);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Crea tu propia receta</CardTitle>
        <CardDescription>Dinos el nombre, los ingredientes y quién es el autor. Fudi Chef se encargará del resto.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="recipeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Receta</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Lasaña de la abuela" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="authorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tu Nombre (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Chef Andrés" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="ingredients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ingredientes</FormLabel>
                  <FormControl>
                    <Textarea 
                        placeholder="Describe los ingredientes que lleva tu receta. Puedes usar comas o ponerlos en varias líneas.&#10;Ej: Carne molida, pasta para lasaña, queso mozzarella, salsa de tomate, cebolla..."
                        {...field} 
                        rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
           
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto shadow-md hover:shadow-lg hover:scale-105 transition-all">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando Magia...
                </>
              ) : (
                'Crear Receta'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

    