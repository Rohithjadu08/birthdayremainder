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
  studentData: Omit<Student, 'id' | 'imageHint'> & { photoUrl?: string }
): Promise<void> {
  const studentsCollection = collection(firestore, 'students');
  const finalPhotoUrl = studentData.photoUrl || placeholderImages[Math.floor(Math.random() * placeholderImages.length)].imageUrl;
  
  const newStudentData = {
    ...studentData,
    photoUrl: finalPhotoUrl,
    imageHint: 'student portrait',
  };

  await addDocumentNonBlocking(studentsCollection, newStudentData);
}

export async function updateStudent(
  firestore: Firestore,
  studentId: string,
  studentData: Partial<Omit<Student, 'id'>>
): Promise<void> {
  const studentDocRef = doc(firestore, 'students', studentId);
  await setDocumentNonBlocking(studentDocRef, studentData, { merge: true });
}

export async function deleteStudent(
  firestore: Firestore,
  studentId: string
): Promise<void> {
  const studentDocRef = doc(firestore, 'students', studentId);
  await deleteDocumentNonBlocking(studentDocRef);
}
