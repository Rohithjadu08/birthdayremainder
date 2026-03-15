'use client';

import type { Student } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PartyPopper, MessageCircle, Mail, Loader2 } from 'lucide-react';
import Confetti from '@/components/shared/confetti';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { capitalizeName } from '@/lib/utils';
import { generateBirthdayEmail } from '@/ai/flows/generate-birthday-email-flow';

interface TodaysBirthdayCardProps {
  students: Student[];
}

export default function TodaysBirthdayCard({ students }: TodaysBirthdayCardProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);

  // A stable key based on the students celebrating their birthday today.
  const studentIds = useMemo(() => students.map(s => s.id).sort().join(','), [students]);

  const handlePrepareEmail = useCallback(async () => {
    if (!user || students.length === 0) {
      return; // Don't show toast if there's nothing to do.
    }
    // Prevent multiple concurrent executions
    if (isGeneratingEmail) return;

    setIsGeneratingEmail(true);
    try {
      const studentInfo = students.map(s => ({ name: capitalizeName(s.name), department: s.department }));
      const result = await generateBirthdayEmail({
        students: studentInfo,
        professorName: user.displayName || 'Professor',
      });

      if (user.email) {
        const mailtoLink = `mailto:${user.email}?subject=${encodeURIComponent(result.subject)}&body=${encodeURIComponent(result.body)}`;
        window.location.href = mailtoLink;
      } else {
         toast({
          variant: "destructive",
          title: "Email Not Found",
          description: "Your email address is not available to create a reminder.",
        });
      }
    } catch (error) {
      console.error("Failed to generate or open email:", error);
      toast({
        variant: "destructive",
        title: "Could not prepare email",
        description: "There was an error generating the birthday reminder email.",
      });
    } finally {
      setIsGeneratingEmail(false);
    }
  }, [students, user, toast, isGeneratingEmail]);

  useEffect(() => {
    if (typeof window === 'undefined' || students.length === 0 || !user) {
      return;
    }
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const notificationKey = `birthdayNotification_${user.uid}_${todayStr}`;

    if (!sessionStorage.getItem(notificationKey)) {
      // Automatically attempt to prepare the email when a birthday is detected.
      handlePrepareEmail();
      
      // Notify the user that the action was attempted.
      toast({
        title: '🎉 Birthday Alert!',
        description: "A reminder email has been prepared. Check your email client or allow popups if you don't see it.",
        duration: 9000,
      });

      sessionStorage.setItem(notificationKey, 'true');
    }
  }, [studentIds, students, user, toast, handlePrepareEmail]);


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
            <CardDescription>
                It's time to celebrate! Send a wish to your students.
            </CardDescription>
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
       <CardFooter>
        <Button onClick={handlePrepareEmail} disabled={isGeneratingEmail} className="w-full">
           {isGeneratingEmail ? <Loader2 className="animate-spin" /> : <Mail />}
           {isGeneratingEmail ? 'Preparing...' : 'Prepare Reminder Email'}
        </Button>
      </CardFooter>
      <Confetti />
    </Card>
  );
}
