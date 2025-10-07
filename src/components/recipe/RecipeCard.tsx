"use client";

import Image from 'next/image';
import { useState } from 'react';
import { Heart, Trash2, Share2, Users, ShoppingCart, PlusCircle, User, ChefHat, Clock } from 'lucide-react';
import type { Recipe, Ingredient, ShoppingListItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CookingModeView } from './CookingModeView';


// Simple SVG icon for WhatsApp
const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
);


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
  const [isCookingModeOpen, setIsCookingModeOpen] = useState(false);

  const generateRecipeText = () => `Receta creada por Fudi Chef www.fudichef.com

Receta: ${recipe.name}
${recipe.author ? `Autor: ${recipe.author}\n` : ''}
Ingredientes (${servings} porciones):
${getAdjustedIngredients().map(i => `- ${i.quantity ? formatQuantity(i.quantity) : ''} ${i.unit || ''} ${i.name}`.trim()).join('\n')}

Instrucciones:
${recipe.instructions}
    `.trim();


  const handleShare = async (medium: 'clipboard' | 'whatsapp') => {
    const recipeText = generateRecipeText();
    
    if (medium === 'whatsapp') {
       window.open(`https://wa.me/?text=${encodeURIComponent(recipeText)}`, '_blank');
       return;
    }

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
    if (quantity % 1 === 0) {
      return quantity.toString();
    }
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
    <>
      <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl h-full">
        <CardHeader className="p-0 relative">
          <Image
            src={recipe.imageUrl || 'https://placehold.co/600x400.png'}
            alt={recipe.name}
            width={600}
            height={400}
            className={cn("w-full object-cover", isSavedRecipesView ? 'h-32' : 'h-48')}
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
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{recipe.preparationTime || '--'} min</span>
            </div>
            <div className="flex items-center gap-1">
              <ChefHat size={16} />
              <span>{recipe.difficulty || 'No especificada'}</span>
            </div>
          </div>
          
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
              <AccordionContent className="text-sm text-muted-foreground whitespace-pre-line">
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
        <CardFooter className="p-4 flex justify-end gap-2 mt-auto">
          <Button variant="outline" size="sm" onClick={() => setIsCookingModeOpen(true)}>
            <ChefHat className="mr-2 h-4 w-4" />
            Modo Cocina
          </Button>
          {onAddToShoppingList && (
            <Button variant="ghost" size="icon" onClick={() => onAddToShoppingList(shoppingIngredients, recipe.name)} aria-label="Agregar todos los ingredientes a la lista de compras">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => handleShare('whatsapp')} aria-label="Compartir en WhatsApp">
              <WhatsAppIcon />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleShare('clipboard')} aria-label="Copiar receta">
            <Share2 className="h-5 w-5" />
          </Button>
          {isSavedRecipesView && !!recipe.author ? (
            <Button variant="ghost" size="icon" onClick={() => onRemove(recipe.id)} aria-label="Eliminar receta creada">
              <Trash2 className="h-5 w-5 text-destructive" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => isFavorite ? onRemove(recipe.id) : onSave(recipe)} aria-label={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"} disabled={!!recipe.author}>
              <Heart className={`h-5 w-5 transition-colors ${isFavorite ? 'text-primary fill-current' : ''} ${!!recipe.author ? 'text-muted-foreground/50' : ''}`} />
            </Button>
          )}
        </CardFooter>
      </Card>
      <Dialog open={isCookingModeOpen} onOpenChange={setIsCookingModeOpen}>
        <DialogContent className="max-w-full w-full h-full p-0 flex flex-col">
          <CookingModeView recipe={recipe} servings={servings} />
        </DialogContent>
      </Dialog>
    </>
  );
}
