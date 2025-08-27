'use server';
/**
 * @fileOverview A Genkit flow for answering kitchen and cooking questions.
 *
 * - kitchenTipsChat - A function that takes a user's question and returns a helpful tip.
 * - KitchenTipInput - The input type for the kitchenTipsChat function.
 * - KitchenTipOutput - The output type for the kitchenTipsChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const KitchenTipInputSchema = z.object({
  question: z.string().describe('The user\'s question about cooking, ingredients, or kitchen techniques.'),
});
export type KitchenTipInput = z.infer<typeof KitchenTipInputSchema>;

const KitchenTipOutputSchema = z.object({
  answer: z.string().describe('A helpful and clear answer to the user\'s question, provided by an expert chef.'),
});
export type KitchenTipOutput = z.infer<typeof KitchenTipOutputSchema>;


export async function kitchenTipsChat(input: KitchenTipInput): Promise<KitchenTipOutput> {
  return kitchenTipsChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'kitchenTipPrompt',
  input: {schema: KitchenTipInputSchema},
  output: {schema: KitchenTipOutputSchema},
  prompt: `You are Chef Fudi, an expert chef with a friendly and encouraging tone. A user has a question about cooking. 
Provide a clear, concise, and helpful answer. If the question is not related to cooking, food, or kitchen topics, 
politely decline to answer and state that you only answer cooking-related questions.

User's question: {{{question}}}
`,
});

const kitchenTipsChatFlow = ai.defineFlow(
  {
    name: 'kitchenTipsChatFlow',
    inputSchema: KitchenTipInputSchema,
    outputSchema: KitchenTipOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('No answer generated');
    }
    return output;
  }
);
