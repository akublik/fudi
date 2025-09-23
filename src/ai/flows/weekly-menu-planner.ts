
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

El plan debe ser saludable, balanceado y delicioso. Para CADA DÍA del plan, debes generar un objeto para CADA UNA de las comidas seleccionadas por el usuario en la matriz 'meals'. Si 'meals' contiene 'breakfast', 'lunch' y 'dinner', cada día debe tener los tres objetos.

Para cada comida (desayuno, almuerzo y/o cena), proporciona:
1.  'id': Un ID único para la comida (puedes usar un UUID o una cadena aleatoria).
2.  'name': El nombre del plato.
3.  'description': Una descripción breve del plato.
4.  'ingredients': Una lista de ingredientes con cantidades precisas para el número total de personas.
5.  'instructions': Instrucciones de preparación claras y concisas.
6.  'nutritionalInfo': Una estimación de calorías, proteínas, carbohidratos y grasas POR RACIÓN INDIVIDUAL.

Asegúrate de que todo el texto esté en español.

**Preferencias del Usuario:**
- **Comensales:**
{{#each diners}}
- {{people}} {{ageGroup}}
{{/each}}
- **Objetivo Principal:** {{{goal}}}
- **Número de Días:** {{{days}}}
- **Comidas a incluir en cada día:** {{#each meals}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{#if restrictions}}
- **Restricciones/Alergias:** {{{restrictions}}} (Aplica esto de manera estricta).
{{/if}}
{{#if cuisine}}
- **Tipo de Cocina:** {{{cuisine}}} (Aplica este estilo a las recetas).
{{/if}}
{{#if targetCalories}}
- **Metas Nutricionales Diarias (por persona):**
    - Calorías: ~{{{targetCalories}}} kcal
    - Proteínas: ~{{{targetProtein}}} g
    - Hidratos: ~{{{targetCarbs}}} g
    - Grasas: ~{{{targetFat}}} g
(Intenta acercarte a estas metas al diseñar el plan.)
{{/if}}

**Formato de Salida Obligatorio:**
Genera un plan para {{{days}}} días. Para cada día, especifica 'day' y los objetos para las comidas seleccionadas. Si el usuario seleccionó 'breakfast', 'lunch' y 'dinner', CADA DÍA debe contener los tres campos.
Además, crea un 'shoppingList' consolidado para toda la semana y un 'summary' general.

A continuación un ejemplo de cómo debe verse UN DÍA del plan si se piden todas las comidas:
{
  "day": "Lunes",
  "breakfast": {
    "id": "bf-lun-01",
    "name": "Avena con Frutas",
    "description": "Un desayuno energético...",
    "ingredients": [{"name": "avena", "quantity": 50, "unit": "gr"}],
    "instructions": "1. Mezclar la avena con leche...",
    "nutritionalInfo": {"calories": 300, "protein": 10, "carbs": 50, "fat": 5}
  },
  "lunch": {
    "id": "lu-lun-01",
    "name": "Pollo a la Plancha con Quinoa",
    "description": "Un almuerzo ligero y proteico...",
    "ingredients": [{"name": "pechuga de pollo", "quantity": 150, "unit": "gr"}],
    "instructions": "1. Sazonar el pollo...",
    "nutritionalInfo": {"calories": 500, "protein": 40, "carbs": 40, "fat": 15}
  },
  "dinner": {
    "id": "di-lun-01",
    "name": "Sopa de Lentejas",
    "description": "Una cena reconfortante y nutritiva...",
    "ingredients": [{"name": "lentejas", "quantity": 100, "unit": "gr"}],
    "instructions": "1. Remojar las lentejas...",
    "nutritionalInfo": {"calories": 400, "protein": 20, "carbs": 60, "fat": 5}
  },
  "totalCalories": 1200, "totalProtein": 70, "totalCarbs": 150, "totalFat": 25
}
Ahora, genera el plan completo para el usuario.
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
