'use server';

/**
 * @fileOverview A flow that parses a block of text (e.g., from social media) 
 * into a structured recipe and generates an image for it.
 *
 * - importRecipeFromText - The main function that orchestrates the recipe import.
 * - RecipeImportInput - The input type for the function.
 * - RecipeImportOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecipeImportInputSchema = z.object({
  text: z.string().describe('The unstructured block of text containing the recipe, likely copied from a social media post or blog.'),
});
export type RecipeImportInput = z.infer<typeof RecipeImportInputSchema>;

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
    name: z.string().describe('The name of the recipe, extracted from the text.'),
    author: z.string().optional().describe("The author or source of the recipe if mentioned (e.g., @cheffulano)."),
    ingredients: z.array(IngredientSchema).describe('The ingredients with precise quantities for cooking.'),
    shoppingIngredients: z.array(IngredientSchema).describe('The ingredients as a shopping list (e.g., "1 onion" instead of "0.5 onion").'),
    instructions: z.string().describe('Step-by-step instructions for preparing the recipe, rewritten to be clear and structured.'),
    servings: z.number().describe('The number of servings the recipe is for, estimated from the text.'),
    preparationTime: z.number().describe('The estimated preparation time in minutes.'),
    difficulty: z.enum(['Fácil', 'Medio', 'Difícil']).describe('The difficulty of the recipe (Easy, Medium, Hard).'),
    nutritionalInfo: NutritionalInfoSchema.describe('Estimated nutritional information per serving.'),
});

const RecipeImportOutputSchema = RecipeSchema.extend({
  imageUrl: z.string().describe('An image of the dish, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'),
});
export type RecipeImportOutput = z.infer<typeof RecipeImportOutputSchema>;


export async function importRecipeFromText(
  input: RecipeImportInput
): Promise<RecipeImportOutput> {
  return importRecipeFromTextFlow(input);
}


const recipeParsingPrompt = ai.definePrompt({
  name: 'recipeParsingPrompt',
  input: {schema: RecipeImportInputSchema},
  output: {schema: RecipeSchema},
  prompt: `You are Fudi Chef, an expert in interpreting and structuring recipes. A user has pasted a block of text from a social media post or website. 
Your task is to parse this unstructured text and convert it into a complete, well-formatted recipe.

**Instructions:**
1.  **Analyze the Text:** Carefully read the entire text provided by the user.
2.  **Extract Key Information:**
    *   **Name:** Identify the most likely name of the recipe.
    *   **Author/Source:** If a username (like @chefxyz) or a source is mentioned, extract it for the 'author' field. If not, omit the field.
    *   **Ingredients:** Find the list of ingredients and their quantities. Standardize them.
    *   **Instructions:** Identify the preparation steps. Rewrite them clearly and number them if necessary.
3.  **Generate Structured Output:**
    *   **'name'**: The recipe name.
    *   **'author'**: The optional author/source.
    *   **'ingredients'**: A structured list of ingredients with precise quantities.
    *   **'shoppingIngredients'**: An optimized shopping list (e.g., "1 cebolla" instead of "media cebolla").
    *   **'instructions'**: The clear, step-by-step instructions.
    *   **'servings'**: Estimate the number of servings.
    *   **'preparationTime'**: Estimate the total preparation and cooking time in minutes.
    *   **'difficulty'**: Rate the difficulty as 'Fácil', 'Medio', or 'Difícil'.
    *   **'nutritionalInfo'**: Estimate the nutritional information per serving.

All text, units, and output must be in Spanish.

**Unstructured text from user:**
{{{text}}}
`,
});

const imageGenerationPrompt = ai.definePrompt({
  name: 'importedRecipeImageGenerationPrompt',
  input: { schema: z.object({
    name: z.string(),
    ingredientsText: z.string(),
  }) },
  prompt: `Generate a photorealistic, professionally-shot image of the following recipe: {{{name}}}.
The general ingredients mentioned are: {{{ingredientsText}}}.
The image should look delicious, appetizing, and like it belongs in a high-end cooking magazine.`,
  config: {
    responseModalities: ['TEXT', 'IMAGE'],
  },
  model: 'googleai/gemini-2.0-flash-preview-image-generation'
});


const importRecipeFromTextFlow = ai.defineFlow(
  {
    name: 'importRecipeFromTextFlow',
    inputSchema: RecipeImportInputSchema,
    outputSchema: RecipeImportOutputSchema,
  },
  async input => {
    // Generate the recipe text first
    const {output: recipeDetails} = await recipeParsingPrompt(input);
    if (!recipeDetails) {
      throw new Error('Failed to parse recipe details from text.');
    }

    // Generate the image in parallel
    const {media} = await imageGenerationPrompt({ 
        name: recipeDetails.name, 
        ingredientsText: recipeDetails.ingredients.map(i => i.name).join(', '),
    });
    if (!media || !media.url) {
        throw new Error('Failed to generate recipe image for imported recipe.');
    }
    
    return {
      ...recipeDetails,
      imageUrl: media.url,
    };
  }
);
