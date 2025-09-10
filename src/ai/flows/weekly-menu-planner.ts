
'use server';

/**
 * @fileOverview A flow that generates a weekly meal plan based on user preferences.
 *
 * - generateWeeklyMenu - The main function that orchestrates the menu generation.
 * - WeeklyMenuInput - The input type for the generateWeeklyMenu function.
 * - WeeklyMenuOutput - The return type for the generateWeeklyMenu function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { WeeklyMenuInputSchema, WeeklyMenuOutputSchema, type WeeklyMenuInput, type WeeklyMenuOutput } from '@/lib/types';

export async function generateWeeklyMenu(
  input: WeeklyMenuInput
): Promise<WeeklyMenuOutput> {
  return weeklyMenuPlannerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'weeklyMenuPlannerPrompt',
  input: {schema: WeeklyMenuInputSchema},
  output: {schema: WeeklyMenuOutputSchema},
  prompt: `Eres un nutricionista experto y chef. Tu tarea es crear un plan de menú semanal personalizado basado en las preferencias del usuario.

El plan debe ser saludable, balanceado y delicioso. Para cada comida (desayuno, almuerzo, cena), proporciona un nombre, una breve descripción, y una estimación de calorías, proteínas, carbohidratos y grasas.

Asegúrate de que todas las comidas y descripciones estén en español.

**Preferencias del Usuario:**
- **Grupo de Edad:** {{{ageGroup}}}
- **Objetivo Principal:** {{{goal}}}
- **Número de Días:** {{{days}}}
{{#if restrictions}}
- **Restricciones/Alergias:** {{{restrictions}}} (Ten esto en cuenta de manera estricta. Si dice "vegetariano", no incluyas carne. Si dice "sin gluten", evita el trigo, etc.)
{{/if}}

**Formato de Salida:**
Genera un plan para {{{days}}} días. Para cada día, especifica:
1.  'day': El día de la semana (Lunes, Martes, etc.).
2.  'breakfast', 'lunch', 'dinner': Cada uno debe ser un objeto con 'name', 'description', 'calories', 'protein', 'carbs', y 'fat'.
3.  'totalCalories': La suma de las calorías del día.

Finalmente, incluye un 'summary' general con recomendaciones y consejos para seguir el plan exitosamente.
`,
});


const weeklyMenuPlannerFlow = ai.defineFlow(
  {
    name: 'weeklyMenuPlannerFlow',
    inputSchema: WeeklyMenuInputSchema,
    outputSchema: WeeklyMenuOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('No menu plan generated');
    }
    return output;
  }
);
