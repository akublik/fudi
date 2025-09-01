
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Recipe } from '@/lib/types';

const FAVORITES_KEY = 'daily-chef-favorites';
const PLACEHOLDER_IMAGE_URL = "https://i.imgur.com/CVBXQ8W.jpeg";

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
        alert("No se pudieron guardar los favoritos. Es posible que el almacenamiento esté lleno.");
      }
    }
  }, [internalFavorites, isLoaded]);

  const addFavorite = useCallback((recipe: Recipe) => {
    setInternalFavorites((prev) => {
      if (prev.some(fav => fav.id === recipe.id)) {
        return prev;
      }
      
      const recipeToSave = { ...recipe };
      // For user-created recipes, we save the full data URI.
      // For others, to avoid storing large base64 images in localStorage,
      // we replace the image url with a placeholder.
      if (!recipeToSave.author && recipeToSave.imageUrl?.startsWith('data:image')) {
        recipeToSave.imageUrl = PLACEHOLDER_IMAGE_URL;
      }

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
