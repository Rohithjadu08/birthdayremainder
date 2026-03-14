'use client';

import {
  collection,
  doc,
  Firestore,
} from 'firebase/firestore';
import {
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
  setDocumentNonBlocking,
} from '@/firebase';
import { placeholderImages } from './placeholder-images.json';
import type { Student } from './types';


export async function createStudent(
  firestore: Firestore,
  userId: string,
  studentData: Omit<Student, 'id' | 'userId' | 'imageHint'> & { photoUrl?: string }
): Promise<void> {
  const studentsCollection = collection(firestore, 'users', userId, 'students');
  const finalPhotoUrl = studentData.photoUrl || placeholderImages[Math.floor(Math.random() * placeholderImages.length)].imageUrl;
  
  const newStudentData = {
    ...studentData,
    userId: userId,
    photoUrl: finalPhotoUrl,
    imageHint: 'student portrait',
  };

  addDocumentNonBlocking(studentsCollection, newStudentData);
}

export async function updateStudent(
  firestore: Firestore,
  userId: string,
  studentId: string,
  studentData: Partial<Omit<Student, 'id' | 'userId'>>
): Promise<void> {
  const studentDocRef = doc(firestore, 'users', userId, 'students', studentId);
  setDocumentNonBlocking(studentDocRef, studentData, { merge: true });
}

export async function deleteStudent(
  firestore: Firestore,
  userId: string,
  studentId: string
): Promise<void> {
  const studentDocRef = doc(firestore, 'users', userId, 'students', studentId);
  deleteDocumentNonBlocking(studentDocRef);
}
