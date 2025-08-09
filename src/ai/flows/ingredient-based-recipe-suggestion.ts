'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting recipes based on user-provided ingredients.
 *
 * - ingredientBasedRecipeSuggestion - A function that takes a list of ingredients and returns recipe suggestions.
 * - IngredientBasedRecipeSuggestionInput - The input type for the ingredientBasedRecipeSuggestion function.
 * - IngredientBasedRecipeSuggestionOutput - The output type for the ingredientBasedRecipeSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IngredientBasedRecipeSuggestionInputSchema = z.object({
  ingredients: z
    .string()
    .describe('A comma-separated list of ingredients the user has available.'),
});
export type IngredientBasedRecipeSuggestionInput = z.infer<typeof IngredientBasedRecipeSuggestionInputSchema>;

const RecipeSchema = z.object({
  name: z.string().describe('The name of the recipe.'),
  ingredients: z.string().describe('A comma-separated list of ingredients required for the recipe.'),
  instructions: z.string().describe('Step-by-step instructions for preparing the recipe.'),
  imageUrl: z.string().describe('An image of the dish, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'),
});

const IngredientBasedRecipeSuggestionOutputSchema = z.object({
  recipes: z.array(RecipeSchema).describe('An array of recipe suggestions based on the provided ingredients.'),
});
export type IngredientBasedRecipeSuggestionOutput = z.infer<typeof IngredientBasedRecipeSuggestionOutputSchema>;


export async function ingredientBasedRecipeSuggestion(input: IngredientBasedRecipeSuggestionInput): Promise<IngredientBasedRecipeSuggestionOutput> {
  return ingredientBasedRecipeSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'ingredientBasedRecipeSuggestionPrompt',
  input: {schema: IngredientBasedRecipeSuggestionInputSchema},
  output: {schema: IngredientBasedRecipeSuggestionOutputSchema},
  prompt: `Eres un experto en sugerencias de recetas. Dados los siguientes ingredientes, sugiere tres recetas que se pueden hacer con ellos. Proporciona el nombre de la receta, una lista de ingredientes separados por comas, instrucciones paso a paso y una URL de imagen para la receta. Todo el texto debe estar en español.

Ingredientes: {{{ingredients}}}

Responde en formato JSON.
`,
});

const ingredientBasedRecipeSuggestionFlow = ai.defineFlow(
  {
    name: 'ingredientBasedRecipeSuggestionFlow',
    inputSchema: IngredientBasedRecipeSuggestionInputSchema,
    outputSchema: IngredientBasedRecipeSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
