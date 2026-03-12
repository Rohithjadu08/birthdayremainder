'use server';
/**
 * @fileOverview A flow to extract student information from a PDF document.
 *
 * - extractStudentsFromPdf - A function that handles the PDF extraction process.
 * - ExtractStudentsInput - The input type for the extractStudentsFromPdf function.
 * - ExtractStudentsOutput - The return type for the extractStudentsFromPdf function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StudentDataSchema = z.object({
    name: z.string().describe("The full name of the student."),
    rollNumber: z.string().describe("The unique roll number assigned to the student."),
    department: z.string().describe("The academic department of the student."),
    birthday: z.string().describe("The student's birth date in YYYY-MM-DD format."),
});

const ExtractStudentsInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF file containing a list of students, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type ExtractStudentsInput = z.infer<typeof ExtractStudentsInputSchema>;

const ExtractStudentsOutputSchema = z.object({
    students: z.array(StudentDataSchema).describe("An array of extracted student data.")
});
export type ExtractStudentsOutput = z.infer<typeof ExtractStudentsOutputSchema>;

export async function extractStudentsFromPdf(input: ExtractStudentsInput): Promise<ExtractStudentsOutput> {
  return extractStudentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractStudentsPrompt',
  input: { schema: ExtractStudentsInputSchema },
  output: { schema: ExtractStudentsOutputSchema },
  prompt: `You are an expert data entry specialist. Your task is to extract student information from the provided document.

The document contains a list of students with their name, roll number, department, and birthday.

Extract all students and return them as a JSON object containing a "students" array. Each object in the array must have the following fields: "name", "rollNumber", "department", and "birthday".

Ensure the "birthday" field is in YYYY-MM-DD format. If the date is in a different format, convert it.

Document: {{media url=pdfDataUri}}`,
});

const extractStudentsFlow = ai.defineFlow(
  {
    name: 'extractStudentsFlow',
    inputSchema: ExtractStudentsInputSchema,
    outputSchema: ExtractStudentsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output || { students: [] };
  }
);
