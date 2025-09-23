
"use client";

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { importRecipe } from '@/lib/actions';
import { useFavorites } from '@/hooks/use-favorites';

function ShareTargetProcessor() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { addFavorite } = useFavorites();

  useEffect(() => {
    const sharedText = searchParams.get('text') || searchParams.get('title') || searchParams.get('url');

    if (sharedText) {
      const processSharedText = async () => {
        try {
          const result = await importRecipe({ text: sharedText });
          if (result) {
            addFavorite(result, true); // Automatically save the imported recipe
            toast({
              title: '¡Receta Importada y Guardada!',
              description: `"${result.name}" se ha añadido a Mis recetas Fudi.`,
            });
          } else {
            throw new Error('No se pudo procesar la receta desde el texto compartido.');
          }
        } catch (error: any) {
          console.error("Error processing shared text:", error);
          toast({
            title: 'Error de Importación',
            description: 'No se pudo importar la receta. Inténtalo de nuevo desde la app.',
            variant: 'destructive',
          });
        } finally {
          // Redirect to the main page after processing
          router.replace('/');
        }
      };

      processSharedText();
    } else {
      // If no text is found, just redirect to the home page
       router.replace('/');
    }
  }, [searchParams, router, toast, addFavorite]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <h1 className="text-2xl font-bold">Importando tu receta...</h1>
      <p className="text-muted-foreground mt-2">Fudi Chef está procesando la receta que compartiste.</p>
    </div>
  );
}

export default function ShareTargetPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <ShareTargetProcessor />
        </Suspense>
    )
}
