'use server';
/**
 * @fileOverview A flow to generate birthday wish suggestions.
 *
 * - generateBirthdayWish - A function that generates birthday wish ideas.
 * - GenerateBirthdayWishInput - The input type for the generateBirthdayWish function.
 * - GenerateBirthdayWishOutput - The return type for the generateBirthdayWish function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateBirthdayWishInputSchema = z.object({
  studentName: z.string().describe("The name of the student."),
  studentDepartment: z.string().describe("The student's department, which can be used for context."),
  studentSection: z.string().describe("The student's class section, for additional context."),
});
export type GenerateBirthdayWishInput = z.infer<typeof GenerateBirthdayWishInputSchema>;

const GenerateBirthdayWishOutputSchema = z.object({
  wishes: z.array(z.string()).describe("An array of three distinct and creative birthday wish suggestions."),
});
export type GenerateBirthdayWishOutput = z.infer<typeof GenerateBirthdayWishOutputSchema>;

export async function generateBirthdayWish(input: GenerateBirthdayWishInput): Promise<GenerateBirthdayWishOutput> {
  return generateBirthdayWishFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBirthdayWishPrompt',
  input: { schema: GenerateBirthdayWishInputSchema },
  output: { schema: GenerateBirthdayWishOutputSchema },
  prompt: `You are a creative and thoughtful assistant for a professor.
Your task is to generate three distinct, creative, and heartfelt birthday wish ideas for a student named {{studentName}}.
The student is in the {{studentDepartment}} department, section {{studentSection}}. You can use this context to make one of the wishes more specific and fun.

For example, if the department is 'Computer Science', you could include a coding-related pun. If it's 'Literature', you could use a literary quote.

Please provide the output as a JSON object with a "wishes" array containing three strings.
The tone should be warm, encouraging, and appropriate for a professor-to-student relationship.
`,
});

const generateBirthdayWishFlow = ai.defineFlow(
  {
    name: 'generateBirthdayWishFlow',
    inputSchema: GenerateBirthdayWishInputSchema,
    outputSchema: GenerateBirthdayWishOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("Failed to generate birthday wishes.");
    }
    return output;
  }
);
