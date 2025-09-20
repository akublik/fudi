'use server';

/**
 * @fileOverview A flow that suggests complementary dishes or sides for a given main course.
 *
 * - suggestComplementaryDishes - A function that suggests complementary dishes.
 * - ComplementaryDishSuggestionInput - The input type for the suggestComplementaryDishes function.
 * - ComplementaryDishSuggestionOutput - The return type for the suggestComplementaryDishes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ComplementaryDishSuggestionInputSchema = z.object({
  mainDish: z
    .string()
    .describe('The main dish for which to suggest complementary dishes.'),
  style: z.enum(['Sencillo', 'Gourmet', 'Fryer', 'Parrillada']).describe('The desired cooking style.'),
  cuisine: z.string().optional().describe('The desired cuisine type (e.g., Italian, Mexican).'),
});
export type ComplementaryDishSuggestionInput = z.infer<
  typeof ComplementaryDishSuggestionInputSchema
>;

const IngredientSchema = z.object({
  name: z.string().describe('The name of the ingredient.'),
  quantity: z.number().describe('The quantity of the ingredient.'),
  unit: z
    .string()
    .optional()
    .describe('The unit of measurement for the quantity (e.g., gramos, ml, cucharadita).'),
});

const NutritionalInfoSchema = z.object({
  calories: z.number().describe('Estimated calories per serving.'),
  protein: z.number().describe('Estimated grams of protein per serving.'),
  carbs: z.number().describe('Estimated grams of carbohydrates per serving.'),
  fat: z.number().describe('Estimated grams of fat per serving.'),
});

const SuggestionSchema = z.object({
  dishName: z.string().describe('The name of the suggested dish.'),
  ingredients: z.array(IngredientSchema).describe('The ingredients with precise quantities for cooking.'),
  shoppingIngredients: z.array(IngredientSchema).describe('The ingredients as a shopping list (e.g., "1 onion" instead of "0.5 onion").'),
  instructions: z
    .string()
    .describe('Step-by-step instructions for preparing the dish.'),
  servings: z
    .number()
    .describe('The number of servings the recipe is originally for.'),
  nutritionalInfo: NutritionalInfoSchema.describe('Estimated nutritional information per serving.'),
});

const ComplementaryDishSuggestionOutputSchema = z.object({
  suggestions: z.array(
    SuggestionSchema.extend({
      imageUrl: z.string().describe('An image of the dish, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'),
    })
  ),
});
export type ComplementaryDishSuggestionOutput = z.infer<
  typeof ComplementaryDishSuggestionOutputSchema
>;

export async function suggestComplementaryDishes(
  input: ComplementaryDishSuggestionInput
): Promise<ComplementaryDishSuggestionOutput> {
  return complementaryDishSuggestionFlow(input);
}

const complementaryDishSuggestionPrompt = ai.definePrompt({
  name: 'complementaryDishSuggestionPrompt',
  input: {schema: ComplementaryDishSuggestionInputSchema.extend({ isGourmet: z.boolean(), isFryer: z.boolean(), isParrillada: z.boolean() })},
  output: {schema: z.object({ suggestions: z.array(SuggestionSchema) })},
  prompt: `Suggest six complementary dishes or sides for the following main course.
For each dish, provide:
1. 'dishName': The name of the dish.
2. 'ingredients': A list of ingredients with precise quantities for cooking. For ingredients like fruits, vegetables, or meats, use approximate units (e.g., "4 papas medianas" instead of "800 gramos de papas").
3. 'shoppingIngredients': A separate list of ingredients optimized for a shopping list. This list should contain whole items you'd buy at the store. For example, if the recipe needs 'media cebolla', the shopping list should have '1 cebolla'. If it needs '1 cucharadita de achiote', the shopping list should just be 'achiote' with quantity 1.
4. 'instructions': Step-by-step cooking instructions.
5. 'servings': The number of servings.
6. 'nutritionalInfo': Estimated nutritional information per serving.

All text and units of measurement must be in Spanish (e.g., "cucharadita" instead of "tsp", "gramos" instead of "grams").

The style of the dishes should be: {{{style}}}.
{{#if isGourmet}}
Please provide sophisticated and elegant suggestions, with refined techniques, high-quality ingredients, and a beautiful presentation.
{{else if isFryer}}
Please provide suggestions that can be cooked in an Air Fryer. The instructions must include temperature and cooking time.
{{else if isParrillada}}
Please provide suggestions that are ideal for a barbecue or cookout (parrillada). They should be suitable for grilling.
{{else}}
Please provide simple, practical, and delicious suggestions, ideal for everyday cooking.
{{/if}}

{{#if cuisine}}
The suggestions should be of the following cuisine type: {{{cuisine}}}.
{{/if}}

Main Course: {{{mainDish}}}`,
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

const complementaryDishSuggestionFlow = ai.defineFlow(
  {
    name: 'complementaryDishSuggestionFlow',
    inputSchema: ComplementaryDishSuggestionInputSchema,
    outputSchema: ComplementaryDishSuggestionOutputSchema,
  },
  async input => {
    const {output} = await complementaryDishSuggestionPrompt({
        ...input,
        isGourmet: input.style === 'Gourmet',
        isFryer: input.style === 'Fryer',
        isParrillada: input.style === 'Parrillada',
    });
    if (!output || !output.suggestions || output.suggestions.length === 0) {
      console.warn('No suggestions were generated by the prompt.');
      return { suggestions: [] };
    }

    const suggestionsWithImages = await Promise.all(
      output.suggestions.map(async (suggestion) => {
        const {media} = await imageGenerationPrompt({ name: suggestion.dishName, ingredients: suggestion.ingredients.map(i => i.name) });
        return {
          ...suggestion,
          imageUrl: media!.url,
        };
      })
    );
    
    return { suggestions: suggestionsWithImages };
  }
);
