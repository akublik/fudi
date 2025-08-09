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

const ComplementaryDishSuggestionOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      dishName: z.string().describe('The name of the suggested dish.'),
      ingredients: z.array(
        z.string().describe('An ingredient required for the dish.')
      ),
      instructions: z
        .string()
        .describe('Step-by-step instructions for preparing the dish.'),
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
  output: {schema: ComplementaryDishSuggestionOutputSchema},
  prompt: `Sugiere tres platos o acompañamientos complementarios, junto con una lista de ingredientes, instrucciones paso a paso y una URL de imagen, para el siguiente plato principal. Todo el texto debe estar en español:\n\nPlato Principal: {{{mainDish}}}`,
});

const complementaryDishSuggestionFlow = ai.defineFlow(
  {
    name: 'complementaryDishSuggestionFlow',
    inputSchema: ComplementaryDishSuggestionInputSchema,
    outputSchema: ComplementaryDishSuggestionOutputSchema,
  },
  async input => {
    const {output} = await complementaryDishSuggestionPrompt(input);
    return output!;
  }
);
