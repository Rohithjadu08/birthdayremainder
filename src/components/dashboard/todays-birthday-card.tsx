'use client';

import type { Student } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TodaysBirthdayCardProps {
  students: Student[];
}

export default function TodaysBirthdayCard({ students }: TodaysBirthdayCardProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const [emailContent, setEmailContent] = useState<GenerateBirthdayEmailOutput | null>(null);
  const [isPreparingEmail, setIsPreparingEmail] = useState(false);

  // A stable key based on the students celebrating their birthday today.
  const studentIds = useMemo(() => students.map(s => s.id).sort().join(','), [students]);

  useEffect(() => {
    // Guard against running if there are no birthdays, no user, or on the server.
    if (typeof window === 'undefined' || students.length === 0 || !user) {
      return;
    }

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const notificationKey = `birthdayNotification_${user.uid}_${todayStr}`;
    
    // Show a toast notification once per day
    if (!sessionStorage.getItem(notificationKey)) {
        const capitalizedNames = students.map(s => capitalizeName(s.name));
        let description: string;
        if (students.length === 1) {
            description = `It's ${capitalizedNames[0]}'s birthday today!`;
        } else {
            const lastName = capitalizedNames.pop();
            description = `It's ${capitalizedNames.join(', ')} and ${lastName}'s birthday today!`;
        }
        toast({
            title: "🎉 Happy Birthday!",
            description: description,
            duration: 9000,
        });
        sessionStorage.setItem(notificationKey, 'true');
    }
    
    // Prepare email content in the background
    const prepareEmail = async () => {
        setIsPreparingEmail(true);
        try {
            const studentInfo = students.map(s => ({ name: s.name, department: s.department }));
            const content = await generateBirthdayEmail({
              students: studentInfo,
              professorName: user.displayName || 'Professor',
            });
            setEmailContent(content);
        } catch (error) {
            console.error("Failed to generate birthday email:", error);
            toast({
              variant: "destructive",
              title: "Email Preparation Failed",
              description: "Could not generate the reminder email content.",
            });
        } finally {
            setIsPreparingEmail(false);
        }
    };
    
    prepareEmail();

  }, [studentIds, students, user, toast]); // Rerun only when the list of students with birthdays changes

  const handleOpenEmail = () => {
    if (!emailContent || !user?.email) {
        toast({
            variant: "destructive",
            title: "Email Not Ready",
            description: "The email content is still being prepared or your email is not available."
        });
        return;
    }
    const mailtoLink = `mailto:${user.email}?subject=${encodeURIComponent(emailContent.subject)}&body=${encodeURIComponent(emailContent.body)}`;
    window.open(mailtoLink);
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
            <CardDescription>
                It's time to celebrate! Click the button below to open a pre-written reminder in your email client.
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
        
        <div className="mt-6">
             <Alert>
                <Mail className="h-4 w-4" />
                <AlertTitle>Ready to Send Your Wishes?</AlertTitle>
                <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2">
                    <p>For your security, your browser requires one click to open your email app.</p>
                    <Button onClick={handleOpenEmail} disabled={isPreparingEmail || !emailContent} className="w-full sm:w-auto mt-2 sm:mt-0">
                        {isPreparingEmail ? 'Preparing...' : 'Open Reminder Email'}
                    </Button>
                </AlertDescription>
            </Alert>
        </div>

      </CardContent>
      <Confetti />
    </Card>
  );
}
