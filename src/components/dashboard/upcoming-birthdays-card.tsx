import type { Student } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarClock } from 'lucide-react';
import { format } from 'date-fns';

interface UpcomingBirthdaysCardProps {
  students: Student[];
}

export default function UpcomingBirthdaysCard({ students }: UpcomingBirthdaysCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="text-primary" />
          Upcoming Birthdays (Next 7 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {students.length > 0 ? (
          <div className="space-y-4">
            {students.map((student) => (
              <div key={student.id} className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                   <AvatarImage src={student.photoUrl} alt={student.name} data-ai-hint={student.imageHint} />
                   <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{student.name}</p>
                  <p className="text-sm text-muted-foreground">{student.department}, Section {student.section}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-medium">
                        {format(new Date(student.birthday), 'MMMM d')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {format(new Date(student.birthday), 'eeee')}
                    </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No birthdays in the next 7 days.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
