'use server';

import {
  ingredientBasedRecipeSuggestion,
  type IngredientBasedRecipeSuggestionInput,
  type IngredientBasedRecipeSuggestionOutput,
} from '@/ai/flows/ingredient-based-recipe-suggestion';
import {
  suggestComplementaryDishes,
  type ComplementaryDishSuggestionInput,
  type ComplementaryDishSuggestionOutput,
} from '@/ai/flows/complementary-dish-suggestion';
import type { Recipe } from '@/lib/types';

export async function getRecipesForIngredients(
  ingredients: string,
  style: 'Sencillo' | 'Gourmet',
  cuisine?: string,
): Promise<Recipe[]> {
  try {
    const input: IngredientBasedRecipeSuggestionInput = { ingredients, style, cuisine };
    const result: IngredientBasedRecipeSuggestionOutput =
      await ingredientBasedRecipeSuggestion(input);
    
    return result.recipes.map((recipe) => ({
      id: crypto.randomUUID(),
      name: recipe.name,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      servings: recipe.servings,
      imageUrl: recipe.imageUrl,
    }));
  } catch (error) {
    console.error('Error getting recipe suggestions:', error);
    return [];
  }
}

export async function getComplementaryDishes(
  mainDish: string,
  style: 'Sencillo' | 'Gourmet',
  cuisine?: string,
): Promise<Recipe[]> {
  try {
    const input: ComplementaryDishSuggestionInput = { mainDish, style, cuisine };
    const result: ComplementaryDishSuggestionOutput =
      await suggestComplementaryDishes(input);

    return result.suggestions.map((dish) => ({
      id: crypto.randomUUID(),
      name: dish.dishName,
      ingredients: dish.ingredients,
      instructions: dish.instructions,
      servings: dish.servings,
      imageUrl: dish.imageUrl,
    }));
  } catch (error) {
    console.error('Error getting complementary dishes:', error);
    return [];
  }
}
