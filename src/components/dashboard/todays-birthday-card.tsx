'use client';

import type { Student } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PartyPopper } from 'lucide-react';
import Confetti from '@/components/shared/confetti';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { generateBirthdayEmail } from '@/ai/flows/generate-birthday-email-flow';
import type { GenerateBirthdayEmailOutput } from '@/ai/flows/generate-birthday-email-flow';
import { format } from 'date-fns';

interface TodaysBirthdayCardProps {
  students: Student[];
}

export default function TodaysBirthdayCard({ students }: TodaysBirthdayCardProps) {
  const { toast } = useToast();
  const { user } = useUser();

  useEffect(() => {
    const sendBirthdayReminders = async () => {
      if (students.length > 0 && user) {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const reminderSentKey = `reminderSent_${todayStr}_${user.uid}`;
        
        // Prevent reminder from being sent more than once per day per user
        if (localStorage.getItem(reminderSentKey)) {
          return;
        }

        // 1. Show toast notification
        let description;
        if (students.length === 1) {
          description = `It's ${students[0].name}'s birthday today!`;
        } else {
          const names = students.map(s => s.name);
          const lastName = names.pop();
          description = `It's ${names.join(', ')} and ${lastName}'s birthday today!`;
        }
        toast({
          title: "🎉 Happy Birthday!",
          description: description,
        });

        // 2. Automatically draft email reminder
        try {
          const studentInfo = students.map(s => ({ name: s.name, department: s.department }));
          const emailContent: GenerateBirthdayEmailOutput = await generateBirthdayEmail({
            students: studentInfo,
            professorName: user.displayName || 'Professor',
          });
          
          const mailtoLink = `mailto:${user.email}?subject=${encodeURIComponent(emailContent.subject)}&body=${encodeURIComponent(emailContent.body)}`;
          window.location.href = mailtoLink;
          
          // 3. Mark reminder as sent for today
          localStorage.setItem(reminderSentKey, 'true');

        } catch (error) {
          console.error("Failed to generate birthday email:", error);
          toast({
            variant: "destructive",
            title: "Could not generate email",
            description: "There was an error while trying to create the reminder email.",
          });
        }
      }
    };

    sendBirthdayReminders();
  }, [students, user, toast]);


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
