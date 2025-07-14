// Summarizes the text extracted from an uploaded image or PDF using the Gemini Pro Vision API.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeImagePdfInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "A file (image or PDF) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type SummarizeImagePdfInput = z.infer<typeof SummarizeImagePdfInputSchema>;

const SummarizeImagePdfOutputSchema = z.object({
  summary: z.string().describe('A summary of the text extracted from the image or PDF.'),
});

export type SummarizeImagePdfOutput = z.infer<typeof SummarizeImagePdfOutputSchema>;

export async function summarizeImagePdf(input: SummarizeImagePdfInput): Promise<SummarizeImagePdfOutput> {
  return summarizeImagePdfFlow(input);
}

const summarizeImagePdfPrompt = ai.definePrompt({
  name: 'summarizeImagePdfPrompt',
  input: {schema: SummarizeImagePdfInputSchema},
  output: {schema: SummarizeImagePdfOutputSchema},
  prompt: `You are an expert summarizer of documents.

You will extract the text from the image or PDF provided, and then summarize it.

Summary:

{{media url=fileDataUri}}`,
});

const summarizeImagePdfFlow = ai.defineFlow(
  {
    name: 'summarizeImagePdfFlow',
    inputSchema: SummarizeImagePdfInputSchema,
    outputSchema: SummarizeImagePdfOutputSchema,
  },
  async input => {
    const {output} = await summarizeImagePdfPrompt(input);
    return output!;
  }
);
