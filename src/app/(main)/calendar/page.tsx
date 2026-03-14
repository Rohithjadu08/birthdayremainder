'use client';

import BirthdayCalendar from '@/components/calendar/birthday-calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Student } from '@/lib/types';
import { Loader } from 'lucide-react';


export default function CalendarPage() {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const studentsCollection = useMemoFirebase(() => (user ? collection(firestore, 'users', user.uid, 'students') : null), [firestore, user]);
    const { data: students, isLoading: studentsLoading } = useCollection<Student>(studentsCollection);

    const isLoading = isUserLoading || studentsLoading;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Birthday Calendar</CardTitle>
                <CardDescription>A calendar view of all student birthdays.</CardDescription>
            </CardHeader>
            <CardContent>
                 {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <BirthdayCalendar students={students || []} />
                )}
            </CardContent>
        </Card>
    );
}
