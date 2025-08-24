"use client";

import Image from 'next/image';
import { useState } from 'react';
import { Heart, Trash2, Share2, Users, ShoppingCart } from 'lucide-react';
import type { Recipe, Ingredient } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RecipeCardProps {
  recipe: Recipe;
  onSave: (recipe: Recipe) => void;
  onRemove: (recipeId: string) => void;
  isFavorite: boolean;
  onAddToShoppingList: (ingredients: Ingredient[], recipeName: string) => void;
  isSavedRecipesView?: boolean;
}

export function RecipeCard({ recipe, onSave, onRemove, isFavorite, onAddToShoppingList, isSavedRecipesView = false }: RecipeCardProps) {
  const { toast } = useToast();
  const [servings, setServings] = useState(recipe.servings);

  const handleShare = async () => {
    const recipeText = `
Receta: ${recipe.name}

Ingredientes (${servings} porciones):
${getAdjustedIngredients().map(i => `- ${i.quantity ? i.quantity.toFixed(2).replace(/\.00$/, '') : ''} ${i.unit || ''} ${i.name}`.trim()).join('\n')}

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

  const getAdjustedIngredients = (): Ingredient[] => {
    if (servings === recipe.servings) {
      return recipe.ingredients;
    }
    const factor = servings / recipe.servings;
    return recipe.ingredients.map(ingredient => ({
      ...ingredient,
      quantity: ingredient.quantity * factor,
    }));
  };

  const handleServingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0) {
      setServings(value);
    } else if (e.target.value === '') {
      setServings(recipe.servings);
    }
  };

  const displayedIngredients = getAdjustedIngredients();

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
        <CardTitle className="font-headline text-2xl mb-2">{recipe.name}</CardTitle>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Rinde {recipe.servings} porciones</span>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor={`servings-${recipe.id}`} className="text-sm">Calcular para:</Label>
            <Input
              id={`servings-${recipe.id}`}
              type="number"
              min="1"
              value={servings}
              onChange={handleServingsChange}
              className="w-20 h-8"
              placeholder={`${recipe.servings} porciones`}
            />
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="ingredients">
            <AccordionTrigger>Ingredientes</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {displayedIngredients.map((ingredient, index) => (
                  <li key={index}>
                    {ingredient.quantity ? ingredient.quantity.toFixed(2).replace(/\.00$/, '') : ''} {ingredient.unit || ''} {ingredient.name}
                  </li>
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
        <Button variant="ghost" size="icon" onClick={() => onAddToShoppingList(displayedIngredients, recipe.name)} aria-label="Agregar a la lista de compras">
          <ShoppingCart className="h-5 w-5" />
        </Button>
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
