'use server';
/**
 * @fileOverview Generates AI-driven tip cards on food safety and sustainability.
 *
 * - generateFoodTip - A function that generates a food safety tip card.
 * - GenerateFoodTipInput - The input type for the generateFoodTip function.
 * - GenerateFoodTipOutput - The return type for the generateFoodTip function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFoodTipInputSchema = z.object({
  foodItem: z.string().describe('The food item to generate a tip for.'),
});
export type GenerateFoodTipInput = z.infer<typeof GenerateFoodTipInputSchema>;

const GenerateFoodTipOutputSchema = z.object({
  tip: z.string().describe('The AI-generated tip on safe food handling and sustainability for the given food item.'),
});
export type GenerateFoodTipOutput = z.infer<typeof GenerateFoodTipOutputSchema>;

export async function generateFoodTip(input: GenerateFoodTipInput): Promise<GenerateFoodTipOutput> {
  return generateFoodTipFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFoodTipPrompt',
  input: {schema: GenerateFoodTipInputSchema},
  output: {schema: GenerateFoodTipOutputSchema},
  prompt: `You are an AI assistant that provides helpful tips on safe food handling and sustainability.

  Generate a tip for the following food item:
  {{{foodItem}}}
  `,
});

const generateFoodTipFlow = ai.defineFlow(
  {
    name: 'generateFoodTipFlow',
    inputSchema: GenerateFoodTipInputSchema,
    outputSchema: GenerateFoodTipOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
