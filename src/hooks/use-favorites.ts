
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Recipe } from '@/lib/types';

const FAVORITES_KEY = 'daily-chef-favorites';

// Helper function to compress image
const compressImage = (dataUrl: string, maxWidth = 600, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!dataUrl.startsWith('data:image')) {
            // Not a data URL, no need to compress
            resolve(dataUrl);
            return;
        }

        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = maxWidth / img.width;
            canvas.width = maxWidth;
            canvas.height = img.height * scale;
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
  const [internalFavorites, setInternalFavorites] = useState<Recipe[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(FAVORITES_KEY);
      if (item) {
        setInternalFavorites(JSON.parse(item));
      }
    } catch (error) {
      console.error("Failed to load favorites from localStorage", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(internalFavorites));
      } catch (error) {
        // This is where the quota exceeded error happens.
        // With compression, this should be much rarer.
        // We could add more robust error handling here, like notifying the user.
        console.error("Failed to save favorites to localStorage", error);
      }
    }
  }, [internalFavorites, isLoaded]);

  const addFavorite = useCallback((recipe: Recipe, isUserCreation: boolean = false) => {
    const addRecipe = async (recipeToAdd: Recipe) => {
        let compressedRecipe = { ...recipeToAdd };
        if (recipeToAdd.imageUrl && recipeToAdd.imageUrl.startsWith('data:image')) {
            try {
                const compressedUrl = await compressImage(recipeToAdd.imageUrl);
                compressedRecipe.imageUrl = compressedUrl;
            } catch (error) {
                console.error("Failed to compress image, saving original.", error);
                // Fallback to saving original if compression fails
            }
        }
        
        setInternalFavorites((prev) => {
            if (prev.some(fav => fav.id === compressedRecipe.id)) {
                return prev;
            }
            return [...prev, compressedRecipe];
        });
    }

    addRecipe(recipe);
  }, []);

  const removeFavorite = useCallback((recipeId: string) => {
    setInternalFavorites((prev) => prev.filter((recipe) => recipe.id !== recipeId));
  }, []);
  
  const isFavorite = useCallback((recipeId: string) => {
    return internalFavorites.some(fav => fav.id === recipeId);
  }, [internalFavorites]);

  const userCreations = useMemo(() => {
    return internalFavorites.filter(fav => !!fav.author);
  }, [internalFavorites]);

  const favorites = useMemo(() => {
    return internalFavorites.filter(fav => !fav.author);
  }, [internalFavorites]);

  return { favorites, userCreations, addFavorite, removeFavorite, isFavorite, isLoaded };
}
