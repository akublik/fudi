"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { SuggestionForm } from '@/components/forms/SuggestionForm';
import { UserInfoForm } from '@/components/forms/UserInfoForm';
import { RecipeList } from '@/components/recipe/RecipeList';
import { FavoritesList } from '@/components/recipe/FavoritesList';
import { ShoppingList } from '@/components/recipe/ShoppingList';
import { getRecipesForIngredients, getComplementaryDishes } from '@/lib/actions';
import { useFavorites } from '@/hooks/use-favorites';
import { useShoppingList } from '@/hooks/use-shopping-list';
import { useUserInfo } from '@/hooks/use-user-info';
import type { Recipe, Ingredient, ShoppingListItem, UserInfo } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Heart, Loader2, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { favorites, addFavorite, removeFavorite, isFavorite, isLoaded: favoritesLoaded } = useFavorites();
  const { 
    shoppingList, 
    addItems,
    addItem, 
    removeItem, 
    updateItem, 
    toggleItem, 
    clearList,
    isLoaded: shoppingListLoaded 
  } = useShoppingList();
  const { userInfo, setUserInfo, isLoaded: userInfoLoaded } = useUserInfo();
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

  const handleAddToShoppingList = (ingredients: Ingredient[], recipeName: string) => {
    addItems(ingredients, recipeName);
    toast({
      title: '¡Añadido!',
      description: `Los ingredientes de "${recipeName}" se agregaron a tu lista de compras.`,
    });
  };

  const handleAddItemToShoppingList = (item: Omit<ShoppingListItem, 'id' | 'checked'>) => {
    addItem(item);
    toast({
      title: '¡Añadido!',
      description: `Se agregó "${item.name}" a tu lista de compras.`,
    });
  }

  const handleUserInfoSave = (data: UserInfo) => {
    setUserInfo(data);
    toast({
      title: '¡Datos guardados!',
      description: 'Tu información se ha guardado correctamente.',
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="lg" className="shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Lista de Compras
              {shoppingListLoaded && shoppingList.length > 0 && (
                <span className="ml-2 bg-primary-foreground text-primary rounded-full px-2 py-0.5 text-xs font-bold">
                  {shoppingList.reduce((acc, item) => item.checked ? acc : acc + 1, 0)}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Mi Lista de Compras</SheetTitle>
            </SheetHeader>
            <ShoppingList 
              items={shoppingList}
              userInfo={userInfo}
              onToggle={toggleItem}
              onRemove={removeItem}
              onUpdate={updateItem}
              onClear={clearList}
              onAddItem={handleAddItemToShoppingList}
            />
          </SheetContent>
        </Sheet>
        <Sheet>
          <SheetTrigger asChild>
            <Button size="lg" variant="secondary" className="shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              <Heart className="mr-2 h-5 w-5" />
              Mis Favoritos
              {favoritesLoaded && favorites.length > 0 && (
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

      <main className="container mx-auto px-4 py-8 flex-grow">
        <Header />

        <div className="w-full max-w-4xl mx-auto mt-8 space-y-8">
          {userInfoLoaded && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <UserInfoForm onSave={handleUserInfoSave} initialData={userInfo} />
              <div className="hidden md:block">
                <Image
                  src="https://i.postimg.cc/MfnmnzHk/image.png"
                  alt="Amigos cocinando juntos y usando una app de recetas"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-xl aspect-video object-cover"
                  data-ai-hint="friends cooking"
                />
              </div>
            </div>
          )}
        
          <Tabs defaultValue="ingredients" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ingredients">¿Qué puedo cocinar hoy?</TabsTrigger>
              <TabsTrigger value="accompaniment">¿Con qué puedo acompañar?</TabsTrigger>
            </TabsList>
            <TabsContent value="ingredients">
              <SuggestionForm
                title="¿Qué puedo cocinar hoy?"
                description="Dinos qué ingredientes tienes y te daremos algunas ideas."
                label="Ingredientes (separados por comas)"
                placeholder="Ej: carne, papas, cebolla, chocolate, ron"
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
        </div>
        
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
          onAddToShoppingList={handleAddToShoppingList}
        />
      </main>
      <Footer />
    </div>
  );
}
