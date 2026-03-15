'use client';

import { useState, useEffect } from 'react';
import type { Student } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Cake } from 'lucide-react';
import { format } from 'date-fns';
import type { DayContentProps } from 'react-day-picker';
import { capitalizeName } from '@/lib/utils';

interface BirthdayCalendarProps {
  students: Student[];
}

export default function BirthdayCalendar({ students }: BirthdayCalendarProps) {
  const [birthdaysByDate, setBirthdaysByDate] = useState(new Map<string, Student[]>());
  const [birthdayDates, setBirthdayDates] = useState<Date[]>([]);

  useEffect(() => {
    // This effect runs only on the client, after hydration, preventing mismatch
    const map = new Map<string, Student[]>();
    const currentYear = new Date().getFullYear();
    students.forEach(student => {
      // Robustly parse 'YYYY-MM-DD' to avoid timezone issues.
      const [year, month, day] = student.birthday.split('-').map(Number);
      // Create date in local timezone. Month is 0-indexed.
      const displayDate = new Date(currentYear, month - 1, day);
      
      const key = format(displayDate, 'yyyy-MM-dd');
      
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(student);
    });
    setBirthdaysByDate(map);

    const dates = Array.from(map.keys()).map(key => {
        const [year, month, day] = key.split('-').map(Number);
        return new Date(year, month - 1, day);
    });
    setBirthdayDates(dates);
  }, [students]);

  const CustomDayContent = (props: DayContentProps) => {
    const { date, displayMonth } = props;
    
    // Do not render for days outside the current month, but keep the container
    if (date.getMonth() !== displayMonth.getMonth()) {
        return <div className="flex h-full w-full items-center justify-center">{format(date, 'd')}</div>;
    }

    const key = format(date, 'yyyy-MM-dd');
    const studentsOnDay = birthdaysByDate.get(key);

    if (studentsOnDay) {
      return (
        <Popover>
          <PopoverTrigger asChild onPointerDown={(e) => e.preventDefault()}>
            <div className="relative flex h-full w-full items-center justify-center">
              {format(date, 'd')}
              <Cake className="absolute bottom-0.5 right-0.5 h-3 w-3" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-80 z-50">
            <div className="space-y-4">
                <div className="text-center">
                    <h4 className="font-semibold leading-none">Birthdays</h4>
                    <p className="text-sm text-muted-foreground">{format(date, 'MMMM d')}</p>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {studentsOnDay.map(student => (
                    <div key={student.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={student.photoUrl} alt={student.name} data-ai-hint={student.imageHint} />
                            <AvatarFallback>{capitalizeName(student.name).charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-medium leading-none">{capitalizeName(student.name)}</p>
                            <p className="text-xs text-muted-foreground">{student.department}{student.section ? `, Section ${student.section}`: ''}</p>
                        </div>
                    </div>
                ))}
                </div>
            </div>
          </PopoverContent>
        </Popover>
      );
    }
    return <div className="flex h-full w-full items-center justify-center">{format(date, 'd')}</div>;
  };

  return (
    <Calendar
      className="rounded-md border"
      modifiers={{ birthdays: birthdayDates }}
      modifiersClassNames={{
        birthdays: 'bg-primary/90 text-primary-foreground rounded-md hover:bg-primary/80 focus:bg-primary focus:text-primary-foreground',
      }}
      components={{
        DayContent: CustomDayContent,
      }}
    />
  );
}
