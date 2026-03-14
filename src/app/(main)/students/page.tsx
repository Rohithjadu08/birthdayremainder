'use client';

import StudentTable from '@/components/students/student-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Student } from '@/lib/types';
import { Loader } from 'lucide-react';

export default function StudentsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const studentsCollection = useMemoFirebase(() => (user ? collection(firestore, 'users', user.uid, 'students') : null), [firestore, user]);
  const { data: students, isLoading: studentsLoading } = useCollection<Student>(studentsCollection);

  const isLoading = isUserLoading || studentsLoading;

  return (
    <Card>
        <CardHeader>
            <CardTitle>Student Directory</CardTitle>
            <CardDescription>View, search, and manage all student records.</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                 <div className="flex items-center justify-center h-64">
                    <Loader className="h-8 w-8 animate-spin" />
                 </div>
            ) : (
                <StudentTable students={students || []} />
            )}
        </CardContent>
    </Card>
  );
}
