
"use client"

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '../ui/textarea';

const formSchema = z.object({
  text: z.string().min(20, { message: 'El texto de la receta parece demasiado corto.' }),
});

export type ImportRecipeFormValues = z.infer<typeof formSchema>;

interface ImportRecipeFormProps {
  onSubmit: (values: ImportRecipeFormValues) => Promise<void>;
  isLoading: boolean;
}

export function ImportRecipeForm({ onSubmit, isLoading }: ImportRecipeFormProps) {
  const form = useForm<ImportRecipeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
    },
  });

  const handleSubmit = async (values: ImportRecipeFormValues) => {
    await onSubmit(values);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Importar Receta</CardTitle>
        <CardDescription>Pega el texto de una receta de cualquier red social o página web. Fudi Chef la analizará y la convertirá en una receta estructurada.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto de la Receta</FormLabel>
                  <FormControl>
                    <Textarea 
                        placeholder="Pega aquí el texto completo de la receta, incluyendo ingredientes e instrucciones..."
                        {...field} 
                        rows={10}
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
                  Importando...
                </>
              ) : (
                 <>
                  <Download className="mr-2 h-4 w-4" />
                  Importar y Convertir Receta
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
