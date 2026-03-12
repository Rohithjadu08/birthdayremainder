'use server';

import { students } from './db';
import type { Student } from './types';
import { revalidatePath } from 'next/cache';
import { placeholderImages } from './placeholder-images.json';
import { studentSchema } from './student-schema';
import type { State } from './student-schema';


export async function createStudent(prevState: State, formData: FormData) {
    const validatedFields = studentSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
          errors: validatedFields.error.flatten().fieldErrors,
          message: 'Validation failed. Please check the fields.',
        };
    }
    
    try {
        const { name, rollNumber, department, birthday, photoUrl } = validatedFields.data;
        const newId = (Math.max(0, ...students.map(s => parseInt(s.id))) + 1).toString();
        
        // Use a random placeholder if no URL is provided
        const finalPhotoUrl = photoUrl || placeholderImages[Math.floor(Math.random() * placeholderImages.length)].imageUrl;

        const newStudent: Student = { 
            id: newId, 
            name, 
            rollNumber, 
            department, 
            birthday, 
            photoUrl: finalPhotoUrl,
            imageHint: 'student portrait',
        };

        students.unshift(newStudent);
        
        revalidatePath('/');
        revalidatePath('/students');
        revalidatePath('/calendar');
        
        return { errors: {}, message: 'Student added successfully.' };

    } catch (e) {
        return { errors: {}, message: 'An unexpected error occurred.' };
    }
}

export async function updateStudent(prevState: State, formData: FormData) {
    const validatedFields = studentSchema.safeParse(Object.fromEntries(formData.entries()));
    
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validation failed. Please check the fields.',
        };
    }

    const { id, ...dataToUpdate } = validatedFields.data;

    if (!id) {
        return { errors: { id: ['Student ID is missing'] }, message: 'Cannot update student without an ID.' };
    }

    try {
        const studentIndex = students.findIndex((s) => s.id === id);

        if (studentIndex === -1) {
            return { errors: { id: ['Student not found'] }, message: 'Student with this ID does not exist.' };
        }

        students[studentIndex] = { ...students[studentIndex], ...dataToUpdate };

        revalidatePath('/');
        revalidatePath('/students');
        revalidatePath('/calendar');

        return { errors: {}, message: 'Student updated successfully.' };
    } catch (e) {
        return { errors: {}, message: 'An unexpected error occurred.' };
    }
}


export async function deleteStudent(formData: FormData) {
    const id = formData.get('id') as string;
    
    if (!id) {
        return { message: 'Student ID is missing.' };
    }

    const studentIndex = students.findIndex((s) => s.id === id);

    if (studentIndex > -1) {
        students.splice(studentIndex, 1);
        revalidatePath('/');
        revalidatePath('/students');
        revalidatePath('/calendar');
        return { message: 'Student deleted successfully.' };
    }
    
    return { message: 'Student not found.' };
}
