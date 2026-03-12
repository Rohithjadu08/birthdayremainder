'use server';
/**
 * @fileOverview A flow to generate a birthday reminder email for the professor.
 *
 * - generateBirthdayEmail - A function that generates the email content.
 * - GenerateBirthdayEmailInput - The input type for the generateBirthdayEmail function.
 * - GenerateBirthdayEmailOutput - The return type for the generateBirthdayEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StudentInfoSchema = z.object({
    name: z.string().describe("The name of the student."),
    department: z.string().describe("The student's department."),
});

const GenerateBirthdayEmailInputSchema = z.object({
  students: z.array(StudentInfoSchema).describe("A list of students who have a birthday today."),
  professorName: z.string().describe("The name of the professor the email is addressed to."),
});
export type GenerateBirthdayEmailInput = z.infer<typeof GenerateBirthdayEmailInputSchema>;

const GenerateBirthdayEmailOutputSchema = z.object({
  subject: z.string().describe("The subject line for the email."),
  body: z.string().describe("The body content of the email in plain text."),
});
export type GenerateBirthdayEmailOutput = z.infer<typeof GenerateBirthdayEmailOutputSchema>;

export async function generateBirthdayEmail(input: GenerateBirthdayEmailInput): Promise<GenerateBirthdayEmailOutput> {
  return generateBirthdayEmailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBirthdayEmailPrompt',
  input: { schema: GenerateBirthdayEmailInputSchema },
  output: { schema: GenerateBirthdayEmailOutputSchema },
  prompt: `You are an helpful assistant for a professor. Your task is to draft a birthday reminder email.

The email should be addressed to Professor {{professorName}}.

It should remind the professor that the following student(s) have their birthday today:
{{#each students}}
- {{name}} ({{department}})
{{/each}}

The tone should be friendly, concise, and professional. The body should be plain text, not HTML.
Suggest that the professor could send a quick celebratory note to them.

Generate a suitable subject line and email body.
`,
});

const generateBirthdayEmailFlow = ai.defineFlow(
  {
    name: 'generateBirthdayEmailFlow',
    inputSchema: GenerateBirthdayEmailInputSchema,
    outputSchema: GenerateBirthdayEmailOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("Failed to generate birthday email.");
    }
    return output;
  }
);
