

"use client"

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Soup, ChefHat, Wind, Flame, Search, GlassWater, Camera, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Separator } from '../ui/separator';

const formSchema = z.object({
  query: z.string().optional(),
  photoDataUri: z.string().optional(),
  style: z.enum(['Sencillo', 'Gourmet', 'Fryer', 'Parrillada'], {
    required_error: "Debes seleccionar un estilo de cocina.",
  }),
  cuisine: z.string().optional(),
}).refine(data => !!data.query || !!data.photoDataUri, {
  message: 'Debes proporcionar ingredientes o subir una foto.',
  path: ['query'],
});

export type SuggestionFormValues = z.infer<typeof formSchema>;

interface SuggestionFormProps {
  title: string;
  description: string;
  label: string;
  placeholder: string;
  onSubmit: (values: SuggestionFormValues) => Promise<void>;
  isLoading: boolean;
  hidePhotoUpload?: boolean;
}

const styleOptions = [
  { value: 'Sencillo', label: 'Sencillo', description: 'Para el día a día', icon: Soup },
  { value: 'Gourmet', label: 'Gourmet', description: 'Ocasiones especiales', icon: ChefHat },
  { value: 'Fryer', label: 'Fryer', description: 'Freidora de aire', icon: Wind },
  { value: 'Parrillada', label: 'Parrillada', description: 'Asados y BBQ', icon: Flame },
] as const;

export function SuggestionForm({ title, description, label, placeholder, onSubmit, isLoading, hidePhotoUpload = false }: SuggestionFormProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<SuggestionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: '',
      photoDataUri: '',
      style: undefined,
      cuisine: '',
    },
  });
  
  const photoDataUri = useWatch({
    control: form.control,
    name: 'photoDataUri'
  });
  
  const query = useWatch({
    control: form.control,
    name: 'query'
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
        form.setValue('query', ''); // Clear text query when photo is selected
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
  
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('query', e.target.value);
    if(e.target.value) {
      setPreview(null);
      form.setValue('photoDataUri', '');
    }
  }

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
                      <Input 
                        placeholder={placeholder}
                        {...field}
                        onChange={handleQueryChange}
                        disabled={!!photoDataUri}
                        className="py-6 text-base"
                      />
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
                        <span className="font-mono text-2xl -mt-1">Ψq</span>
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

            {!hidePhotoUpload && (
              <>
                <div className="flex items-center gap-4">
                  <Separator className="flex-grow"/>
                  <span className="text-muted-foreground font-semibold">O</span>
                  <Separator className="flex-grow"/>
                </div>

                <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-lg">
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={!!query}
                    />
                    {preview ? (
                        <div className="relative w-full max-w-sm aspect-video">
                            <Image src={preview} alt="Vista previa del plato" layout="fill" objectFit="cover" className="rounded-md"/>
                        </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-20 text-center text-muted-foreground">
                            <Camera className="h-8 w-8 mb-2" />
                            <p>Analiza un plato desde una foto</p>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <Button type="button" variant="outline" onClick={handleCameraClick} disabled={isLoading || !!query}>
                            <Camera className="mr-2 h-4 w-4" />
                            Usar Cámara
                        </Button>
                          <Button type="button" variant="outline" onClick={handleGalleryClick} disabled={isLoading || !!query}>
                            <Upload className="mr-2 h-4 w-4" />
                            Subir de Galería
                        </Button>
                    </div>
                </div>
              </>
            )}
            
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
                              "flex flex-col items-center justify-center rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors group",
                              field.value === option.value ? "bg-accent text-accent-foreground border-primary" : "bg-popover"
                            )}
                          >
                            <option.icon className="h-8 w-8 mb-2" />
                            <span className="font-bold">{option.label}</span>
                            <span className={cn("text-xs", field.value === option.value ? "text-accent-foreground" : "text-muted-foreground group-hover:text-accent-foreground")}>{option.description}</span>
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
