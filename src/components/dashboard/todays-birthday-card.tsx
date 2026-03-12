'use client';

import type { Student } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PartyPopper } from 'lucide-react';
import Confetti from '@/components/shared/confetti';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface TodaysBirthdayCardProps {
  students: Student[];
}

export default function TodaysBirthdayCard({ students }: TodaysBirthdayCardProps) {
  const { toast } = useToast();

  useEffect(() => {
    if (students.length > 0) {
      let description;
      if (students.length === 1) {
        description = `It's ${students[0].name}'s birthday today!`;
      } else {
        const names = students.map(s => s.name);
        const last_name = names.pop();
        description = `It's ${names.join(', ')} and ${last_name}'s birthday today!`;
      }

      toast({
        title: "🎉 Happy Birthday!",
        description: description,
      });
    }
  }, [students, toast]);

  if (students.length === 0) {
    return null;
  }

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PartyPopper className="text-accent" />
          Happy Birthday!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Wishing a very happy birthday to the following students today!
        </p>
        <div className="space-y-4">
          {students.map((student) => (
            <div key={student.id} className="flex items-center gap-4 p-4 rounded-lg bg-accent/10">
              <Avatar className="h-12 w-12">
                <AvatarImage src={student.photoUrl} alt={student.name} data-ai-hint={student.imageHint} />
                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{student.name}</p>
                <p className="text-sm text-muted-foreground">{student.department}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <Confetti />
    </Card>
  );
}
