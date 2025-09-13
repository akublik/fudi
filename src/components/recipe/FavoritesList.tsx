

import type { Recipe, WeeklyMenuOutput } from '@/lib/types';
import { RecipeCard } from './RecipeCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookUser, Heart, CalendarClock, Trash2, View } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '../ui/button';

interface FavoritesListProps {
  favorites: Recipe[];
  userCreations: Recipe[];
  savedPlans: WeeklyMenuOutput[];
  onRemove: (recipeId: string) => void;
  onRemovePlan: (planId: string) => void;
  onViewPlan: (plan: WeeklyMenuOutput) => void;
  defaultTab?: 'favorites' | 'creations' | 'plans';
}

export function FavoritesList({ favorites, userCreations, savedPlans, onRemove, onRemovePlan, onViewPlan, defaultTab = 'favorites' }: FavoritesListProps) {

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
      <ScrollArea className="flex-grow p-4">
        <div className="grid grid-cols-1 gap-4">
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

  const renderPlanList = (plans: WeeklyMenuOutput[], emptyTitle: string, emptyDescription: string, Icon: React.ElementType) => {
    if (plans.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 min-h-[200px]">
          <Icon className="h-16 w-16 mb-4" />
          <h3 className="text-xl font-semibold">{emptyTitle}</h3>
          <p className="mt-2">{emptyDescription}</p>
        </div>
      );
    }
    return (
       <ScrollArea className="flex-grow p-4">
        <div className="grid grid-cols-1 gap-4">
          {plans.map((plan) => (
            <Card key={plan.id} className="shadow-md">
              <CardHeader>
                <CardTitle>Plan Semanal</CardTitle>
                <CardDescription>Guardado el {new Date().toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{plan.summary}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => onViewPlan(plan)}>
                  <View className="mr-2 h-4 w-4" />
                  Ver Plan
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onRemovePlan(plan.id!)}>
                  <Trash2 className="h-5 w-5 text-destructive" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
       </ScrollArea>
    )
  }
  
  return (
    <Tabs defaultValue={defaultTab} className="w-full flex flex-col flex-grow">
      <TabsList className="grid w-full grid-cols-3 shrink-0">
        <TabsTrigger value="favorites">
          <Heart className="mr-2 h-4 w-4"/>Favoritas
        </TabsTrigger>
        <TabsTrigger value="creations">
          <BookUser className="mr-2 h-4 w-4"/>Mis Creaciones
        </TabsTrigger>
        <TabsTrigger value="plans">
          <CalendarClock className="mr-2 h-4 w-4"/>Mis Planes
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="favorites" className="flex-grow mt-0">
        {renderRecipeList(
          favorites, 
          false, 
          "No tienes recetas guardadas", 
          "¡Guarda tus recetas favoritas para verlas aquí!", 
          Heart
        )}
      </TabsContent>
      <TabsContent value="creations" className="flex-grow mt-0">
        {renderRecipeList(
          userCreations, 
          true, 
          "No has creado recetas", 
          "¡Usa la pestaña 'Crea tu propia receta' para empezar!", 
          BookUser
        )}
      </TabsContent>
      <TabsContent value="plans" className="flex-grow mt-0">
        {renderPlanList(
          savedPlans,
          "No tienes planes guardados",
          "¡Genera y guarda tus planes de menú semanales!",
          CalendarClock
        )}
      </TabsContent>
    </Tabs>
  );
}
