
"use client";

import Image from 'next/image';
import { useState } from 'react';
import { Heart, Trash2, Share2, Users, ShoppingCart, Info, PlusCircle, User } from 'lucide-react';
import type { Recipe, Ingredient, ShoppingListItem } from '@/lib/types';
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
  onAddToShoppingList?: (ingredients: Ingredient[], recipeName: string) => void;
  onAddIngredientToShoppingList?: (item: Omit<ShoppingListItem, 'id' | 'checked'>) => void;
  isSavedRecipesView?: boolean;
}

export function RecipeCard({ recipe, onSave, onRemove, isFavorite, onAddToShoppingList, onAddIngredientToShoppingList, isSavedRecipesView = false }: RecipeCardProps) {
  const { toast } = useToast();
  const [servings, setServings] = useState(recipe.servings);

  const handleShare = async () => {
    let recipeText = `
Receta: ${recipe.name}
${recipe.author ? `Autor: ${recipe.author}\n` : ''}
Ingredientes (${servings} porciones):
${getAdjustedIngredients().map(i => `- ${i.quantity ? formatQuantity(i.quantity) : ''} ${i.unit || ''} ${i.name}`.trim()).join('\n')}

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
    if (!servings || servings === recipe.servings) {
      return recipe.ingredients;
    }
    const factor = servings / recipe.servings;
    return recipe.ingredients.map(ingredient => ({
      ...ingredient,
      quantity: ingredient.quantity * factor,
    }));
  };
  
  const formatQuantity = (quantity: number) => {
    if (quantity === 0) return '';
    // If quantity is an integer, show it as is.
    if (quantity % 1 === 0) {
      return quantity.toString();
    }
    // If it's a decimal, format it to 2 decimal places, and remove trailing zeros.
    return parseFloat(quantity.toFixed(2)).toString();
  }

  const handleServingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0) {
      setServings(value);
    } else if (e.target.value === '') {
      // @ts-ignore
      setServings('');
    }
  };
  
  const handleAddIngredient = (ingredient: Ingredient) => {
    if (onAddIngredientToShoppingList) {
      onAddIngredientToShoppingList({
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        recipeName: recipe.name,
      });
    }
  };

  const displayedIngredients = getAdjustedIngredients();
  const shoppingIngredients = recipe.shoppingIngredients || recipe.ingredients;

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
         {recipe.author && (
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs font-bold p-2 rounded-lg flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Creado por: {recipe.author}</span>
          </div>
        )}
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
              <ul className="space-y-2 text-sm">
                {displayedIngredients.map((ingredient, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span>
                      {formatQuantity(ingredient.quantity)} {ingredient.unit || ''} {ingredient.name}
                    </span>
                    {onAddIngredientToShoppingList && (
                       <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleAddIngredient(ingredient)}>
                          <PlusCircle className="h-5 w-5 text-primary"/>
                       </Button>
                    )}
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
           {recipe.nutritionalInfo && (
            <AccordionItem value="nutritional-info">
              <AccordionTrigger>Información Nutricional (Estimada por porción)</AccordionTrigger>
              <AccordionContent>
                <ul className="text-sm space-y-1">
                  <li><strong>Calorías:</strong> {recipe.nutritionalInfo.calories.toFixed(0)} kcal</li>
                  <li><strong>Proteínas:</strong> {recipe.nutritionalInfo.protein.toFixed(1)} g</li>
                  <li><strong>Carbohidratos:</strong> {recipe.nutritionalInfo.carbs.toFixed(1)} g</li>
                  <li><strong>Grasas:</strong> {recipe.nutritionalInfo.fat.toFixed(1)} g</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
      <CardFooter className="p-4 flex justify-end gap-2">
        {onAddToShoppingList && (
          <Button variant="ghost" size="icon" onClick={() => onAddToShoppingList(shoppingIngredients, recipe.name)} aria-label="Agregar todos los ingredientes a la lista de compras">
            <ShoppingCart className="h-5 w-5" />
          </Button>
        )}
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

