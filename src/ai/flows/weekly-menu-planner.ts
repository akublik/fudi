
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
  input: {schema: WeeklyMenuInputSchema},
  output: {schema: WeeklyMenuOutputSchema},
  prompt: `Eres un nutricionista experto y chef. Tu tarea es crear un plan de menú semanal personalizado basado en las preferencias del usuario.

El plan debe ser saludable, balanceado y delicioso. Para cada comida seleccionada por el usuario para cada día del plan, proporciona:
1.  'id': Un ID único para la comida (puedes usar un UUID o una cadena aleatoria).
2.  'name': El nombre del plato.
3.  'description': Una descripción breve del plato y por qué es adecuado.
4.  'ingredients': Una lista de ingredientes con cantidades precisas para el número total de personas.
5.  'instructions': Instrucciones de preparación claras y concisas.
6.  'nutritionalInfo': Una estimación de calorías, proteínas, carbohidratos y grasas POR RACIÓN INDIVIDUAL.

Asegúrate de que todas las comidas, descripciones, ingredientes e instrucciones estén en español.

**Preferencias del Usuario:**
- **Comensales:**
{{#each diners}}
- {{people}} {{ageGroup}}
{{/each}}
- **Objetivo Principal:** {{{goal}}}
- **Número de Días:** {{{days}}}
- **Comidas a incluir:**
{{#if (includes meals "breakfast")}}- Desayuno
{{/if}}
{{#if (includes meals "lunch")}}- Almuerzo
{{/if}}
{{#if (includes meals "dinner")}}- Cena
{{/if}}
{{#if restrictions}}
- **Restricciones/Alergias:** {{{restrictions}}} (Ten esto en cuenta de manera estricta. Si dice "vegetariano", no incluyas carne. Si dice "sin gluten", evita el trigo, etc.)
{{/if}}
{{#if cuisine}}
- **Tipo de Cocina:** {{{cuisine}}} (Aplica este estilo de cocina a las recetas sugeridas).
{{/if}}
{{#if targetCalories}}
- **Metas Nutricionales Diarias (por persona):**
    - Calorías: ~{{{targetCalories}}} kcal
    - Proteínas: ~{{{targetProtein}}} g
    - Hidratos: ~{{{targetCarbs}}} g
    - Grasas: ~{{{targetFat}}} g
(Intenta acercarte a estas metas nutricionales diarias al diseñar el plan.)
{{/if}}

**Formato de Salida:**
Genera un plan para {{{days}}} días. Para cada día, especifica:
1.  'day': El día de la semana (Lunes, Martes, etc.).
2.  Las comidas seleccionadas. Si una comida no fue seleccionada por el usuario, OMITE el campo correspondiente.
    {{#if (includes meals "breakfast")}}
    - 'breakfast': Un objeto con 'id', 'name', 'description', 'ingredients' (array de {name, quantity, unit}), 'instructions', y 'nutritionalInfo' (objeto con 'calories', 'protein', 'carbs', 'fat').
    {{/if}}
    {{#if (includes meals "lunch")}}
    - 'lunch': Un objeto con 'id', 'name', 'description', 'ingredients' (array de {name, quantity, unit}), 'instructions', y 'nutritionalInfo' (objeto con 'calories', 'protein', 'carbs', 'fat').
    {{/if}}
    {{#if (includes meals "dinner")}}
    - 'dinner': Un objeto con 'id', 'name', 'description', 'ingredients' (array de {name, quantity, unit}), 'instructions', y 'nutritionalInfo' (objeto con 'calories', 'protein', 'carbs', 'fat').
    {{/if}}
3.  Un resumen nutricional del día completo POR RACIÓN INDIVIDUAL: 'totalCalories', 'totalProtein', 'totalCarbs', 'totalFat'.

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
    config: {
        // Helper para el prompt de Handlebars
        model: {
            custom: {
                helpers: {
                    includes: (array: any[], value: any) => array?.includes(value),
                }
            }
        }
    }
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('No menu plan generated');
    }
     // Ensure all meals have a unique ID, even if the model forgets one.
    const planWithIds = output.plan.map(day => ({
        ...day,
        breakfast: day.breakfast ? { ...day.breakfast, id: day.breakfast.id || crypto.randomUUID() } : undefined,
        lunch: day.lunch ? { ...day.lunch, id: day.lunch.id || crypto.randomUUID() } : undefined,
        dinner: day.dinner ? { ...day.dinner, id: day.dinner.id || crypto.randomUUID() } : undefined,
    }));
    
    return { ...output, plan: planWithIds, id: output.id || crypto.randomUUID() };
  }
);
