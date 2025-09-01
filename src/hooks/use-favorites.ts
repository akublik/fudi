
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Recipe } from '@/lib/types';

const FAVORITES_KEY = 'daily-chef-favorites';
const PLACEHOLDER_IMAGE_URL = "https://i.imgur.com/CVBXQ8W.jpeg";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(FAVORITES_KEY);
      if (item) {
        setFavorites(JSON.parse(item));
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
        window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error("Failed to save favorites to localStorage", error);
        alert("No se pudieron guardar los favoritos. Es posible que el almacenamiento esté lleno.");
      }
    }
  }, [favorites, isLoaded]);

  const addFavorite = useCallback((recipe: Recipe) => {
    setFavorites((prev) => {
      if (prev.some(fav => fav.id === recipe.id)) {
        return prev;
      }
      
      const recipeToSave = { ...recipe };
      // To avoid storing large base64 images in localStorage,
      // we replace the image url with a placeholder.
      if (recipeToSave.imageUrl?.startsWith('data:image')) {
        recipeToSave.imageUrl = PLACEHOLDER_IMAGE_URL;
      }

      return [...prev, recipeToSave];
    });
  }, []);

  const removeFavorite = useCallback((recipeId: string) => {
    setFavorites((prev) => prev.filter((recipe) => recipe.id !== recipeId));
  }, []);
  
  const isFavorite = useCallback((recipeId: string) => {
    return favorites.some(fav => fav.id === recipeId);
  }, [favorites]);

  const userCreations = useMemo(() => {
    return favorites.filter(fav => !!fav.author);
  }, [favorites]);

  return { favorites, addFavorite, removeFavorite, isFavorite, userCreations, isLoaded };
}
