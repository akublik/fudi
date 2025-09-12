
import type { Recipe } from '@/lib/types';
import { RecipeCard } from './RecipeCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookUser, Heart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FavoritesListProps {
  favorites: Recipe[];
  userCreations: Recipe[];
  onRemove: (recipeId: string) => void;
  defaultTab?: 'favorites' | 'creations';
}

export function FavoritesList({ favorites, userCreations, onRemove, defaultTab = 'favorites' }: FavoritesListProps) {

  const renderRecipeList = (recipes: Recipe[], isSavedRecipesView: boolean, emptyTitle: string, emptyDescription: string, Icon: React.ElementType) => {
    if (recipes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 min-h-[200px]">
          <Icon className="h-16 w-16 mb-4" />
          <h3 className="text-xl font-semibold">{emptyTitle}</h3>
          <p className="mt-2">{emptyDescription}</p>
        </div>
      );
    }
    return (
      <ScrollArea className="h-full">
        <div className="p-4 grid grid-cols-1 gap-4">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onSave={() => {}}
              onRemove={onRemove}
              isFavorite={true}
              isSavedRecipesView={isSavedRecipesView}
            />
          ))}
        </div>
      </ScrollArea>
    );
  }
  
  return (
    <Tabs defaultValue={defaultTab} className="w-full flex flex-col flex-grow">
      <TabsList className="grid w-full grid-cols-2 shrink-0">
        <TabsTrigger value="favorites">
          <Heart className="mr-2 h-4 w-4"/>Favoritas
        </TabsTrigger>
        <TabsTrigger value="creations">
          <BookUser className="mr-2 h-4 w-4"/>Mis Creaciones
        </TabsTrigger>
      </TabsList>
      <TabsContent value="favorites" className="flex-grow">
        {renderRecipeList(
          favorites, 
          false, 
          "No tienes recetas guardadas", 
          "¡Guarda tus recetas favoritas para verlas aquí!", 
          Heart
        )}
      </TabsContent>
      <TabsContent value="creations" className="flex-grow">
        {renderRecipeList(
          userCreations, 
          true, 
          "No has creado recetas", 
          "¡Usa la pestaña 'Crea tu propia receta' para empezar!", 
          BookUser
        )}
      </TabsContent>
    </Tabs>
  );
}
