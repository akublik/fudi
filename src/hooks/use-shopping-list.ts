"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Ingredient, ShoppingListItem } from '@/lib/types';

const SHOPPING_LIST_KEY = 'daily-chef-shopping-list';

export function useShoppingList() {
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(SHOPPING_LIST_KEY);
      if (item) {
        setShoppingList(JSON.parse(item));
      }
    } catch (error) {
      console.error("Failed to load shopping list from localStorage", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        window.localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(shoppingList));
      } catch (error) {
        console.error("Failed to save shopping list to localStorage", error);
      }
    }
  }, [shoppingList, isLoaded]);

  const addItems = useCallback((ingredients: Ingredient[], recipeName: string) => {
    const newItems: ShoppingListItem[] = ingredients.map(ingredient => ({
      ...ingredient,
      id: crypto.randomUUID(),
      recipeName,
      checked: false,
    }));

    setShoppingList(prev => [...prev, ...newItems]);
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const updateItem = useCallback((itemId: string, newValues: Partial<ShoppingListItem>) => {
    setShoppingList(prev => 
      prev.map(item => item.id === itemId ? { ...item, ...newValues } : item)
    );
  }, []);

  const toggleItem = useCallback((itemId: string) => {
    setShoppingList(prev => 
      prev.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item)
    );
  }, []);

  const clearList = useCallback(() => {
    setShoppingList([]);
  }, []);

  return { shoppingList, addItems, removeItem, updateItem, toggleItem, clearList, isLoaded };
}
