
"use client"

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2, Camera, Wand2, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const formSchema = z.object({
  photoDataUri: z.string().min(1, { message: 'Debes seleccionar una imagen.' }),
});

export type AnalyzeDishFormValues = z.infer<typeof formSchema>;

interface AnalyzeDishFormProps {
  onSubmit: (values: AnalyzeDishFormValues) => Promise<void>;
  isLoading: boolean;
}

export function AnalyzeDishForm({ onSubmit, isLoading }: AnalyzeDishFormProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<AnalyzeDishFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      photoDataUri: '',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          title: 'Imagen Demasiado Grande',
          description: 'Por favor, selecciona una imagen de menos de 4MB.',
          variant: 'destructive',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setPreview(dataUri);
        form.setValue('photoDataUri', dataUri);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCameraClick = () => {
    if (fileInputRef.current) {
        fileInputRef.current.setAttribute('capture', 'environment');
        fileInputRef.current.click();
    }
  }
  
  const handleGalleryClick = () => {
    if (fileInputRef.current) {
        fileInputRef.current.removeAttribute('capture');
        fileInputRef.current.click();
    }
  }


  const handleSubmit = async (values: AnalyzeDishFormValues) => {
    await onSubmit(values);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Analizar Plato con Foto</CardTitle>
        <CardDescription>Toma o sube una foto de un plato de comida y la IA generará una receta para prepararlo.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="photoDataUri"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Foto del Plato</FormLabel>
                   <FormControl>
                        <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-lg">
                           <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            {preview ? (
                                <div className="relative w-full max-w-sm aspect-video">
                                    <Image src={preview} alt="Vista previa del plato" layout="fill" objectFit="cover" className="rounded-md"/>
                                </div>
                            ) : (
                               <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                                    <Camera className="h-12 w-12 mb-2" />
                                    <p>Usa la cámara o sube una foto</p>
                                </div>
                            )}

                           <div className="flex gap-4">
                                <Button type="button" variant="outline" onClick={handleCameraClick} disabled={isLoading}>
                                    <Camera className="mr-2 h-4 w-4" />
                                    Usar Cámara
                                </Button>
                                 <Button type="button" variant="outline" onClick={handleGalleryClick} disabled={isLoading}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Subir de Galería
                                </Button>
                           </div>
                        </div>
                    </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
           
            <Button type="submit" disabled={isLoading || !preview} className="w-full sm:w-auto shadow-md hover:shadow-lg hover:scale-105 transition-all">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analizando Plato...
                </>
              ) : (
                 <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generar Receta
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
