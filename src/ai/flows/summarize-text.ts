'use server';

/**
 * @fileOverview Processes text input using the Gemini Pro API.
 * It can either summarize existing text or generate new content from a prompt.
 *
 * - summarizeText - A function that processes the input text.
 * - SummarizeTextInput - The input type for the summarizeText function.
 * - SummarizeTextOutput - The return type for the summarizeText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTextInputSchema = z.object({
  text: z.string().describe('The text to process (summarize or use as a prompt).'),
});
export type SummarizeTextInput = z.infer<typeof SummarizeTextInputSchema>;

const SummarizeTextOutputSchema = z.object({
  summary: z.string().describe('The processed text (summary or generated content).'),
});
export type SummarizeTextOutput = z.infer<typeof SummarizeTextOutputSchema>;

export async function summarizeText(input: SummarizeTextInput): Promise<SummarizeTextOutput> {
  return summarizeTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTextPrompt',
  input: {schema: SummarizeTextInputSchema},
  output: {schema: SummarizeTextOutputSchema},
  prompt: `You are an expert content processor. Analyze the user's input.

- If the input appears to be a document, article, or notes, your task is to provide a concise summary.
- If the input appears to be a prompt, a command, or a question (e.g., "write a poem about...", "draft a speech on...", "what is...?"), your task is to generate the requested content.

Provide only the resulting summary or generated content, without any extra commentary or conversational filler.

Input:
{{{text}}}`,
});

const summarizeTextFlow = ai.defineFlow(
  {
    name: 'summarizeTextFlow',
    inputSchema: SummarizeTextInputSchema,
    outputSchema: SummarizeTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
