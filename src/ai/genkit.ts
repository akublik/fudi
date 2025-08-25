import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import Handlebars from 'handlebars';

Handlebars.registerHelper('eq', (a, b) => a === b);

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
