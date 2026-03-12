import { getStudents } from '@/lib/data';
import BirthdayCalendar from '@/components/calendar/birthday-calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function CalendarPage() {
    const students = await getStudents();
    return (
        <Card>
            <CardHeader>
                <CardTitle>Birthday Calendar</CardTitle>
                <CardDescription>A calendar view of all student birthdays.</CardDescription>
            </CardHeader>
            <CardContent>
                <BirthdayCalendar students={students} />
            </CardContent>
        </Card>
    );
}
