
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Recipe } from '@/lib/types';

const FAVORITES_KEY = 'daily-chef-favorites';

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
        console.error("Failed to save favorites to localStorage", error);
      }
    }
  }, [internalFavorites, isLoaded]);

  const addFavorite = useCallback((recipe: Recipe, isUserCreation: boolean = false) => {
    setInternalFavorites((prev) => {
      if (prev.some(fav => fav.id === recipe.id)) {
        return prev;
      }
      
      const recipeToSave: Recipe = {
        ...recipe,
        author: isUserCreation ? recipe.author : undefined, // Ensure author is only for user creations
        // The imageUrl is kept as is
      };
      
      // If it's a user creation, we just add it.
      // If it's a regular favorite, we do the same, keeping the original image.
      return [...prev, recipeToSave];
    });
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
