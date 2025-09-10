
import { z } from 'zod';

// Schema for Weekly Menu Planner
export const WeeklyMenuInputSchema = z.object({
    ageGroup: z.enum(['Niños (3-10)', 'Adolescentes (11-17)', 'Adultos (18-59)', 'Adultos Mayores (60+)']).describe('The age group for the meal plan.'),
    goal: z.enum(['Perder peso', 'Ganar músculo', 'Comer balanceado', 'Controlar diabetes']).describe('The nutritional goal for the meal plan.'),
    restrictions: z.string().optional().describe('A comma-separated list of allergies, conditions, or dietary restrictions (e.g., "sin gluten, alergia a las nueces, vegetariano").'),
    days: z.number().min(1).max(7).describe('The number of days for the meal plan (1 to 7).'),
});

const MealSchema = z.object({
  name: z.string().describe('The name of the meal.'),
  description: z.string().describe('A brief description of the meal and why it is suitable for the plan.'),
  calories: z.number().describe('Estimated calories for the meal.'),
  protein: z.number().describe('Estimated grams of protein for the meal.'),
  carbs: z.number().describe('Estimated grams of carbohydrates for the meal.'),
  fat: z.number().describe('Estimated grams of fat for the meal.'),
});

const DailyPlanSchema = z.object({
  day: z.string().describe('The day of the week (e.g., Lunes, Martes).'),
  breakfast: MealSchema.describe('The breakfast meal for the day.'),
  lunch: MealSchema.describe('The lunch meal for the day.'),
  dinner: MealSchema.describe('The dinner meal for the day.'),
  totalCalories: z.number().describe('The total estimated calories for the day.'),
});

export const WeeklyMenuOutputSchema = z.object({
  plan: z.array(DailyPlanSchema).describe('The weekly meal plan, with one entry per day.'),
  summary: z.string().describe('A general summary and recommendations for the generated meal plan.'),
});


export interface Ingredient {
  name: string;
  quantity: number;
  unit?: string;
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
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

// Types for Weekly Menu Planner
export type WeeklyMenuInput = z.infer<typeof WeeklyMenuInputSchema>;
export type WeeklyMenuOutput = z.infer<typeof WeeklyMenuOutputSchema>;
