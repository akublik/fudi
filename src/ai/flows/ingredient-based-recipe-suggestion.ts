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
  style: z.enum(['Sencillo', 'Gourmet']).describe('The desired cooking style.'),
});
export type IngredientBasedRecipeSuggestionInput = z.infer<typeof IngredientBasedRecipeSuggestionInputSchema>;

const IngredientSchema = z.object({
  name: z.string().describe('The name of the ingredient.'),
  quantity: z.number().describe('The quantity of the ingredient.'),
  unit: z
    .string()
    .optional()
    .describe('The unit of measurement for the quantity (e.g., gramos, ml, cucharadita).'),
});

const RecipeSchema = z.object({
  name: z.string().describe('The name of the recipe.'),
  ingredients: z.array(IngredientSchema).describe('An array of ingredients with quantities and units required for the recipe.'),
  instructions: z.string().describe('Step-by-step instructions for preparing the recipe.'),
  servings: z.number().describe('The number of servings the recipe is originally for.'),
});

const IngredientBasedRecipeSuggestionOutputSchema = z.object({
  recipes: z.array(RecipeSchema.extend({
    imageUrl: z.string().describe('An image of the dish, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'),
  })).describe('An array of recipe suggestions based on the provided ingredients.'),
});
export type IngredientBasedRecipeSuggestionOutput = z.infer<typeof IngredientBasedRecipeSuggestionOutputSchema>;


export async function ingredientBasedRecipeSuggestion(input: IngredientBasedRecipeSuggestionInput): Promise<IngredientBasedRecipeSuggestionOutput> {
  return ingredientBasedRecipeSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'ingredientBasedRecipeSuggestionPrompt',
  input: {schema: IngredientBasedRecipeSuggestionInputSchema.extend({ isGourmet: z.boolean() })},
  output: {schema: z.object({ recipes: z.array(RecipeSchema) }) },
  prompt: `You are an expert recipe suggester. Given the following ingredients, suggest six recipes that can be made with them. For each recipe, provide the recipe name, a list of ingredients with their quantities and units, the number of servings, and step-by-step instructions. All text and units of measurement must be in Spanish (e.g., use "cucharadita" instead of "tsp", "gramos" instead of "grams").

The style of the recipes should be: {{{style}}}.
{{#if isGourmet}}
Please provide sophisticated and elegant recipes, with refined techniques, high-quality ingredients, and a beautiful presentation.
{{else}}
Please provide simple, practical, and delicious recipes, ideal for everyday cooking.
{{/if}}

Ingredients: {{{ingredients}}}
`,
});

const imageGenerationPrompt = ai.definePrompt({
  name: 'recipeImageGenerationPrompt',
  input: { schema: z.object({
    name: z.string(),
    ingredients: z.array(z.string()),
  }) },
  prompt: `Generate a photorealistic, professionally-shot image of the following recipe: {{{name}}}. Key ingredients include: {{#each ingredients}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}. The image should be beautifully lit and appetizing.`,
  config: {
    responseModalities: ['TEXT', 'IMAGE'],
  },
  model: 'googleai/gemini-2.0-flash-preview-image-generation'
});

const ingredientBasedRecipeSuggestionFlow = ai.defineFlow(
  {
    name: 'ingredientBasedRecipeSuggestionFlow',
    inputSchema: IngredientBasedRecipeSuggestionInputSchema,
    outputSchema: IngredientBasedRecipeSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt({
        ...input,
        isGourmet: input.style === 'Gourmet',
    });
    if (!output || !output.recipes || output.recipes.length === 0) {
      throw new Error('No recipes generated');
    }

    const recipesWithImages = await Promise.all(
      output.recipes.map(async (recipe) => {
        const {media} = await imageGenerationPrompt({ name: recipe.name, ingredients: recipe.ingredients.map(i => i.name) });
        return {
          ...recipe,
          imageUrl: media!.url,
        };
      })
    );
    
    return { recipes: recipesWithImages };
  }
);