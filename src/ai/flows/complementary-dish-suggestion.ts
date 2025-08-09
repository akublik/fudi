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
});
export type ComplementaryDishSuggestionInput = z.infer<
  typeof ComplementaryDishSuggestionInputSchema
>;

const SuggestionSchema = z.object({
  dishName: z.string().describe('The name of the suggested dish.'),
  ingredients: z.array(
    z.string().describe('An ingredient required for the dish.')
  ),
  instructions: z
    .string()
    .describe('Step-by-step instructions for preparing the dish.'),
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
  input: {schema: ComplementaryDishSuggestionInputSchema},
  output: {schema: z.object({ suggestions: z.array(SuggestionSchema) })},
  prompt: `Suggest six complementary dishes or sides, along with a list of ingredients and step-by-step instructions, for the following main course. All text must be in Spanish:\n\nMain Course: {{{mainDish}}}`,
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
    const {output} = await complementaryDishSuggestionPrompt(input);
    if (!output || !output.suggestions || output.suggestions.length === 0) {
      throw new Error('No suggestions generated');
    }

    const suggestionsWithImages = await Promise.all(
      output.suggestions.map(async (suggestion) => {
        const {media} = await imageGenerationPrompt({ name: suggestion.dishName, ingredients: suggestion.ingredients });
        return {
          ...suggestion,
          imageUrl: media!.url,
        };
      })
    );
    
    return { suggestions: suggestionsWithImages };
  }
);
