'use server';
/**
 * @fileOverview A flow to extract student details from a file, such as a PDF.
 *
 * - extractStudentsFromFile - A function that handles the student extraction process.
 * - ExtractStudentsInput - The input type for the extractStudentsFromFile function.
 * - ExtractStudentsOutput - The return type for the extractStudentsFromFile function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// This schema defines the structure of a single student record that the AI should extract.
// Most fields are optional because they might not be present in every document.
const ExtractedStudentSchema = z.object({
    name: z.string().describe("The full name of the student."),
    rollNumber: z.string().describe("The student's unique roll number."),
    department: z.string().optional().describe("The student's academic department."),
    section: z.string().optional().describe("The student's class section (e.g., 'A', 'B')."),
    birthday: z.string().optional().describe("The student's birthday in YYYY-MM-DD format."),
    phoneNumber: z.string().optional().describe("The student's phone number.")
});

const ExtractStudentsInputSchema = z.object({
  fileDataUri: z.string().describe(
      "The content of the file as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type ExtractStudentsInput = z.infer<typeof ExtractStudentsInputSchema>;

const ExtractStudentsOutputSchema = z.object({
  students: z.array(ExtractedStudentSchema).describe("An array of student objects extracted from the file."),
});
export type ExtractStudentsOutput = z.infer<typeof ExtractStudentsOutputSchema>;

export async function extractStudentsFromFile(input: ExtractStudentsInput): Promise<ExtractStudentsOutput> {
  return extractStudentsFromFileFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractStudentsFromFilePrompt',
  input: { schema: ExtractStudentsInputSchema },
  output: { schema: ExtractStudentsOutputSchema },
  prompt: `You are an expert data extraction assistant. Your task is to analyze the provided file—which could be a PDF, CSV, or other text-based document—and extract a list of students.

The file content is provided below as a data URI:
{{media url=fileDataUri}}

Scan the document and identify all student records. For each student, extract the following information if available:
- name
- rollNumber
- department
- section
- birthday
- phoneNumber

CRITICAL INSTRUCTIONS FOR BIRTHDAY FIELD:
- You MUST do your best to parse any date format (e.g., "Jan 1, 2002", "01/01/2002", "2002-01-01", "1st January 2002").
- The final output for the 'birthday' field MUST be in YYYY-MM-DD format.
- If the year is not specified, use a placeholder year like '2000'. For example, if you see "March 5th", you should output "2000-03-05".
- If a date is completely unparseable or missing, omit the 'birthday' field for that student.

Return the data as a JSON object containing a "students" array. Each object in the array should represent one student.
If a piece of information for a student is not found, omit the corresponding key.
Ignore any headers, footers, or irrelevant text in the document. Only return the structured student data.
If the file is a CSV, treat the first row as the header.
`,
});

const extractStudentsFromFileFlow = ai.defineFlow(
  {
    name: 'extractStudentsFromFileFlow',
    inputSchema: ExtractStudentsInputSchema,
    outputSchema: ExtractStudentsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("Failed to extract students from file. The AI model did not return any data.");
    }
    return output;
  }
);
