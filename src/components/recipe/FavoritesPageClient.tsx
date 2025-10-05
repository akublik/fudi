"use client";

import { useState } from 'react';
import { useFavorites } from '@/hooks/use-favorites';
import { useShoppingList } from '@/hooks/use-shopping-list';
import { useUserInfo } from '@/hooks/use-user-info';
import { FavoritesList } from '@/components/recipe/FavoritesList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlannerView } from '@/components/planner/PlannerView';
import type { WeeklyMenuOutput } from '@/lib/types';


export function FavoritesPageClient() {
  const { 
    favorites, 
    userCreations, 
    savedPlans, 
    removeFavorite,
    removeSavedPlan,
    addFavorite,
    addSavedPlan,
    isFavorite,
    isPlanSaved,
  } = useFavorites();

  const { userInfo, setUserInfo } = useUserInfo();
  const { addItem, addItems } = useShoppingList();
  const { toast } = useToast();
  const [viewingPlan, setViewingPlan] = useState<WeeklyMenuOutput | null>(null);


  const handleRemove = (recipeId: string) => {
    removeFavorite(recipeId);
    toast({
      title: 'Eliminada',
      description: 'La receta se ha eliminado.',
    });
  };
  
  const handleRemovePlan = (planId: string) => {
    removeSavedPlan(planId);
    toast({
      title: 'Plan Eliminado',
      description: 'El plan de menú se ha eliminado de tus guardados.',
    });
  };

  const handleViewPlan = (plan: WeeklyMenuOutput) => {
    setViewingPlan(plan);
  };
  
  const handleClosePlanView = () => {
    setViewingPlan(null);
  }

  return (
    <>
        <Button asChild variant="outline" className="mb-4">
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Inicio
            </Link>
        </Button>

        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-4xl">Mis Recetas y Planes</CardTitle>
                <CardDescription className="text-lg">Aquí encontrarás todas tus recetas favoritas, tus creaciones y los planes de menú que has guardado.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[calc(100vh-300px)]">
                    <FavoritesList
                        favorites={favorites}
                        userCreations={userCreations}
                        savedPlans={savedPlans}
                        onRemove={handleRemove}
                        onRemovePlan={handleRemovePlan}
                        onViewPlan={handleViewPlan}
                        defaultTab="creations"
                    />
                </div>
            </CardContent>
        </Card>

        {/* Saved Plan Viewer Dialog */}
        <Dialog open={!!viewingPlan} onOpenChange={(isOpen) => !isOpen && handleClosePlanView()}>
            <DialogContent className="max-w-6xl w-full p-0 flex flex-col h-[90vh]">
                <DialogHeader className="p-4 border-b">
                <DialogTitle>Viendo Plan Guardado</DialogTitle>
                </DialogHeader>
                <ScrollArea className="flex-grow">
                {viewingPlan && (
                    <PlannerView
                    plan={viewingPlan}
                    shoppingList={viewingPlan.shoppingList.map(item => ({
                        id: crypto.randomUUID(),
                        name: item.name,
                        quantity: parseFloat(item.quantity) || 1,
                        unit: item.quantity.replace(/[0-9.,]/g, '').trim(),
                        checked: false,
                    }))}
                    userInfo={userInfo}
                    onSaveUserInfo={setUserInfo}
                    onSavePlan={() => addSavedPlan(viewingPlan)}
                    onRemovePlan={() => removeSavedPlan(viewingPlan.id!)}
                    isPlanSaved={isPlanSaved(viewingPlan.id!)}
                    onSaveFavorite={addFavorite}
                    onRemoveFavorite={removeFavorite}
                    isFavorite={isFavorite}
                    onAddItem={(item) => addItem({...item, recipeName: 'Plan Semanal'})}
                    onRemoveItem={() => {}}
                    onUpdateItem={() => {}}
                    onToggleItem={() => {}}
                    onClearList={() => {}}
                    onSaveToMainList={() => {
                        const ingredientsToAdd = viewingPlan.shoppingList.map(({ ...rest }) => ({...rest, unit: rest.quantity.replace(/[0-9.,]/g, '').trim(), quantity: parseFloat(rest.quantity) || 1}));
                        // @ts-ignore
                        addItems(ingredientsToAdd, `Plan Semanal - ${new Date().toLocaleDateString()}`);
                        toast({
                        title: '¡Lista Guardada!',
                        description: 'La lista de compras se ha añadido a tu lista principal.',
                        });
                    }}
                    />
                )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    </>
  );
}
