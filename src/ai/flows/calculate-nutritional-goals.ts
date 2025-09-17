
'use server';

/**
 * @fileOverview A flow that calculates estimated nutritional goals (calories, macros) for a user.
 *
 * - calculateNutritionalGoals - The main function to calculate goals.
 * - NutritionalGoalsInput - The input type for the function.
 * - NutritionalGoalsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { NutritionalGoalsInputSchema, NutritionalGoalsOutputSchema, type NutritionalGoalsInput, type NutritionalGoalsOutput } from '@/lib/types';


export async function calculateNutritionalGoals(
  input: NutritionalGoalsInput
): Promise<NutritionalGoalsOutput> {
  return calculateNutritionalGoalsFlow(input);
}


const prompt = ai.definePrompt({
  name: 'nutritionalGoalsCalculatorPrompt',
  input: {schema: NutritionalGoalsInputSchema},
  output: {schema: NutritionalGoalsOutputSchema},
  prompt: `Eres un asistente nutricional experto. Tu tarea es calcular las necesidades calóricas y de macronutrientes diarias estimadas para un usuario basándote en la información proporcionada.

Utiliza fórmulas estándar como la de Harris-Benedict o Mifflin-St Jeor como base para el metabolismo basal, y luego ajusta según el nivel de actividad y el objetivo del usuario.

**Información del Usuario:**
- **Género:** {{{gender}}}
- **Edad:** {{{age}}} años
- **Peso:** {{{weight}}} kg
- **Altura:** {{{height}}} cm
- **Nivel de Actividad:** {{{activityLevel}}}
- **Objetivo Principal:** {{{goal}}}

**Instrucciones:**
1.  Calcula las calorías de mantenimiento.
2.  Ajusta las calorías según el objetivo:
    - **Perder peso:** Un déficit moderado (ej. -300 a -500 kcal).
    - **Ganar músculo:** Un superávit moderado (ej. +300 a +500 kcal).
    - **Comer balanceado / Controlar diabetes:** Mantener las calorías de mantenimiento.
3.  Distribuye los macronutrientes (proteínas, carbohidratos, grasas) de forma balanceada. Por ejemplo, un 40% de carbohidratos, 30% de proteínas y 30% de grasas es un buen punto de partida, pero puedes ajustarlo según el objetivo (ej. más proteína para ganar músculo).
4.  Devuelve los valores finales como números enteros en los campos 'calories', 'protein', 'carbs' y 'fat'.

NO incluyas explicaciones en tu respuesta, solo los valores numéricos en el formato JSON de salida requerido.
`,
});

const calculateNutritionalGoalsFlow = ai.defineFlow(
  {
    name: 'calculateNutritionalGoalsFlow',
    inputSchema: NutritionalGoalsInputSchema,
    outputSchema: NutritionalGoalsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Could not calculate nutritional goals.');
    }
    return output;
  }
);

