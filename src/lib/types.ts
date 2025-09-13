
import { z } from 'zod';

const AgeGroupEnum = z.enum(['Niños (3-10)', 'Adolescentes (11-17)', 'Adultos (18-59)', 'Adultos Mayores (60+)']);

const DinerSchema = z.object({
    ageGroup: AgeGroupEnum,
    people: z.number().min(1, "Debe haber al menos una persona."),
});

// Schema for Weekly Menu Planner
export const WeeklyMenuInputSchema = z.object({
    diners: z.array(DinerSchema).min(1, "Debes añadir al menos un grupo de comensales."),
    goal: z.enum(['Perder peso', 'Ganar músculo', 'Comer balanceado', 'Controlar diabetes']).describe('The nutritional goal for the meal plan.'),
    meals: z.array(z.string()).refine(value => value.some(item => item), {
        message: 'Debes seleccionar al menos un tipo de comida.',
    }),
    restrictions: z.string().optional().describe('A comma-separated list of allergies, conditions, or dietary restrictions (e.g., "sin gluten, alergia a las nueces, vegetariano").'),
    days: z.number().min(1).max(7).describe('The number of days for the meal plan (1 to 7).'),
    cuisine: z.string().optional().describe('The desired cuisine type (e.g., Italian, Mexican).'),
});

const IngredientSchema = z.object({
  name: z.string().describe('The name of the ingredient.'),
  quantity: z.number().describe('The quantity of the ingredient.'),
  unit: z.string().optional().describe('The unit of measurement for the quantity (e.g., gramos, ml, cucharadita).'),
});

const ShoppingIngredientSchema = z.object({
  name: z.string().describe('The name of the ingredient.'),
  quantity: z.string().describe('The quantity and unit, formatted for a shopping list (e.g., "1 botella", "2 latas").'),
});


const NutritionalInfoSchema = z.object({
  calories: z.number().describe('Estimated calories for the meal.'),
  protein: z.number().describe('Estimated grams of protein for the meal.'),
  carbs: z.number().describe('Estimated grams of carbohydrates for the meal.'),
  fat: z.number().describe('Estimated grams of fat for the meal.'),
});

const MealSchema = z.object({
  id: z.string().describe('A unique ID for the meal.'),
  name: z.string().describe('The name of the meal.'),
  description: z.string().describe('A brief description of the meal and why it is suitable for the plan.'),
  ingredients: z.array(IngredientSchema).describe('List of ingredients with quantities.'),
  instructions: z.string().describe('Step-by-step preparation instructions.'),
  nutritionalInfo: NutritionalInfoSchema.describe('Estimated nutritional information per serving.'),
});

const DailyPlanSchema = z.object({
  day: z.string().describe('The day of the week (e.g., Lunes, Martes).'),
  breakfast: MealSchema.optional().describe('The breakfast meal for the day.'),
  lunch: MealSchema.optional().describe('The lunch meal for the day.'),
  dinner: MealSchema.optional().describe('The dinner meal for the day.'),
  totalCalories: z.number().describe('The total estimated calories for the day per person.'),
});

export const WeeklyMenuOutputSchema = z.object({
  id: z.string().optional(),
  plan: z.array(DailyPlanSchema).describe('The weekly meal plan, with one entry per day.'),
  shoppingList: z.array(ShoppingIngredientSchema).describe('A consolidated shopping list for the entire week.'),
  summary: z.string().describe('A general summary and recommendations for the generated meal plan.'),
});

const ShoppingCartItemSchema = z.object({
  name: z.string(),
  quantity: z.string(),
});

export const ShoppingCartInputSchema = z.object({
  items: z.array(ShoppingCartItemSchema),
  store: z.string().describe('The name of the supermarket.'),
  userId: z.string().optional().describe('An optional user ID for tracking.'),
});

export const ShoppingCartOutputSchema = z.object({
  checkoutUrl: z.string().url().describe('The URL to the pre-filled shopping cart for the user to complete the purchase.'),
  trackingId: z.string().describe('A unique ID to track the status of this shopping transaction.'),
});


export interface Ingredient {
  name: string;
  quantity: number;
  unit?: string;
}

export interface ShoppingIngredient {
    name: string;
    quantity: string;
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string;
  nutritionalInfo: NutritionalInfo;
}


export interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  shoppingIngredients: Ingredient[];
  instructions: string;
  servings: number;
  imageUrl?: string;
  nutritionalInfo?: NutritionalInfo;
  author?: string;
}

export interface ShoppingListItem extends Ingredient {
  id: string;
  recipeName?: string;
  checked: boolean;
  notes?: string;
}

export interface UserInfo {
  name: string;
  address: string;
  whatsapp: string;
}

export const UserPreferencesSchema = z.object({
  restrictions: z.array(z.string()),
  cuisines: z.array(z.string()),
  otherCuisines: z.string().optional(),
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

// Types for Weekly Menu Planner
export type WeeklyMenuInput = z.infer<typeof WeeklyMenuInputSchema>;
export type WeeklyMenuOutput = z.infer<typeof WeeklyMenuOutputSchema>;

// Types for Shopping Cart
export type ShoppingCartInput = z.infer<typeof ShoppingCartInputSchema>;
export type ShoppingCartOutput = z.infer<typeof ShoppingCartOutputSchema>;
