

"use client"

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Soup, ChefHat, Wind, Flame, Search, GlassWater, Camera, X, Cake } from 'lucide-react';
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
  style: z.enum(['Sencillo', 'Gourmet', 'Fryer', 'Parrillada', 'Bebidas', 'Reposteria'], {
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
  { value: 'Bebidas', label: 'Bebidas', description: 'Cócteles, jugos...', icon: GlassWater },
  { value: 'Reposteria', label: 'Repostería', description: 'Postres, pasteles...', icon: Cake },
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

 const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    setPreview(null);
    form.setValue('photoDataUri', '');
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }
  
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('query', e.target.value);
    if(e.target.value) {
      handleRemovePhoto();
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
              <div className="space-y-2">
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
                 {!hidePhotoUpload && !preview && (
                    <>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={!!query}
                    />
                    <button 
                        type="button"
                        onClick={handlePhotoClick}
                        disabled={isLoading || !!query}
                        className="w-full text-left p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors flex items-center gap-2 text-muted-foreground text-sm"
                    >
                        <Camera className="h-5 w-5" />
                        <span>O sube una foto de tu nevera... ¡o de un plato!</span>
                    </button>
                    </>
                 )}
                 {preview && (
                    <div className="relative w-full max-w-sm aspect-video">
                        <Image src={preview} alt="Vista previa del plato" layout="fill" objectFit="cover" className="rounded-md"/>
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={handleRemovePhoto}
                            className="absolute -top-2 -right-2 rounded-full h-7 w-7"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
              </div>
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
                      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
                    >
                      {styleOptions.map((option) => (
                        <FormItem key={option.value}>
                          <FormControl>
                            <RadioGroupItem value={option.value} className="sr-only" />
                          </FormControl>
                          <FormLabel 
                             className={cn(
                              "flex flex-col items-center justify-center rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors group h-full",
                              field.value === option.value ? "bg-accent text-accent-foreground border-primary" : "bg-popover"
                            )}
                          >
                            <option.icon className="h-8 w-8 mb-2" />
                            <span className="font-bold text-center">{option.label}</span>
                            <span className={cn("text-xs text-center", field.value === option.value ? "text-accent-foreground" : "text-muted-foreground group-hover:text-accent-foreground")}>{option.description}</span>
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

    
