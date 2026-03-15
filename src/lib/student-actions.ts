'use client';

import {
  collection,
  doc,
  addDoc,
  Firestore,
} from 'firebase/firestore';
import {
  deleteDocumentNonBlocking,
  setDocumentNonBlocking,
} from '@/firebase';
import { placeholderImages } from './placeholder-images.json';
import type { Student } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


export async function createStudent(
  firestore: Firestore,
  userId: string,
  studentData: Omit<Student, 'id' | 'userId' | 'imageHint'> & { photoUrl?: string }
): Promise<boolean> {
  const studentsCollection = collection(firestore, 'users', userId, 'students');
  
  const placeholder = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
  const finalPhotoUrl = studentData.photoUrl || placeholder.imageUrl;
  const imageHint = studentData.photoUrl ? 'student portrait' : placeholder.imageHint;

  const newStudentData = {
    ...studentData,
    userId: userId,
    photoUrl: finalPhotoUrl,
    imageHint: imageHint,
  };

  try {
    await addDoc(studentsCollection, newStudentData);
    return true;
  } catch (error) {
     const permissionError = new FirestorePermissionError({
        path: studentsCollection.path,
        operation: 'create',
        requestResourceData: newStudentData,
      });
      errorEmitter.emit('permission-error', permissionError);
      console.error("Error creating student:", error);
      return false;
  }
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
