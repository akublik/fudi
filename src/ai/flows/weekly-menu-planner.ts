
'use server';

/**
 * @fileOverview A flow that generates a weekly meal plan based on user preferences.
 *
 * - generateWeeklyMenu - The main function that orchestrates the menu generation.
 * - WeeklyMenuInput - The input type for the generateWeeklyMenu function.
 * - WeeklyMenuOutput - The return type for the generateWeeklyMenu function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { WeeklyMenuInputSchema, WeeklyMenuOutputSchema, type WeeklyMenuInput, type WeeklyMenuOutput } from '@/lib/types';

export async function generateWeeklyMenu(
  input: WeeklyMenuInput
): Promise<WeeklyMenuOutput> {
  return weeklyMenuPlannerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'weeklyMenuPlannerPrompt',
  input: {schema: WeeklyMenuInputSchema.extend({
    hasBreakfast: z.boolean(),
    hasLunch: z.boolean(),
    hasDinner: z.boolean(),
  })},
  output: {schema: WeeklyMenuOutputSchema},
  prompt: `Eres un nutricionista experto y chef. Tu tarea es crear un plan de menú semanal personalizado basado en las preferencias del usuario.

El plan debe ser saludable, balanceado y delicioso. Para cada comida seleccionada por el usuario (desayuno, almuerzo, cena), proporciona:
1.  'name': El nombre del plato.
2.  'ingredients': Una lista de ingredientes con cantidades precisas para el número total de personas.
3.  'instructions': Instrucciones de preparación claras y concisas.
4.  'nutritionalInfo': Una estimación de calorías, proteínas, carbohidratos y grasas POR RACIÓN INDIVIDUAL.

Asegúrate de que todas las comidas, descripciones, ingredientes e instrucciones estén en español.

**Preferencias del Usuario:**
- **Comensales:**
{{#each diners}}
- {{people}} {{ageGroup}}
{{/each}}
- **Objetivo Principal:** {{{goal}}}
- **Número de Días:** {{{days}}}
- **Comidas a incluir:**
{{#if hasBreakfast}}- Desayuno
{{/if}}
{{#if hasLunch}}- Almuerzo
{{/if}}
{{#if hasDinner}}- Cena
{{/if}}
{{#if restrictions}}
- **Restricciones/Alergias:** {{{restrictions}}} (Ten esto en cuenta de manera estricta. Si dice "vegetariano", no incluyas carne. Si dice "sin gluten", evita el trigo, etc.)
{{/if}}
{{#if cuisine}}
- **Tipo de Cocina:** {{{cuisine}}} (Aplica este estilo de cocina a las recetas sugeridas).
{{/if}}

**Formato de Salida:**
Genera un plan para {{{days}}} días. Para cada día, especifica:
1.  'day': El día de la semana (Lunes, Martes, etc.).
2.  Las comidas seleccionadas: 'breakfast', 'lunch', 'dinner'. Si una comida no fue seleccionada por el usuario, OMITE el campo correspondiente. Cada comida debe ser un objeto con 'name', 'ingredients' (array de {name, quantity, unit}), 'instructions', y 'nutritionalInfo' (objeto con 'calories', 'protein', 'carbs', 'fat').
3.  'totalCalories': La suma de las calorías del día POR RACIÓN INDIVIDUAL.

**Lista de Compras Semanal:**
Después de definir todo el plan, crea un campo 'shoppingList'. Esta debe ser una lista consolidada de TODOS los ingredientes necesarios para la semana completa. Agrupa los ingredientes y optimízalos para una lista de compras. La cantidad debe ser un string que describa la unidad de compra. Por ejemplo, si se usan 3/4 de cebolla en total, la lista debe decir '1 cebolla'. Si se necesitan 15ml de aceite de oliva, la lista debe decir '1 botella de aceite de oliva'. Para las aceitunas, debe decir '1 frasco de aceitunas'. Para cada ingrediente, proporciona 'name' y 'quantity' como un string que describa lo que hay que comprar (ej: "1 botella", "2 latas", "500 gr").

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
    const {output} = await prompt({
        ...input,
        hasBreakfast: input.meals.includes('breakfast'),
        hasLunch: input.meals.includes('lunch'),
        hasDinner: input.meals.includes('dinner'),
    });
    if (!output) {
      throw new Error('No menu plan generated');
    }
    return output;
  }
);
