
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Recipe, WeeklyMenuOutput } from '@/lib/types';

const SAVED_ITEMS_KEY = 'daily-chef-saved-items';

interface SavedItems {
  recipes: Recipe[];
  plans: WeeklyMenuOutput[];
}

// Helper function to compress image
export const compressImage = (dataUrl: string, maxWidth = 600, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!dataUrl || !dataUrl.startsWith('data:image')) {
            // Not a data URL, no need to compress, or it's empty
            resolve(dataUrl);
            return;
        }

        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;

            if (width > maxWidth) {
              const scale = maxWidth / width;
              width = maxWidth;
              height *= scale;
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
                return reject(new Error('Failed to get canvas context'));
            }

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = (error) => reject(error);
    });
};


export function useFavorites() {
  const [savedItems, setSavedItems] = useState<SavedItems>({ recipes: [], plans: [] });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(SAVED_ITEMS_KEY);
      if (item) {
        const parsedItems = JSON.parse(item);
        // Basic validation to ensure structure is correct
        if (parsedItems.recipes && parsedItems.plans) {
          setSavedItems(parsedItems);
        }
      }
    } catch (error) {
      console.error("Failed to load saved items from localStorage", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        window.localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(savedItems));
      } catch (error) {
        console.error("Failed to save items to localStorage", error);
        // If quota is exceeded, we might want to clear old items or notify user.
        // For now, we just log it.
      }
    }
  }, [savedItems, isLoaded]);

  const addFavorite = useCallback((recipe: Recipe, isUserCreation: boolean = false) => {
    const addRecipe = async (recipeToAdd: Recipe) => {
        let compressedRecipe = { ...recipeToAdd };
        if (recipeToAdd.imageUrl && recipeToAdd.imageUrl.startsWith('data:image')) {
            try {
                const compressedUrl = await compressImage(recipeToAdd.imageUrl);
                compressedRecipe.imageUrl = compressedUrl;
            } catch (error) {
                console.error("Failed to compress image, saving original.", error);
            }
        }
        
        setSavedItems((prev) => {
            if (prev.recipes.some(fav => fav.id === compressedRecipe.id)) {
                return prev;
            }
            return { ...prev, recipes: [...prev.recipes, compressedRecipe] };
        });
    }
    addRecipe(recipe);
  }, []);

  const removeFavorite = useCallback((recipeId: string) => {
    setSavedItems((prev) => ({
      ...prev,
      recipes: prev.recipes.filter((recipe) => recipe.id !== recipeId),
    }));
  }, []);
  
  const isFavorite = useCallback((recipeId: string) => {
    return savedItems.recipes.some(fav => fav.id === recipeId);
  }, [savedItems.recipes]);

  const userCreations = useMemo(() => {
    return savedItems.recipes.filter(fav => !!fav.author);
  }, [savedItems.recipes]);

  const favorites = useMemo(() => {
    return savedItems.recipes.filter(fav => !fav.author);
  }, [savedItems.recipes]);
  
  const addSavedPlan = useCallback((plan: WeeklyMenuOutput) => {
    setSavedItems((prev) => {
        if(prev.plans.some(p => p.id === plan.id)) return prev;
        return { ...prev, plans: [...prev.plans, plan] };
    });
  }, []);

  const removeSavedPlan = useCallback((planId: string) => {
    setSavedItems((prev) => ({
        ...prev,
        plans: prev.plans.filter((plan) => plan.id !== planId),
    }));
  }, []);

  const isPlanSaved = useCallback((planId: string) => {
    return savedItems.plans.some(plan => plan.id === planId);
  }, [savedItems.plans]);


  return { 
    favorites, 
    userCreations, 
    addFavorite, 
    removeFavorite, 
    isFavorite, 
    isLoaded,
    savedPlans: savedItems.plans,
    addSavedPlan,
    removeSavedPlan,
    isPlanSaved,
  };
}
