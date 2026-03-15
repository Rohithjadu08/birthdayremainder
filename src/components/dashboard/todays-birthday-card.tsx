'use client';

import type { Student } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PartyPopper, MessageCircle, Mail } from 'lucide-react';
import Confetti from '@/components/shared/confetti';
import { useEffect, useMemo, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { generateBirthdayEmail } from '@/ai/flows/generate-birthday-email-flow';
import type { GenerateBirthdayEmailOutput } from '@/ai/flows/generate-birthday-email-flow';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { capitalizeName } from '@/lib/utils';


interface TodaysBirthdayCardProps {
  students: Student[];
}

export default function TodaysBirthdayCard({ students }: TodaysBirthdayCardProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);

  const studentIds = useMemo(() => students.map(s => s.id).sort().join(','), [students]);

  useEffect(() => {
    // This effect runs on the client after hydration.
    // It shows a one-time notification.

    if (typeof window === 'undefined' || students.length === 0 || !user) {
      return;
    }

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const notificationKey = `birthdayNotification_${user.uid}_${todayStr}`;

    if (sessionStorage.getItem(notificationKey)) {
      return;
    }

    // --- Show Toast Notification ---
    const capitalizedNames = students.map(s => capitalizeName(s.name));
    let description;
    if (students.length === 1) {
      description = `It's ${capitalizedNames[0]}'s birthday today! Don't forget to wish them.`;
    } else {
      const lastName = capitalizedNames.pop();
      description = `It's ${capitalizedNames.join(', ')} and ${lastName}'s birthday today! Don't forget to wish them.`;
    }

    toast({
      title: "🎉 Happy Birthday!",
      description: description,
      duration: 9000,
    });
    
    // Mark as actioned for this session to avoid re-triggering on navigation.
    sessionStorage.setItem(notificationKey, 'true');

  }, [studentIds, students, user, toast]);

  const handleSendReminderEmail = async () => {
    if (!user || students.length === 0) return;

    setIsGeneratingEmail(true);
    toast({
      description: "Generating your reminder email...",
    });

    try {
      const studentInfo = students.map(s => ({ name: s.name, department: s.department }));
      const emailContent: GenerateBirthdayEmailOutput = await generateBirthdayEmail({
        students: studentInfo,
        professorName: user.displayName || 'Professor',
      });
      
      const mailtoLink = `mailto:${user.email}?subject=${encodeURIComponent(emailContent.subject)}&body=${encodeURIComponent(emailContent.body)}`;
      
      window.open(mailtoLink, '_blank');
      
    } catch (error) {
      console.error("Failed to generate birthday email:", error);
      toast({
        variant: "destructive",
        title: "Email Generation Failed",
        description: "Could not prepare the reminder email.",
      });
    } finally {
        setIsGeneratingEmail(false);
    }
  };


  if (students.length === 0) {
    return null;
  }

  return (
    <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-start justify-between">
            <div>
                <CardTitle className="flex items-center gap-2">
                <PartyPopper className="text-accent" />
                Happy Birthday!
                </CardTitle>
                 <p className="text-muted-foreground text-sm mt-2">
                    Wishing a very happy birthday to the following students today!
                </p>
            </div>
            <Button variant="outline" onClick={handleSendReminderEmail} disabled={isGeneratingEmail}>
                <Mail className="mr-2 h-4 w-4" />
                {isGeneratingEmail ? 'Generating...' : 'Send Email Reminder'}
            </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {students.map((student) => (
            <div key={student.id} className="flex items-center gap-4 p-4 rounded-lg bg-accent/10">
              <Avatar className="h-12 w-12">
                <AvatarImage src={student.photoUrl} alt={student.name} data-ai-hint={student.imageHint} />
                <AvatarFallback>{capitalizeName(student.name).charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{capitalizeName(student.name)}</p>
                <p className="text-sm text-muted-foreground">{student.department}, Section {student.section}</p>
              </div>
              {student.phoneNumber && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const message = encodeURIComponent(`Happy Birthday, ${student.name}! Wishing you all the best.`);
                    const whatsappUrl = `https://wa.me/${student.phoneNumber.replace(/[^0-9]/g, '')}?text=${message}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                  className="rounded-full h-10 w-10 bg-green-500/10 hover:bg-green-500/20"
                  aria-label={`Wish ${student.name} on WhatsApp`}
                >
                  <MessageCircle className="h-5 w-5 text-green-500" />
                  <span className="sr-only">Wish on WhatsApp</span>
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <Confetti />
    </Card>
  );
}
