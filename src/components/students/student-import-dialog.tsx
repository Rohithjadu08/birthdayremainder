'use client';

import { useState } from 'react';
import type { Student } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { createStudent } from '@/lib/student-actions';
import { studentSchema } from '@/lib/student-schema';
import { extractStudentsFromFile } from '@/ai/flows/extract-students-from-file-flow';
import { FileUp, Loader2 } from 'lucide-react';
import type { z } from 'zod';

interface StudentImportDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

type StagingStudent = Omit<z.infer<typeof studentSchema>, 'id' | 'userId' | 'photoUrl'>;

export function StudentImportDialog({ isOpen, setIsOpen }: StudentImportDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
    }
  };

  const resetState = () => {
    setFile(null);
    setIsImporting(false);
    setProgress(0);
  };

  const handleClose = () => {
    if (isImporting) return;
    resetState();
    setIsOpen(false);
  };
  
  const processImportedStudents = async (studentDataArray: any[]) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Not Authenticated', description: 'You must be logged in to import students.' });
        setIsImporting(false);
        return;
    }
    
    let successCount = 0;
    let validationErrorCount = 0;
    let dbErrorCount = 0;
    const totalStudents = studentDataArray.length;

    for (let i = 0; i < totalStudents; i++) {
        const rawStudent = studentDataArray[i];

        if (!rawStudent || Object.keys(rawStudent).length === 0) {
            validationErrorCount++;
            continue;
        }
        
        const studentData: Partial<StagingStudent> = Object.entries(rawStudent).reduce((acc, [key, value]) => {
            const trimmedKey = key.trim();
            if (value !== null && value !== '' && value !== undefined) {
                acc[trimmedKey as keyof StagingStudent] = String(value);
            }
            return acc;
        }, {} as Record<string, any>);


        if (studentData.birthday) {
          // AI is asked to format as YYYY-MM-DD. This is a final check.
          if (isNaN(Date.parse(studentData.birthday))) {
            delete studentData.birthday;
          }
        }
        
        const validation = studentSchema.safeParse(studentData);
        
        if (validation.success) {
            const wasSaved = await createStudent(firestore, user.uid, validation.data);
            if (wasSaved) {
                successCount++;
            } else {
                dbErrorCount++;
            }
        } else {
            validationErrorCount++;
        }
        setProgress(((i + 1) / totalStudents) * 100);
    }
    
    toast({
        title: 'Import Complete',
        description: `${successCount} students imported. ${validationErrorCount} rows had invalid data. ${dbErrorCount} rows failed to save.`,
        duration: 9000,
    });

    setIsImporting(false);
    handleClose();
  };

  const handleImport = async () => {
    if (!file) {
      toast({ variant: 'destructive', title: 'No File Selected', description: 'Please select a file to import.' });
      return;
    }

    setIsImporting(true);
    setProgress(0);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const dataUri = reader.result as string;
        const result = await extractStudentsFromFile({ fileDataUri: dataUri });
        if (result && result.students && result.students.length > 0) {
          processImportedStudents(result.students);
        } else {
          throw new Error("The AI could not extract student data. Please ensure the file contains clear information.");
        }
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Import Failed', description: error.message || 'Could not process the file.' });
        setIsImporting(false);
      }
    };
    reader.onerror = () => {
      toast({ variant: 'destructive', title: 'File Read Error', description: 'Could not read the selected file.' });
      setIsImporting(false);
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Students</DialogTitle>
          <DialogDescription>
            Upload a CSV, PDF, or text file to bulk-add students. The AI will extract details like name, roll number, department, and birthday.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            type="file"
            accept=".csv, application/pdf, .txt, .docx"
            onChange={handleFileChange}
            disabled={isImporting}
          />
          {isImporting && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">AI is processing your file, please wait...</p>
              <Progress value={progress} />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isImporting}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!file || isImporting}>
            {isImporting ? <Loader2 className="animate-spin" /> : <FileUp />}
            {isImporting ? 'Importing...' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
