
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
import {
  createUserRecipe as createUserRecipeFlow,
  type UserRecipeInput,
  type UserRecipeOutput,
} from '@/ai/flows/create-user-recipe';
import {
  kitchenTipsChat,
  type KitchenTipInput,
  type KitchenTipOutput,
} from '@/ai/flows/kitchen-tips-chat';
import {
  generateWeeklyMenu as generateWeeklyMenuFlow,
  type WeeklyMenuInput,
  type WeeklyMenuOutput,
} from '@/ai/flows/weekly-menu-planner';
import {
  createShoppingCart as createShoppingCartFlow,
  type ShoppingCartInput,
  type ShoppingCartOutput,
} from '@/ai/flows/create-shopping-cart';
import {
  calculateNutritionalGoals as calculateNutritionalGoalsFlow,
  type NutritionalGoalsInput,
  type NutritionalGoalsOutput,
} from '@/ai/flows/calculate-nutritional-goals';
import { sendNotificationFlow } from '@/ai/flows/send-notification-flow';
import { subscribeToTopicFlow } from '@/ai/flows/subscribe-to-topic-flow';
import { getRegisteredUsersFlow, type RegisteredUser } from '@/ai/flows/get-registered-users';
import { findNearbyStoresFlow } from '@/ai/flows/find-nearby-stores';
import { getSupermarketsFlow, addSupermarketFlow, deleteSupermarketFlow } from '@/ai/flows/manage-supermarkets';
import { sendContactMessageFlow } from '@/ai/flows/send-contact-message';
import type { SendNotificationInput, SendNotificationOutput, SubscribeToTopicOutput } from '@/lib/schemas';
import type { Recipe, FindNearbyStoresOutput, Supermarket, AddSupermarketInput, ContactMessage } from '@/lib/types';


export async function getRecipesForIngredients(
  ingredients: string,
  style: 'Sencillo' | 'Gourmet' | 'Fryer' | 'Parrillada',
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
      shoppingIngredients: recipe.shoppingIngredients,
      instructions: recipe.instructions,
      servings: recipe.servings,
      imageUrl: recipe.imageUrl,
      nutritionalInfo: recipe.nutritionalInfo,
    }));
  } catch (error) {
    console.error('Error getting recipe suggestions:', error);
    return [];
  }
}

export async function getComplementaryDishes(
  mainDish: string,
  style: 'Sencillo' | 'Gourmet' | 'Fryer' | 'Parrillada',
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
      shoppingIngredients: dish.shoppingIngredients,
      instructions: dish.instructions,
      servings: dish.servings,
      imageUrl: dish.imageUrl,
      nutritionalInfo: dish.nutritionalInfo,
    }));
  } catch (error) {
    console.error('Error getting complementary dishes:', error);
    return [];
  }
}

export async function createUserRecipe(
  userInput: UserRecipeInput
): Promise<Recipe | null> {
  try {
    const result: UserRecipeOutput = await createUserRecipeFlow(userInput);
    
    return {
      id: crypto.randomUUID(),
      name: result.name,
      ingredients: result.ingredients,
      shoppingIngredients: result.shoppingIngredients,
      instructions: result.instructions,
      servings: result.servings,
      imageUrl: result.imageUrl,
      nutritionalInfo: result.nutritionalInfo,
      author: result.author,
    };
  } catch (error) {
    console.error('Error creating user recipe:', error);
    return null;
  }
}


export async function getKitchenTip(question: string): Promise<string> {
  try {
    const input: KitchenTipInput = { question };
    const result: KitchenTipOutput = await kitchenTipsChat(input);
    return result.answer;
  } catch (error) {
    console.error('Error getting kitchen tip:', error);
    return 'Lo siento, ha ocurrido un error y no puedo responder a tu pregunta en este momento. Por favor, inténtalo de nuevo más tarde.';
  }
}

export async function generateWeeklyMenu(
  userInput: WeeklyMenuInput
): Promise<WeeklyMenuOutput | null> {
  try {
    const result: WeeklyMenuOutput = await generateWeeklyMenuFlow(userInput);
    const planId = crypto.randomUUID();
    // Add IDs to meals for favorite functionality
    const planWithIds = result.plan.map(day => ({
        ...day,
        breakfast: day.breakfast ? { ...day.breakfast, id: crypto.randomUUID() } : undefined,
        lunch: day.lunch ? { ...day.lunch, id: crypto.randomUUID() } : undefined,
        dinner: day.dinner ? { ...day.dinner, id: crypto.randomUUID() } : undefined,
    }));
    return { ...result, id: planId, plan: planWithIds };
  } catch (error) {
    console.error('Error generating weekly menu:', error);
    return null;
  }
}

export async function createShoppingCart(
  input: ShoppingCartInput
): Promise<ShoppingCartOutput | null> {
    try {
        const result = await createShoppingCartFlow(input);
        return result;
    } catch (error) {
        console.error('Error creating shopping cart:', error);
        return null;
    }
}

export async function calculateNutritionalGoals(
  userInput: NutritionalGoalsInput
): Promise<NutritionalGoalsOutput> {
  try {
    const result = await calculateNutritionalGoalsFlow(userInput);
    return result;
  } catch (error) {
    console.error('Error calculating nutritional goals:', error);
    // Return a default/error structure or re-throw
    throw new Error('Failed to calculate nutritional goals.');
  }
}

export async function sendNotificationAction(
  userInput: SendNotificationInput
): Promise<SendNotificationOutput> {
  try {
    const result = await sendNotificationFlow(userInput);
    if (!result) {
      return { success: false, error: 'Ocurrió un error desconocido al enviar la notificación.' };
    }
    return result;
  } catch (error: any) {
    console.error('Error sending notification via action:', error);
    return { success: false, error: error.message || 'Error al enviar la notificación.' };
  }
}

export async function subscribeToTopicAction(
  token: string,
  topic: string
): Promise<SubscribeToTopicOutput> {
  try {
    const result = await subscribeToTopicFlow({ token, topic });
    return result;
  } catch (error: any) {
    console.error('Error subscribing to topic:', error);
    return { success: false, error: error.message || 'Failed to subscribe.' };
  }
}

export async function getRegisteredUsersAction(): Promise<RegisteredUser[]> {
  try {
    const users = await getRegisteredUsersFlow();
    return users;
  } catch (error) {
    console.error('Error getting registered users:', error);
    return [];
  }
}

export async function findNearbyStores(): Promise<FindNearbyStoresOutput> {
  try {
    // The flow now just returns all stores
    const result = await findNearbyStoresFlow();
    return result;
  } catch (error) {
    console.error('Error finding nearby stores:', error);
    return { stores: [] };
  }
}

// Supermarket Management Actions
export async function getSupermarketsAction(): Promise<Supermarket[]> {
    try {
        const supermarkets = await getSupermarketsFlow();
        return supermarkets;
    } catch (error) {
        console.error('Error getting supermarkets:', error);
        return [];
    }
}

export async function addSupermarketAction(input: AddSupermarketInput): Promise<Supermarket> {
    try {
        const newSupermarket = await addSupermarketFlow(input);
        return newSupermarket;
    } catch (error) {
        console.error('Error adding supermarket:', error);
        throw new Error('Failed to add supermarket via action.');
    }
}

export async function deleteSupermarketAction(id: string): Promise<{ success: boolean }> {
    try {
        const result = await deleteSupermarketFlow(id);
        return result;
    } catch (error) {
        console.error('Error deleting supermarket:', error);
        throw new Error('Failed to delete supermarket via action.');
    }
}

export async function sendContactMessage(input: ContactMessage): Promise<{success: boolean}> {
    try {
        await sendContactMessageFlow(input);
        return { success: true };
    } catch(e) {
        console.error("Error sending contact message", e);
        return { success: false };
    }
}
