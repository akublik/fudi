"use client";

import Image from 'next/image';
import { Heart, Trash2, Share2 } from 'lucide-react';
import type { Recipe } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';

interface RecipeCardProps {
  recipe: Recipe;
  onSave: (recipe: Recipe) => void;
  onRemove: (recipeId: string) => void;
  isFavorite: boolean;
  isSavedRecipesView?: boolean;
}

export function RecipeCard({ recipe, onSave, onRemove, isFavorite, isSavedRecipesView = false }: RecipeCardProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    const recipeText = `
Receta: ${recipe.name}

Ingredientes:
${recipe.ingredients.map(i => `- ${i}`).join('\n')}

Instrucciones:
${recipe.instructions}
    `.trim();

    try {
      await navigator.clipboard.writeText(recipeText);
      toast({
        title: '¡Receta copiada!',
        description: 'La receta ha sido copiada a tu portapapeles.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'No se pudo copiar la receta.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl">
      <CardHeader className="p-0 relative">
        <Image
          src={recipe.imageUrl || "https://placehold.co/600x400.png"}
          alt={recipe.name}
          width={600}
          height={400}
          className="w-full h-48 object-cover"
          data-ai-hint="recipe food"
        />
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col">
        <CardTitle className="font-headline text-2xl mb-4">{recipe.name}</CardTitle>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="ingredients">
            <AccordionTrigger>Ingredientes</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="instructions">
            <AccordionTrigger>Instrucciones</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground whitespace-pre-wrap">
              {recipe.instructions}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter className="p-4 flex justify-end gap-2">
        <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Compartir receta">
          <Share2 className="h-5 w-5" />
        </Button>
        {isSavedRecipesView ? (
          <Button variant="ghost" size="icon" onClick={() => onRemove(recipe.id)} aria-label="Eliminar receta de favoritos">
            <Trash2 className="h-5 w-5 text-destructive" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" onClick={() => isFavorite ? onRemove(recipe.id) : onSave(recipe)} aria-label={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}>
            <Heart className={`h-5 w-5 transition-colors ${isFavorite ? 'text-primary fill-current' : ''}`} />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
