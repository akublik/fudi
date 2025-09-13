
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { SuggestionForm, type SuggestionFormValues } from '@/components/forms/SuggestionForm';
import { UserRecipeForm, type UserRecipeFormValues } from '@/components/forms/UserRecipeForm';
import { UserInfoForm } from '@/components/forms/UserInfoForm';
import { RecipeList } from '@/components/recipe/RecipeList';
import { FavoritesList } from '@/components/recipe/FavoritesList';
import { ShoppingList } from '@/components/recipe/ShoppingList';
import { getRecipesForIngredients, getComplementaryDishes, createUserRecipe } from '@/lib/actions';
import { useFavorites } from '@/hooks/use-favorites';
import { useShoppingList } from '@/hooks/use-shopping-list';
import { useUserInfo } from '@/hooks/use-user-info';
import type { Recipe, Ingredient, ShoppingListItem, UserInfo } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, Loader2, ShoppingCart, BookUser, CalendarClock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { CookbookBanner } from '@/components/common/CookbookBanner';
import { KitchenTipsChat } from '@/components/common/KitchenTipsChat';
import { EquivalencyTable } from '@/components/common/EquivalencyTable';
import { FudiShopBanner } from '@/components/common/FudiShopBanner';
import { PlannerBanner } from '@/components/common/PlannerBanner';

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { 
    favorites, 
    userCreations, 
    savedPlans,
    addFavorite, 
    removeFavorite, 
    isFavorite,
    removeSavedPlan, 
    isLoaded: favoritesLoaded 
  } = useFavorites();
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

  const handleIngredientsSubmit = async ({ query, style, cuisine }: SuggestionFormValues) => {
    setIsLoading(true);
    setRecipes([]);
    try {
      const results = await getRecipesForIngredients(query, style, cuisine);
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

  const handleDishSubmit = async ({ query, style, cuisine }: SuggestionFormValues) => {
    setIsLoading(true);
    setRecipes([]);
    try {
      const results = await getComplementaryDishes(query, style, cuisine);
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
  
  const handleCreateRecipeSubmit = async (values: UserRecipeFormValues) => {
    setIsLoading(true);
    setRecipes([]);
    try {
      const result = await createUserRecipe(values);
      if (!result) {
         toast({ title: "Error", description: "No se pudo crear la receta. Intenta de nuevo.", variant: "destructive" });
         return;
      }
      setRecipes([result]);
       addFavorite(result, true); // Automatically save user's creation
       toast({
        title: '¡Receta Creada y Guardada!',
        description: `"${result.name}" se ha añadido a Mis recetas Fudi.`,
      });
    } catch (error) {
      toast({ title: "Error", description: "Ocurrió un error al crear la receta.", variant: "destructive" });
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
  
  const handleRemovePlan = (planId: string) => {
    removeSavedPlan(planId);
    toast({
      title: 'Plan Eliminado',
      description: 'El plan de menú se ha eliminado de tus guardados.',
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
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="w-full flex flex-col sm:flex-row justify-end items-center gap-2 mb-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-lg hover:shadow-xl hover:scale-105 transition-all w-full sm:w-auto">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Lista de Compras
                {shoppingListLoaded && shoppingList.length > 0 && (
                  <span className="ml-2 bg-primary-foreground text-primary rounded-full px-2 py-0.5 text-xs font-bold">
                    {shoppingList.reduce((acc, item) => item.checked ? acc : acc + 1, 0)}
                  </span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md w-full p-0 flex flex-col h-[80vh] sm:h-[70vh]">
              <DialogHeader className="p-4 border-b">
                <DialogTitle>Mi Lista de Compras</DialogTitle>
              </DialogHeader>
               <ShoppingList
                items={shoppingList}
                userInfo={userInfo}
                onToggle={toggleItem}
                onRemove={removeItem}
                onUpdate={updateItem}
                onClear={clearList}
                onAddItem={handleAddItemToShoppingList}
                onSaveUserInfo={handleUserInfoSave}
              />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" variant="secondary" className="shadow-lg hover:shadow-xl hover:scale-105 transition-all w-full sm:w-auto">
                <BookUser className="mr-2 h-5 w-5" />
                Mis recetas Fudi
                {favoritesLoaded && (userCreations.length > 0 || savedPlans.length > 0) && (
                  <span className="ml-2 bg-primary-foreground text-primary rounded-full px-2 py-0.5 text-xs font-bold">
                    {userCreations.length + savedPlans.length}
                  </span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg w-full p-0 flex flex-col h-[80vh] sm:h-[70vh]">
              <DialogHeader className="p-4 border-b">
                <DialogTitle>Mis Recetas y Planes</DialogTitle>
              </DialogHeader>
              <FavoritesList
                favorites={favorites}
                userCreations={userCreations}
                savedPlans={savedPlans}
                onRemove={handleRemove}
                onRemovePlan={handleRemovePlan}
                defaultTab="creations"
              />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" variant="secondary" className="shadow-lg hover:shadow-xl hover:scale-105 transition-all w-full sm:w-auto">
                <Heart className="mr-2 h-5 w-5" />
                Mis Favoritos
                {favoritesLoaded && favorites.length > 0 && (
                  <span className="ml-2 bg-primary-foreground text-primary rounded-full px-2 py-0.5 text-xs font-bold">
                    {favorites.length}
                  </span>
                )}
              </Button>
            </DialogTrigger>
             <DialogContent className="max-w-lg w-full p-0 flex flex-col h-[80vh] sm:h-[70vh]">
              <DialogHeader className="p-4 border-b">
                <DialogTitle>Mis Recetas y Planes</DialogTitle>
              </DialogHeader>
              <FavoritesList
                favorites={favorites}
                userCreations={userCreations}
                savedPlans={savedPlans}
                onRemove={handleRemove}
                onRemovePlan={handleRemovePlan}
                defaultTab="favorites"
              />
            </DialogContent>
          </Dialog>
        </div>

        <Header />

        <div className="w-full max-w-4xl mx-auto mt-8 space-y-8">
          <Tabs defaultValue="ingredients" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 gap-2">
              <TabsTrigger value="ingredients" className="font-bold">¿Qué puedo cocinar?</TabsTrigger>
              <TabsTrigger value="accompaniment" className="data-[state=inactive]:bg-secondary/60 font-bold">¿Con qué acompañar?</TabsTrigger>
              <TabsTrigger value="create" className="data-[state=inactive]:bg-secondary/60 font-bold">Crea tu propia receta</TabsTrigger>
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
            <TabsContent value="create">
                <UserRecipeForm
                  onSubmit={handleCreateRecipeSubmit}
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
          onAddIngredientToShoppingList={handleAddItemToShoppingList}
        />
        
        <div className="w-full max-w-4xl mx-auto mt-12 space-y-12">
          <PlannerBanner />
          <EquivalencyTable />
          <CookbookBanner />
          <FudiShopBanner />
        </div>

      </main>
      <Footer />
       <Dialog>
        <DialogTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="fixed bottom-6 right-6 rounded-full w-20 h-20 shadow-2xl hover:scale-110 transition-transform z-50 bg-transparent hover:bg-transparent"
          >
            <Image
              src="https://i.imgur.com/ZYMmayW.png"
              alt="Fudi Chef"
              width={80}
              height={80}
              className="object-contain"
            />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-full max-w-md p-0 flex flex-col h-[70vh]">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Tips para convertirte en un Fudi Chef</DialogTitle>
          </DialogHeader>
          <KitchenTipsChat />
        </DialogContent>
      </Dialog>
    </div>
  );
}
