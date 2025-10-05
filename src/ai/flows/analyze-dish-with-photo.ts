
'use server';

/**
 * @fileOverview A flow that analyzes a photo of a dish, identifies it, and generates a recipe.
 *
 * - analyzeDishWithPhoto - The main function that orchestrates the analysis and recipe generation.
 * - AnalyzeDishInput - The input type for the function.
 * - AnalyzeDishOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeDishInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a dish, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  style: z.enum(['Sencillo', 'Gourmet', 'Fryer', 'Parrillada', 'Bebidas', 'Reposteria']).describe('The desired cooking style for the generated recipe.'),
  cuisine: z.string().optional().describe('The desired cuisine type (e.g., Italian, Mexican).'),
});
export type AnalyzeDishInput = z.infer<typeof AnalyzeDishInputSchema>;


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
    name: z.string().describe('A suitable and appealing name for the identified dish.'),
    author: z.string().optional().describe("Always attribute 'Fudi Chef' as the author."),
    ingredients: z.array(IngredientSchema).describe('The ingredients with precise quantities for cooking.'),
    shoppingIngredients: z.array(IngredientSchema).describe('The ingredients as a shopping list (e.g., "1 onion" instead of "0.5 onion").'),
    instructions: z.string().describe('Step-by-step instructions for preparing the recipe.'),
    servings: z.number().describe('The number of servings the recipe is for, estimated from the photo.'),
    nutritionalInfo: NutritionalInfoSchema.describe('Estimated nutritional information per serving.'),
});

const AnalyzeDishOutputSchema = RecipeSchema.extend({
  imageUrl: z.string().describe('A new, generated image of the dish, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'),
});
export type AnalyzeDishOutput = z.infer<typeof AnalyzeDishOutputSchema>;


export async function analyzeDishWithPhoto(
  input: AnalyzeDishInput
): Promise<AnalyzeDishOutput> {
  return analyzeDishWithPhotoFlow(input);
}


const recipeParsingPrompt = ai.definePrompt({
  name: 'dishAnalysisPrompt',
  input: {schema: AnalyzeDishInputSchema.extend({ isGourmet: z.boolean(), isFryer: z.boolean(), isParrillada: z.boolean(), isBebida: z.boolean(), isReposteria: z.boolean() })},
  output: {schema: RecipeSchema},
  prompt: `You are Fudi Chef, an expert in analyzing food photos and creating recipes. A user has provided a photo of a dish.

**Your task is to:**
1.  **Analyze the Photo:** Carefully examine the image to identify the dish and its main components.
2.  **Generate a Recipe:** Based on your analysis, create a complete, well-formatted recipe.
    *   **'name'**: Give the dish a suitable and appealing name.
    *   **'author'**: Set the author to "Fudi Chef".
    *   **'ingredients' & 'shoppingIngredients'**: Create a structured list of ingredients with precise quantities for cooking and an optimized list for shopping.
    *   **'instructions'**: Write clear, step-by-step instructions. The style should be: {{{style}}}.
        {{#if isGourmet}}
        The recipe should be sophisticated and elegant, with refined techniques.
        {{else if isFryer}}
        The recipe instructions must be adapted for an Air Fryer, including temperature and cooking time.
        {{else if isParrillada}}
        The recipe should be adapted for a barbecue or grill.
        {{else if isBebida}}
        The recipe should be for a beverage, like a cocktail, juice, or smoothie.
        {{else if isReposteria}}
        The recipe should be for a dessert, pastry, or bread.
        {{else}}
        The recipe should be simple and practical for everyday cooking.
        {{/if}}
    *   **'servings'**: Estimate a reasonable number of servings.
    *   **'nutritionalInfo'**: Estimate the nutritional information per serving.
    {{#if cuisine}}
    *   The recipe should align with the '{{{cuisine}}}' cuisine type.
    {{/if}}

All text, units, and output must be in Spanish.

**Photo of the dish to analyze:**
{{media url=photoDataUri}}
`,
});

const imageGenerationPrompt = ai.definePrompt({
  name: 'analyzedDishImageGenerationPrompt',
  input: { schema: z.object({
    name: z.string(),
    ingredientsText: z.string(),
  }) },
  prompt: `Generate a photorealistic, professionally-shot image of the following recipe: {{{name}}}.
The general ingredients identified are: {{{ingredientsText}}}.
The image should look delicious, appetizing, and like it belongs in a high-end cooking magazine, matching the style of the original dish.`,
  config: {
    responseModalities: ['TEXT', 'IMAGE'],
  },
  model: 'googleai/gemini-2.0-flash-preview-image-generation'
});


const analyzeDishWithPhotoFlow = ai.defineFlow(
  {
    name: 'analyzeDishWithPhotoFlow',
    inputSchema: AnalyzeDishInputSchema,
    outputSchema: AnalyzeDishOutputSchema,
  },
  async input => {
    // 1. Get recipe details from the image
    const {output: recipeDetails} = await recipeParsingPrompt({
        ...input,
        isGourmet: input.style === 'Gourmet',
        isFryer: input.style === 'Fryer',
        isParrillada: input.style === 'Parrillada',
        isBebida: input.style === 'Bebidas',
        isReposteria: input.style === 'Reposteria',
    });
    if (!recipeDetails) {
      throw new Error('Failed to analyze dish and generate recipe details.');
    }

    // 2. Generate a new, high-quality image for the recipe
    const {media} = await imageGenerationPrompt({ 
        name: recipeDetails.name, 
        ingredientsText: recipeDetails.ingredients.map(i => i.name).join(', '),
    });
    if (!media || !media.url) {
        throw new Error('Failed to generate new recipe image.');
    }
    
    return {
      ...recipeDetails,
      imageUrl: media.url,
      author: 'Fudi Chef',
    };
  }
);
