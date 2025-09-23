
'use server';

/**
 * @fileOverview A flow that generates a weekly meal plan based on user preferences.
 * This flow now uses a two-step process: first, it generates the plan structure (meal names),
 * and then it fetches the details for each meal individually to ensure completeness.
 *
 * - generateWeeklyMenu - The main function that orchestrates the menu generation.
 * - WeeklyMenuInput - The input type for the generateWeeklyMenu function.
 * - WeeklyMenuOutput - The return type for the generateWeeklyMenu function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {
  WeeklyMenuInputSchema,
  WeeklyMenuOutputSchema,
  type WeeklyMenuInput,
  type WeeklyMenuOutput,
  type Meal,
} from '@/lib/types';

export async function generateWeeklyMenu(
  input: WeeklyMenuInput
): Promise<WeeklyMenuOutput> {
  return weeklyMenuPlannerFlow(input);
}

// Prompt 1: Generates the overall structure of the plan with meal names.
const planStructurePrompt = ai.definePrompt({
  name: 'weeklyMenuPlanStructurePrompt',
  input: {schema: WeeklyMenuInputSchema},
  output: {
    schema: z.object({
      plan: z.array(
        z.object({
          day: z.string(),
          breakfast: z.object({name: z.string()}).optional(),
          lunch: z.object({name: z.string()}).optional(),
          dinner: z.object({name: z.string()}).optional(),
        })
      ),
      shoppingList: z.array(z.object({name: z.string(), quantity: z.string()})),
      summary: z.string(),
    }),
  },
  prompt: `Eres un nutricionista experto y chef. Tu tarea es crear la ESTRUCTURA de un plan de menú semanal personalizado basado en las preferencias del usuario.

**Instrucciones MUY IMPORTANTES:**
1.  Para CADA DÍA, genera un objeto para CADA UNA de las comidas seleccionadas por el usuario en 'meals' (breakfast, lunch, dinner).
2.  Para cada comida, solo debes proporcionar el NOMBRE del plato (ej: 'name: "Pollo al horno con patatas"'). NO generes ingredientes, ni instrucciones, ni información nutricional en este paso.
3.  Genera un 'shoppingList' consolidado para toda la semana.
4.  Genera un 'summary' general.
5.  Asegúrate de que todo el texto esté en español.

**Preferencias del Usuario:**
- **Comensales:**
{{#each diners}}
- {{people}} {{ageGroup}}
{{/each}}
- **Objetivo Principal:** {{{goal}}}
- **Número de Días:** {{{days}}}
- **Comidas a incluir:** {{#each meals}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{#if restrictions}}
- **Restricciones/Alergias:** {{{restrictions}}}
{{/if}}
{{#if cuisine}}
- **Tipo de Cocina:** {{{cuisine}}}
{{/if}}
{{#if targetCalories}}
- **Metas Nutricionales Diarias (por persona):**
    - Calorías: ~{{{targetCalories}}} kcal
    - Proteínas: ~{{{targetProtein}}} g
    - Hidratos: ~{{{targetCarbs}}} g
    - Grasas: ~{{{targetFat}}} g
{{/if}}

Genera la estructura del plan.
`,
});

// Schema definition for a single meal's details. Moved here to fix ReferenceError.
const MealSchema = z.object({
  name: z.string().describe('The name of the meal.'),
  description: z
    .string()
    .describe(
      'A brief description of the meal and why it is suitable for the plan.'
    ),
  ingredients: z
    .array(
      z.object({
        name: z.string(),
        quantity: z.number(),
        unit: z.string().optional(),
      })
    )
    .describe('List of ingredients with quantities.'),
  instructions: z.string().describe('Step-by-step preparation instructions.'),
  nutritionalInfo: z
    .object({
      calories: z.number(),
      protein: z.number(),
      carbs: z.number(),
      fat: z.number(),
    })
    .describe('Estimated nutritional information per serving.'),
});


// Prompt 2: Fetches the detailed information for a single meal.
const mealDetailsPrompt = ai.definePrompt({
  name: 'mealDetailsPrompt',
  input: {
    schema: z.object({
      mealName: z.string(),
      context: WeeklyMenuInputSchema,
    }),
  },
  output: {schema: MealSchema}, // The ID will be assigned in the flow.
  prompt: `Eres un chef experto. Proporciona los detalles para la siguiente receta: "{{{mealName}}}".

La receta debe ser apropiada para el siguiente contexto:
- **Objetivo:** {{{context.goal}}}
- **Comensales:** El plan es para un grupo, pero genera los detalles de la receta (ingredientes, etc.) para un número de porciones razonable (ej. 2 o 4), y la información nutricional POR RACIÓN INDIVIDUAL.
{{#if context.restrictions}}
- **Restricciones:** {{{context.restrictions}}}
{{/if}}
{{#if context.cuisine}}
- **Tipo de Cocina:** {{{context.cuisine}}}
{{/if}}

Para la receta, proporciona:
1.  'name': El nombre del plato (debe ser "{{{mealName}}}").
2.  'description': Una descripción breve del plato.
3.  'ingredients': Una lista de ingredientes con cantidades precisas.
4.  'instructions': Instrucciones de preparación claras y concisas.
5.  'nutritionalInfo': Una estimación de calorías, proteínas, carbohidratos y grasas POR RACIÓN INDIVIDUAL.

Asegúrate de que todo el texto esté en español.`,
});

const weeklyMenuPlannerFlow = ai.defineFlow(
  {
    name: 'weeklyMenuPlannerFlow',
    inputSchema: WeeklyMenuInputSchema,
    outputSchema: WeeklyMenuOutputSchema,
  },
  async input => {
    // 1. Generate the basic plan structure
    const {output: planStructure} = await planStructurePrompt(input);
    if (!planStructure) {
      throw new Error('Could not generate the meal plan structure.');
    }

    // Function to fetch details for a single meal
    const getMealDetails = async (
      mealName: string | undefined
    ): Promise<Meal | undefined> => {
      if (!mealName) return undefined;
      try {
        const {output} = await mealDetailsPrompt({mealName, context: input});
        if (!output) return undefined;
        return {
          ...output,
          id: crypto.randomUUID(),
        };
      } catch (error) {
        console.error(`Failed to fetch details for meal: ${mealName}`, error);
        // Return a placeholder on error for this specific meal
        return {
          id: crypto.randomUUID(),
          name: `${mealName} (Error)`,
          description:
            'No se pudieron generar los detalles para esta comida.',
          ingredients: [],
          instructions: 'Intenta generar el plan de nuevo.',
          nutritionalInfo: {calories: 0, protein: 0, carbs: 0, fat: 0},
        };
      }
    };

    // 2. Fetch details for all meals in parallel
    const detailedPlanPromises = planStructure.plan.map(async day => {
      const [breakfast, lunch, dinner] = await Promise.all([
        input.meals.includes('breakfast')
          ? getMealDetails(day.breakfast?.name)
          : undefined,
        input.meals.includes('lunch') ? getMealDetails(day.lunch?.name) : undefined,
        input.meals.includes('dinner')
          ? getMealDetails(day.dinner?.name)
          : undefined,
      ]);

      // Estimate total daily nutritional info
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;

      if (breakfast) {
        totalCalories += breakfast.nutritionalInfo.calories;
        totalProtein += breakfast.nutritionalInfo.protein;
        totalCarbs += breakfast.nutritionalInfo.carbs;
        totalFat += breakfast.nutritionalInfo.fat;
      }
      if (lunch) {
        totalCalories += lunch.nutritionalInfo.calories;
        totalProtein += lunch.nutritionalInfo.protein;
        totalCarbs += lunch.nutritionalInfo.carbs;
        totalFat += lunch.nutritionalInfo.fat;
      }
      if (dinner) {
        totalCalories += dinner.nutritionalInfo.calories;
        totalProtein += dinner.nutritionalInfo.protein;
        totalCarbs += dinner.nutritionalInfo.carbs;
        totalFat += dinner.nutritionalInfo.fat;
      }

      return {
        day: day.day,
        breakfast,
        lunch,
        dinner,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
      };
    });

    const detailedPlan = await Promise.all(detailedPlanPromises);

    return {
      id: crypto.randomUUID(),
      plan: detailedPlan,
      shoppingList: planStructure.shoppingList,
      summary: planStructure.summary,
    };
  }
);

    