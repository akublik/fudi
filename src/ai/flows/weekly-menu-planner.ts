
'use server';

/**
 * @fileOverview A flow that generates a weekly meal plan based on user preferences.
 * This flow now uses a more robust two-step process:
 * 1. It generates the plan structure with meal names.
 * 2. It fetches the details for each meal individually to ensure completeness.
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


// Prompt to generate ONLY meal names for a specific meal type
const createMealNamesPrompt = (mealType: 'Breakfast' | 'Lunch' | 'Dinner') =>
  ai.definePrompt({
    name: `weeklyMenu${mealType}NamesPrompt`,
    input: {schema: WeeklyMenuInputSchema},
    output: {
      schema: z.object({
        mealNames: z.array(z.string()).describe(`A list of exactly ${'{{days}}'} meal names for ${mealType}.`),
      }),
    },
    prompt: `You are a nutritionist. Generate a list of meal names for the specified number of days.

**Instructions:**
- Generate EXACTLY {{{days}}} meal names.
- The meal type is: ${mealType}.
- The meals should be appropriate for the user's goal: {{{goal}}}.
{{#if restrictions}}
- Adhere to the following restrictions: {{{restrictions}}}.
{{/if}}
{{#if cuisine}}
- The cuisine should be: {{{cuisine}}}.
{{/if}}
- Respond ONLY with the list of meal names in the required format.

Generate the list of names.`,
  });

const breakfastNamesPrompt = createMealNamesPrompt('Breakfast');
const lunchNamesPrompt = createMealNamesPrompt('Lunch');
const dinnerNamesPrompt = createMealNamesPrompt('Dinner');

// Prompt to generate a consolidated shopping list and summary
const shoppingListAndSummaryPrompt = ai.definePrompt({
    name: 'shoppingListAndSummaryPrompt',
    input: { schema: z.object({ allMealNames: z.array(z.string()), context: WeeklyMenuInputSchema }) },
    output: {
        schema: z.object({
            shoppingList: z.array(z.object({name: z.string(), quantity: z.string()})),
            summary: z.string(),
        })
    },
    prompt: `You are an expert chef. Based on the following list of meals for a weekly plan, generate:
1. A consolidated shopping list for all ingredients needed.
2. A brief, encouraging summary of the meal plan.

**User Context:**
- **Goal:** {{{context.goal}}}
- **Diners:** {{#each context.diners}}{{people}} {{ageGroup}}{{/each}}

**Meals in the plan:**
{{#each allMealNames}}
- {{{this}}}
{{/each}}

Generate the shopping list and the summary.
`
});


// Schema definition for a single meal's details.
const MealDetailsSchema = z.object({
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
  preparationTime: z.number().describe('The estimated preparation time in minutes.'),
  difficulty: z.enum(['Fácil', 'Medio', 'Difícil']).describe('The difficulty of the recipe (Easy, Medium, Hard).'),
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
  output: {schema: MealDetailsSchema},
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
5.  'preparationTime': El tiempo total estimado de preparación y cocción en minutos.
6.  'difficulty': La dificultad de la receta ('Fácil', 'Medio', 'Difícil').
7.  'nutritionalInfo': Una estimación de calorías, proteínas, carbohidratos y grasas POR RACIÓN INDIVIDUAL.

Asegúrate de que todo el texto esté en español.`,
});

const weeklyMenuPlannerFlow = ai.defineFlow(
  {
    name: 'weeklyMenuPlannerFlow',
    inputSchema: WeeklyMenuInputSchema,
    outputSchema: WeeklyMenuOutputSchema,
  },
  async input => {
    // 1. Generate meal names for each requested meal type
    const [breakfastNames, lunchNames, dinnerNames] = await Promise.all([
        input.meals.includes('breakfast') ? breakfastNamesPrompt(input).then(res => res.output?.mealNames || []) : Promise.resolve([]),
        input.meals.includes('lunch') ? lunchNamesPrompt(input).then(res => res.output?.mealNames || []) : Promise.resolve([]),
        input.meals.includes('dinner') ? dinnerNamesPrompt(input).then(res => res.output?.mealNames || []) : Promise.resolve([]),
    ]);

    // 2. Assemble the basic plan structure with names
    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const planWithNames = Array.from({ length: input.days }, (_, i) => ({
      day: dayNames[i],
      breakfastName: breakfastNames[i] || undefined,
      lunchName: lunchNames[i] || undefined,
      dinnerName: dinnerNames[i] || undefined,
    }));

    // 3. Generate consolidated shopping list and summary
    const allMealNames = [
      ...breakfastNames,
      ...lunchNames,
      ...dinnerNames,
    ].filter(Boolean);

    const { output: summaryAndList } = await shoppingListAndSummaryPrompt({
      allMealNames,
      context: input,
    });
    
    // Function to fetch details for a single meal
    const getMealDetails = async (
      mealName: string | undefined
    ): Promise<Meal | undefined> => {
      if (!mealName) return undefined;
      try {
        const {output} = await mealDetailsPrompt({mealName, context: input});
        if (!output) {
          return {
            id: crypto.randomUUID(),
            name: `${mealName}`,
            description: 'El asistente no pudo generar los detalles para esta comida. Inténtalo de nuevo.',
            ingredients: [],
            instructions: 'Intenta generar el plan de nuevo.',
            preparationTime: 0,
            difficulty: 'Medio',
            nutritionalInfo: {calories: 0, protein: 0, carbs: 0, fat: 0},
          };
        }
        return {
          ...output,
          id: crypto.randomUUID(),
        };
      } catch (error) {
        console.error(`Failed to fetch details for meal: ${mealName}`, error);
        return {
          id: crypto.randomUUID(),
          name: `${mealName} (Error)`,
          description:
            'No se pudieron generar los detalles para esta comida.',
          ingredients: [],
          instructions: 'Intenta generar el plan de nuevo.',
          preparationTime: 0,
          difficulty: 'Medio',
          nutritionalInfo: {calories: 0, protein: 0, carbs: 0, fat: 0},
        };
      }
    };

    // 4. Fetch details for all meals in parallel
    const detailedPlanPromises = planWithNames.map(async day => {
      const [breakfast, lunch, dinner] = await Promise.all([
        getMealDetails(day.breakfastName),
        getMealDetails(day.lunchName),
        getMealDetails(day.dinnerName),
      ]);

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
      
      const finalDay = {
        day: day.day,
        breakfast,
        lunch,
        dinner,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
      };

      if (input.meals.includes('breakfast') && !finalDay.breakfast) {
        finalDay.breakfast = { id: crypto.randomUUID(), name: 'Desayuno no generado', description: 'El asistente no generó una comida para este espacio.', ingredients: [], instructions: '', preparationTime: 0, difficulty: 'Fácil', nutritionalInfo: {calories: 0, protein: 0, carbs: 0, fat: 0} };
      }
       if (input.meals.includes('lunch') && !finalDay.lunch) {
        finalDay.lunch = { id: crypto.randomUUID(), name: 'Almuerzo no generado', description: 'El asistente no generó una comida para este espacio.', ingredients: [], instructions: '', preparationTime: 0, difficulty: 'Fácil', nutritionalInfo: {calories: 0, protein: 0, carbs: 0, fat: 0} };
      }
       if (input.meals.includes('dinner') && !finalDay.dinner) {
        finalDay.dinner = { id: crypto.randomUUID(), name: 'Cena no generada', description: 'El asistente no generó una comida para este espacio.', ingredients: [], instructions: '', preparationTime: 0, difficulty: 'Fácil', nutritionalInfo: {calories: 0, protein: 0, carbs: 0, fat: 0} };
      }

      return finalDay;
    });

    const detailedPlan = await Promise.all(detailedPlanPromises);

    return {
      id: crypto.randomUUID(),
      plan: detailedPlan,
      shoppingList: summaryAndList?.shoppingList || [],
      summary: summaryAndList?.summary || 'Plan generado.',
    };
  }
);
