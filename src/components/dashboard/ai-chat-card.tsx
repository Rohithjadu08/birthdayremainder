'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Wand2, Sparkles } from 'lucide-react';
import type { Student } from '@/lib/types';
import { generateBirthdayWish } from '@/ai/flows/generate-birthday-wish-flow';
import { useToast } from '@/hooks/use-toast';
import { capitalizeName } from '@/lib/utils';

interface AiChatCardProps {
  students: Student[];
}

export default function AiChatCard({ students }: AiChatCardProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [wishes, setWishes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateWishes = async () => {
    if (!selectedStudentId) {
      toast({
        variant: 'destructive',
        title: 'No student selected',
        description: 'Please select a student to get birthday wish ideas.',
      });
      return;
    }

    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return;

    setIsLoading(true);
    setWishes([]);

    try {
      const result = await generateBirthdayWish({
        studentName: student.name,
        studentDepartment: student.department,
        studentSection: student.section || '',
      });
      setWishes(result.wishes);
    } catch (error) {
      console.error("Error generating wishes:", error);
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: 'Could not generate birthday wishes. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (students.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wand2 className="text-primary" />
                    Agentverse
                </CardTitle>
                <CardDescription>
                    Get creative ideas for birthday wishes from Agentverse.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-center py-8">
                    Add students to start generating birthday wishes.
                </p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="text-primary" />
          Agentverse
        </CardTitle>
        <CardDescription>
          Select any student and let Agentverse help you craft the perfect birthday message, anytime.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a student..." />
            </SelectTrigger>
            <SelectContent>
              {students.map(student => (
                <SelectItem key={student.id} value={student.id}>
                  {capitalizeName(student.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateWishes} disabled={isLoading || !selectedStudentId} className="w-full sm:w-auto">
            {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {isLoading ? 'Generating...' : 'Get Wish Ideas'}
          </Button>
        </div>

        {wishes.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold">Here are a few ideas:</h4>
            <ul className="list-disc list-inside space-y-3 pl-4">
              {wishes.map((wish, index) => (
                <li key={index} className="text-foreground/90">{wish}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
