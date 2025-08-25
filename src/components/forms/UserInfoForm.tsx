"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserInfo } from '@/lib/types';

const formSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  whatsapp: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface UserInfoFormProps {
  onSave: (data: UserInfo) => void;
  initialData: UserInfo;
  card?: boolean;
}

export function UserInfoForm({ onSave, initialData, card = true }: UserInfoFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const handleSubmit = (values: FormValues) => {
    onSave(values as UserInfo);
  };
  
  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Tu nombre" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Input placeholder="Tu dirección" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp</FormLabel>
                <FormControl>
                  <Input placeholder="Tu número" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="shadow-md hover:shadow-lg hover:scale-105 transition-all">
          Guardar Mis Datos
        </Button>
      </form>
    </Form>
  );

  if (!card) {
    return formContent;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Tu Información</CardTitle>
        <CardDescription>Estos datos se usarán cuando compartas tu lista de compras.</CardDescription>
      </CardHeader>
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  );
}
