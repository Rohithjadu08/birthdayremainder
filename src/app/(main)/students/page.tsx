'use client';

import { useMemo } from 'react';
import StudentTable from '@/components/students/student-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Student } from '@/lib/types';
import { Loader } from 'lucide-react';

export default function StudentsPage() {
  const firestore = useFirestore();
  const studentsCollection = useMemo(() => collection(firestore, 'students'), [firestore]);
  const { data: students, isLoading } = useCollection<Student>(studentsCollection);

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
