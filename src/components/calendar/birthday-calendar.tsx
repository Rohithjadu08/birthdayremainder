'use client';

import { useMemo } from 'react';
import type { Student } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Cake } from 'lucide-react';
import { format } from 'date-fns';

interface BirthdayCalendarProps {
  students: Student[];
}

export default function BirthdayCalendar({ students }: BirthdayCalendarProps) {
  const birthdaysByDate = useMemo(() => {
    const map = new Map<string, Student[]>();
    students.forEach(student => {
      const date = new Date(student.birthday);
      // Normalize to current year for display consistency
      const currentYear = new Date().getFullYear();
      const displayDate = new Date(currentYear, date.getMonth(), date.getDate());
      const key = format(displayDate, 'yyyy-MM-dd');
      
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(student);
    });
    return map;
  }, [students]);

  const birthdayDates = Array.from(birthdaysByDate.keys()).map(key => new Date(key));

  const DayContent = (day: Date) => {
    const key = format(day, 'yyyy-MM-dd');
    const studentsOnDay = birthdaysByDate.get(key);

    if (studentsOnDay) {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <div className="relative w-full h-full flex items-center justify-center">
              {format(day, 'd')}
              <Cake className="absolute bottom-0 right-0 h-3 w-3 text-accent" />
            </div>
          </PopoverTrigger>
          <PopoverContent>
            <div className="space-y-2">
                <h4 className="font-medium leading-none">Birthdays on {format(day, 'MMMM d')}</h4>
                <div className="space-y-2">
                {studentsOnDay.map(student => (
                    <div key={student.id} className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={student.photoUrl} alt={student.name} data-ai-hint={student.imageHint} />
                            <AvatarFallback>{student.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.department}, Section {student.section}</p>
                        </div>
                    </div>
                ))}
                </div>
            </div>
          </PopoverContent>
        </Popover>
      );
    }
    return format(day, 'd');
  };

  return (
    <Calendar
      mode="single"
      className="rounded-md border"
      modifiers={{ birthdays: birthdayDates }}
      modifiersClassNames={{
        birthdays: 'bg-primary/20 rounded-full',
      }}
      components={{
        DayContent: DayContent,
      }}
    />
  );
}
