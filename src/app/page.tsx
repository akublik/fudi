"use client";

import { useState } from 'react';
import { Header } from '@/components/common/Header';
import { SuggestionForm } from '@/components/forms/SuggestionForm';
import { RecipeList } from '@/components/recipe/RecipeList';
import { FavoritesList } from '@/components/recipe/FavoritesList';
import { getRecipesForIngredients, getComplementaryDishes } from '@/lib/actions';
import { useFavorites } from '@/hooks/use-favorites';
import type { Recipe } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Heart, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { favorites, addFavorite, removeFavorite, isFavorite, isLoaded } = useFavorites();
  const { toast } = useToast();

  const handleIngredientsSubmit = async (query: string) => {
    setIsLoading(true);
    setRecipes([]);
    try {
      const results = await getRecipesForIngredients(query);
      if (results.length === 0) {
        toast({ title: "Sin resultados", description: "No encontramos recetas con esos ingredientes. ¡Intenta con otros!", variant: "destructive" });
      }
      setRecipes(results);
    } catch (error) {
      toast({ title: "Error", description: "Ocurrió un error al buscar recetas.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDishSubmit = async (query: string) => {
    setIsLoading(true);
    setRecipes([]);
    try {
      const results = await getComplementaryDishes(query);
      if (results.length === 0) {
        toast({ title: "Sin resultados", description: "No encontramos acompañamientos para ese plato. ¡Intenta con otro!", variant: "destructive" });
      }
      setRecipes(results);
    } catch (error) {
      toast({ title: "Error", description: "Ocurrió un error al buscar acompañamientos.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = (recipe: Recipe) => {
    addFavorite(recipe);
    toast({
      title: '¡Guardada!',
      description: `"${recipe.name}" se ha añadido a tus favoritos.`,
    });
  };

  const handleRemove = (recipeId: string) => {
    removeFavorite(recipeId);
    toast({
      title: 'Eliminada',
      description: 'La receta se ha eliminado de tus favoritos.',
    });
  };

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="lg">
              <Heart className="mr-2 h-5 w-5" />
              Mis Favoritos
              {isLoaded && favorites.length > 0 && (
                <span className="ml-2 bg-primary-foreground text-primary rounded-full px-2 py-0.5 text-xs font-bold">
                  {favorites.length}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Mis Recetas Favoritas</SheetTitle>
            </SheetHeader>
            <FavoritesList favorites={favorites} onRemove={handleRemove} />
          </SheetContent>
        </Sheet>
      </div>

      <main className="container mx-auto px-4 py-8">
        <Header />

        <Tabs defaultValue="ingredients" className="w-full max-w-4xl mx-auto mt-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ingredients">¿Qué puedo cocinar hoy?</TabsTrigger>
            <TabsTrigger value="accompaniment">¿Con qué puedo acompañar?</TabsTrigger>
          </TabsList>
          <TabsContent value="ingredients">
            <SuggestionForm
              title="¿Qué puedo cocinar hoy?"
              description="Dinos qué ingredientes tienes y te daremos algunas ideas."
              label="Ingredientes (separados por comas)"
              placeholder="Ej: carne, papas, cebolla"
              onSubmit={handleIngredientsSubmit}
              isLoading={isLoading}
            />
          </TabsContent>
          <TabsContent value="accompaniment">
            <SuggestionForm
              title="¿Con qué puedo acompañar?"
              description="Dinos cuál es tu plato principal y te sugeriremos acompañamientos."
              label="Plato Principal"
              placeholder="Ej: Pollo asado"
              onSubmit={handleDishSubmit}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
        
        {isLoading && (
          <div className="text-center py-16">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-lg text-muted-foreground">Buscando las mejores recetas para ti...</p>
          </div>
        )}

        {!isLoading && recipes.length > 0 && <Separator className="my-12" />}

        <RecipeList
          recipes={recipes}
          onSave={handleSave}
          onRemove={handleRemove}
          isFavorite={isFavorite}
        />
      </main>
    </>
  );
}
