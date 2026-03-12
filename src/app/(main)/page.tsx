import { getStudents, getTodaysBirthdays, getUpcomingBirthdays } from '@/lib/data';
import TodaysBirthdayCard from '@/components/dashboard/todays-birthday-card';
import StatCard from '@/components/dashboard/stat-card';
import UpcomingBirthdaysCard from '@/components/dashboard/upcoming-birthdays-card';
import { Users, Cake, CalendarClock } from 'lucide-react';
import { headers } from 'next/headers';

export default async function DashboardPage() {
  // We call our data fetching functions here
  const allStudents = await getStudents();
  const todaysBirthdays = await getTodaysBirthdays();
  const upcomingBirthdays = await getUpcomingBirthdays();

  // This ensures the page is dynamically rendered
  const nonce = headers().get('x-nonce');

  return (
    <div className="grid gap-6 md:gap-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard
          title="Total Students"
          value={allStudents.length.toString()}
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
      
      <UpcomingBirthdaysCard students={upcomingBirthdays} />

    </div>
  );
}
