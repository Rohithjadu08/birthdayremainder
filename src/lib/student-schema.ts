import { z } from 'zod';

export const studentSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(3, { message: 'Name must be at least 3 characters long.' }),
    rollNumber: z.string().min(1, { message: 'Roll number is required.' }),
    department: z.string().min(2, { message: 'Department is required.' }),
    birthday: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format.' }),
    photoUrl: z.string().url({ message: 'Please enter a valid URL.' }).or(z.literal('')),
});

export type State = {
  errors: Record<string, string[]>;
  message: string;
};
