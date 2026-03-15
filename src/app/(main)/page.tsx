'use client';

import { useState, useEffect } from 'react';
import { getTodaysBirthdays, getUpcomingBirthdays } from '@/lib/data';
import TodaysBirthdayCard from '@/components/dashboard/todays-birthday-card';
import AiChatCard from '@/components/dashboard/ai-chat-card';
import StatCard from '@/components/dashboard/stat-card';
import UpcomingBirthdaysCard from '@/components/dashboard/upcoming-birthdays-card';
import { Users, Cake, CalendarClock, Loader } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Student } from '@/lib/types';


export default function DashboardPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const studentsCollection = useMemoFirebase(() => (user ? collection(firestore, 'users', user.uid, 'students') : null), [firestore, user]);
  const { data: allStudents, isLoading: studentsLoading } = useCollection<Student>(studentsCollection);

  const [todaysBirthdays, setTodaysBirthdays] = useState<Student[]>([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<Student[]>([]);

  const isLoading = isUserLoading || studentsLoading;

  useEffect(() => {
    if (allStudents) {
      setTodaysBirthdays(getTodaysBirthdays(allStudents));
      setUpcomingBirthdays(getUpcomingBirthdays(allStudents));
    }
  }, [allStudents]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><Loader className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="grid gap-6 md:gap-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard
          title="Total Students"
          value={allStudents?.length.toString() || '0'}
          icon={Users}
        />
        <StatCard
          title="Today's Birthdays"
          value={todaysBirthdays.length.toString()}
          icon={Cake}
        />
        <StatCard
          title="Upcoming in 7 days"
          value={upcomingBirthdays.length.toString()}
          icon={CalendarClock}
        />
      </div>

      <TodaysBirthdayCard students={todaysBirthdays} />

      <AiChatCard students={allStudents || []} />
      
      <UpcomingBirthdaysCard students={upcomingBirthdays} />

    </div>
  );
}
