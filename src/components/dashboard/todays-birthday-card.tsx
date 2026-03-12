'use client';

import type { Student } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PartyPopper, Mail, Loader2 } from 'lucide-react';
import Confetti from '@/components/shared/confetti';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { generateBirthdayEmail } from '@/ai/flows/generate-birthday-email-flow';
import type { GenerateBirthdayEmailOutput } from '@/ai/flows/generate-birthday-email-flow';


interface TodaysBirthdayCardProps {
  students: Student[];
}

export default function TodaysBirthdayCard({ students }: TodaysBirthdayCardProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (students.length > 0) {
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
    }
  }, [students, toast]);

  const handleSendReminder = async () => {
    if (!user || students.length === 0) return;
    setIsGenerating(true);

    try {
      const studentInfo = students.map(s => ({ name: s.name, department: s.department }));
      const emailContent: GenerateBirthdayEmailOutput = await generateBirthdayEmail({
        students: studentInfo,
        professorName: user.displayName || 'Professor',
      });
      
      const mailtoLink = `mailto:${user.email}?subject=${encodeURIComponent(emailContent.subject)}&body=${encodeURIComponent(emailContent.body)}`;
      window.location.href = mailtoLink;

    } catch (error) {
      console.error("Failed to generate birthday email:", error);
      toast({
        variant: "destructive",
        title: "Could not generate email",
        description: "There was an error while trying to create the reminder email.",
      });
    } finally {
      setIsGenerating(false);
    }
  };


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
      <CardFooter>
        <Button onClick={handleSendReminder} disabled={isGenerating || !user} className="w-full">
            {isGenerating ? <Loader2 className="animate-spin" /> : <Mail />}
            {isGenerating ? 'Generating...' : 'Send Email Reminder to Myself'}
        </Button>
      </CardFooter>
      <Confetti />
    </Card>
  );
}
