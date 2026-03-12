'use client';

import { useMemo } from 'react';
import { getTodaysBirthdays, getUpcomingBirthdays } from '@/lib/data';
import TodaysBirthdayCard from '@/components/dashboard/todays-birthday-card';
import AiChatCard from '@/components/dashboard/ai-chat-card';
import StatCard from '@/components/dashboard/stat-card';
import UpcomingBirthdaysCard from '@/components/dashboard/upcoming-birthdays-card';
import { Users, Cake, CalendarClock, Loader } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Student } from '@/lib/types';


export default function DashboardPage() {
  const firestore = useFirestore();
  const studentsCollection = useMemoFirebase(() => collection(firestore, 'students'), [firestore]);
  const { data: allStudents, isLoading } = useCollection<Student>(studentsCollection);

  const todaysBirthdays = useMemo(() => {
    if (!allStudents) return [];
    return getTodaysBirthdays(allStudents);
  }, [allStudents]);

  const upcomingBirthdays = useMemo(() => {
    if (!allStudents) return [];
    return getUpcomingBirthdays(allStudents);
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

      <AiChatCard studentsWithTodaysBirthday={todaysBirthdays} />
      
      <UpcomingBirthdaysCard students={upcomingBirthdays} />

    </div>
  );
}
