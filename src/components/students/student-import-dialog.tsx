'use client';

import { useState, useMemo } from 'react';
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
import Papa from 'papaparse';
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
      if (selectedFile.type === 'text/csv' || selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please upload a CSV or PDF file.',
        });
      }
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
        
        // Clean and normalize keys from CSV/AI
        const studentData: Partial<StagingStudent> = Object.entries(rawStudent).reduce((acc, [key, value]) => {
            const trimmedKey = key.trim();
            if (value !== null && value !== '') {
                acc[trimmedKey as keyof StagingStudent] = value as any;
            }
            return acc;
        }, {} as Record<string, any>);


        // Coerce birthday to a valid date format if possible
        if (studentData.birthday) {
            try {
                const date = new Date(studentData.birthday);
                studentData.birthday = date.toISOString().split('T')[0];
            } catch (e) {
                studentData.birthday = ''; // Invalidate if unparsable
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
        description: `${successCount} students imported successfully. ${validationErrorCount} rows had invalid data. ${dbErrorCount} rows failed to save.`,
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

    if (file.type === 'text/csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processImportedStudents(results.data);
        },
        error: (error: any) => {
          toast({ variant: 'destructive', title: 'CSV Parsing Error', description: error.message });
          setIsImporting(false);
        },
      });
    } else if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const dataUri = reader.result as string;
          const result = await extractStudentsFromFile({ fileDataUri: dataUri });
          if(result && result.students) {
            processImportedStudents(result.students);
          } else {
            throw new Error("AI model returned no students.");
          }
        } catch (error: any) {
          toast({ variant: 'destructive', title: 'PDF Extraction Failed', description: error.message || 'Could not process PDF file.' });
          setIsImporting(false);
        }
      };
      reader.onerror = () => {
        toast({ variant: 'destructive', title: 'File Read Error', description: 'Could not read the selected file.' });
        setIsImporting(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Students</DialogTitle>
          <DialogDescription>
            Upload a CSV or PDF file to bulk-add students. Make sure your file includes columns for at least 'name', 'rollNumber', 'department', 'section', and 'birthday'.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            type="file"
            accept=".csv, application/pdf"
            onChange={handleFileChange}
            disabled={isImporting}
          />
          {isImporting && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Importing students, please wait...</p>
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
