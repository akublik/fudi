
'use server';

/**
 * @fileOverview A flow that takes a user's recipe idea (name, author, ingredients) 
 * and generates a complete, professional-looking recipe with an image.
 *
 * - createUserRecipe - The main function that orchestrates the recipe creation.
 * - UserRecipeInput - The input type for the createUserRecipe function.
 * - UserRecipeOutput - The return type for the createUserRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UserRecipeInputSchema = z.object({
  recipeName: z.string().describe('The name of the recipe provided by the user.'),
  authorName: z.string().optional().describe('The name of the user creating the recipe. This is optional.'),
  ingredients: z.string().describe('A string containing the list of ingredients provided by the user.'),
});
export type UserRecipeInput = z.infer<typeof UserRecipeInputSchema>;

const IngredientSchema = z.object({
  name: z.string().describe('The name of the ingredient.'),
  quantity: z.number().describe('The quantity of the ingredient.'),
  unit: z.string().optional().describe('The unit of measurement for the quantity (e.g., gramos, ml, cucharadita).'),
});

const NutritionalInfoSchema = z.object({
  calories: z.number().describe('Estimated calories per serving.'),
  protein: z.number().describe('Estimated grams of protein per serving.'),
  carbs: z.number().describe('Estimated grams of carbohydrates per serving.'),
  fat: z.number().describe('Estimated grams of fat per serving.'),
});

const RecipeSchema = z.object({
    name: z.string().describe('The final name of the recipe, which should be the same as the user provided.'),
    author: z.string().optional().describe("The author of the recipe. Use the user's provided name. If they didn't provide one, omit this field."),
    ingredients: z.array(IngredientSchema).describe('The ingredients with precise quantities for cooking.'),
    shoppingIngredients: z.array(IngredientSchema).describe('The ingredients as a shopping list (e.g., "1 onion" instead of "0.5 onion").'),
    instructions: z.string().describe('Step-by-step instructions for preparing the recipe.'),
    servings: z.number().describe('The number of servings the recipe is originally for.'),
    nutritionalInfo: NutritionalInfoSchema.describe('Estimated nutritional information per serving.'),
});

const UserRecipeOutputSchema = RecipeSchema.extend({
  imageUrl: z.string().describe('An image of the dish, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'),
});
export type UserRecipeOutput = z.infer<typeof UserRecipeOutputSchema>;

export async function createUserRecipe(
  input: UserRecipeInput
): Promise<UserRecipeOutput> {
  return createUserRecipeFlow(input);
}

const recipeGenerationPrompt = ai.definePrompt({
  name: 'userRecipeGenerationPrompt',
  input: {schema: UserRecipeInputSchema},
  output: {schema: RecipeSchema},
  prompt: `You are Fudi Chef, an expert in creating amazing recipes. A user wants to create their own recipe.
Based on the name, author (if provided), and ingredients, generate a complete recipe.

Your task is to:
1.  Keep the 'name' exactly as the user provided it in 'recipeName'.
2.  If 'authorName' is provided, use it for the 'author' field. Otherwise, omit the author field.
3.  Analyze the 'ingredients' string and create a structured list for the 'ingredients' and 'shoppingIngredients' fields.
    - 'ingredients': Use precise quantities for cooking (e.g., "media cebolla").
    - 'shoppingIngredients': Optimize for a shopping list (e.g., "1 cebolla").
4.  Write clear, step-by-step 'instructions' in a friendly but expert tone.
5.  Determine a reasonable number of 'servings'.
6.  Estimate the 'nutritionalInfo' per serving.

All text and units of measurement must be in Spanish.

Recipe Name: {{{recipeName}}}
{{#if authorName}}
Author: {{{authorName}}}
{{/if}}
Ingredients provided by the user: {{{ingredients}}}
`,
});

const imageGenerationPrompt = ai.definePrompt({
  name: 'userRecipeImageGenerationPrompt',
  input: { schema: z.object({
    name: z.string(),
    author: z.string().optional(),
    ingredients: z.string(),
  }) },
  prompt: `Generate a photorealistic, professionally-shot image of the following recipe: {{{name}}}.
{{#if author}}
This is a special recipe by '{{{author}}}'. Try to capture a personal, home-cooked feel while still looking delicious and professional.
{{/if}}
Key ingredients include: {{{ingredients}}}.
The image should be beautifully lit, appetizing, and look like it belongs in a high-end cooking magazine.`,
  config: {
    responseModalities: ['TEXT', 'IMAGE'],
  },
  model: 'googleai/gemini-2.0-flash-preview-image-generation'
});

const createUserRecipeFlow = ai.defineFlow(
  {
    name: 'createUserRecipeFlow',
    inputSchema: UserRecipeInputSchema,
    outputSchema: UserRecipeOutputSchema,
  },
  async input => {
    // Generate the recipe text first
    const {output: recipeDetails} = await recipeGenerationPrompt(input);
    if (!recipeDetails) {
      throw new Error('Failed to generate recipe details.');
    }

    // Generate the image in parallel
    const {media} = await imageGenerationPrompt({ 
        name: recipeDetails.name, 
        author: recipeDetails.author,
        ingredients: input.ingredients,
    });
    if (!media || !media.url) {
        throw new Error('Failed to generate recipe image.');
    }
    
    return {
      ...recipeDetails,
      imageUrl: media.url,
    };
  }
);

    