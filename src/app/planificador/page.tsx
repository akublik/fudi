
"use client";

import { useState, useCallback, useEffect } from 'react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { PlannerForm } from '@/components/forms/PlannerForm';
import { PlannerView } from '@/components/planner/PlannerView';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { WeeklyMenuInput, WeeklyMenuOutput, ShoppingListItem, UserInfo, Recipe } from '@/lib/types';
import { generateWeeklyMenu } from '@/lib/actions';
import Link from 'next/link';
import { useUserInfo } from '@/hooks/use-user-info';
import { useShoppingList } from '@/hooks/use-shopping-list';
import { useFavorites } from '@/hooks/use-favorites';

export default function PlannerPage() {
  const [menuPlan, setMenuPlan] = useState<WeeklyMenuOutput | null>(null);
  const [shoppingListItems, setShoppingListItems] = useState<ShoppingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { userInfo, setUserInfo } = useUserInfo();
  const { addItems: addItemsToMainList } = useShoppingList();
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();


  useEffect(() => {
    if (menuPlan?.shoppingList) {
      const initialList: ShoppingListItem[] = menuPlan.shoppingList.map(item => ({
        id: crypto.randomUUID(),
        name: item.name,
        quantity: parseFloat(item.quantity) || 1,
        unit: item.quantity.replace(/[0-9.,]/g, '').trim(),
        checked: false,
      }));
      setShoppingListItems(initialList);
    }
  }, [menuPlan]);

  const handlePlannerSubmit = async (values: WeeklyMenuInput) => {
    setIsLoading(true);
    setMenuPlan(null);
    setShoppingListItems([]);
    try {
      const result = await generateWeeklyMenu(values);
      if (!result || result.plan.length === 0) {
        toast({ title: "Sin resultados", description: "No pudimos generar un plan con esas opciones. ¡Intenta de nuevo!", variant: "destructive" });
      }
      setMenuPlan(result);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Ocurrió un error al generar el planificador de menús.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddItem = useCallback((item: Omit<ShoppingListItem, 'id' | 'checked'>) => {
    const newItem: ShoppingListItem = {
      ...item,
      id: crypto.randomUUID(),
      checked: false,
    };
    setShoppingListItems(prev => [newItem, ...prev]);
  }, []);

  const handleRemoveItem = useCallback((itemId: string) => {
    setShoppingListItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const handleUpdateItem = useCallback((itemId: string, newValues: Partial<ShoppingListItem>) => {
    setShoppingListItems(prev =>
      prev.map(item => item.id === itemId ? { ...item, ...newValues } : item)
    );
  }, []);

  const handleToggleItem = useCallback((itemId: string) => {
    setShoppingListItems(prev =>
      prev.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item)
    );
  }, []);

  const handleClearList = useCallback(() => {
    setShoppingListItems([]);
  }, []);
  
  const handleSaveToMainList = () => {
    const ingredientsToAdd = shoppingListItems.map(({ id, checked, ...rest }) => rest);
    // @ts-ignore
    addItemsToMainList(ingredientsToAdd, `Plan Semanal - ${new Date().toLocaleDateString()}`);
    toast({
      title: '¡Lista Guardada!',
      description: 'El plan de compras semanal se ha añadido a tu lista principal.',
    });
  };

  const handleSaveFavorite = (recipe: Recipe) => {
    addFavorite(recipe);
    toast({
      title: '¡Guardada!',
      description: `"${recipe.name}" se ha añadido a tus favoritos.`,
    });
  };

  const handleRemoveFavorite = (recipeId: string) => {
    removeFavorite(recipeId);
    toast({
      title: 'Eliminada',
      description: 'La receta se ha eliminado de tus favoritos.',
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="container mx-auto px-4 py-8 flex-grow">
        <Button asChild variant="outline" className="mb-4">
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Inicio
            </Link>
        </Button>
        <Header />
        
        <div className="w-full max-w-4xl mx-auto mt-8 space-y-8">
            <PlannerForm onSubmit={handlePlannerSubmit} isLoading={isLoading} />
        </div>

        {isLoading && (
          <div className="text-center py-16">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-lg text-muted-foreground">Generando tu plan de menú personalizado...</p>
          </div>
        )}

        {menuPlan && !isLoading && (
            <div className="w-full max-w-6xl mx-auto mt-12">
                <PlannerView 
                  plan={menuPlan}
                  shoppingList={shoppingListItems}
                  userInfo={userInfo}
                  onAddItem={handleAddItem}
                  onRemoveItem={handleRemoveItem}
                  onUpdateItem={handleUpdateItem}
                  onToggleItem={handleToggleItem}
                  onClearList={handleClearList}
                  onSaveUserInfo={setUserInfo}
                  onSaveToMainList={handleSaveToMainList}
                  onSaveFavorite={handleSaveFavorite}
                  onRemoveFavorite={handleRemoveFavorite}
                  isFavorite={isFavorite}
                />
            </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
