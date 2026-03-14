'use client';

import { useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { createStudent } from '@/lib/student-actions';
import { Loader2 } from 'lucide-react';
import { studentSchema } from '@/lib/student-schema';
import { extractStudentsFromPdf } from '@/ai/flows/extract-students-flow';

interface StudentImportDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function StudentImportDialog({ isOpen, setIsOpen }: StudentImportDialogProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };
  
  const processImportedStudents = async (studentsToImport: any[]) => {
      let successCount = 0;
      let errorCount = 0;

      if (!user) {
          toast({
              variant: 'destructive',
              title: 'Authentication Error',
              description: 'You must be logged in to import students.',
          });
          setIsImporting(false);
          return;
      }
      
      if (studentsToImport.length === 0) {
        toast({
          variant: "destructive",
          title: 'No Valid Data Found',
          description: 'No student records with a name and roll number were found in the file.',
        });
        setIsImporting(false);
        setFile(null);
        setIsOpen(false);
        return;
      }

      for (const studentData of studentsToImport) {
        const cleanedData = {
          name: studentData.name?.trim() || '',
          rollNumber: studentData.rollNumber?.trim() || '',
          department: studentData.department?.trim() || '',
          section: studentData.section?.trim() || '',
          birthday: studentData.birthday?.trim() || '',
          photoUrl: '', // For validation
          phoneNumber: studentData.phoneNumber?.trim() || undefined,
        };

        const validation = studentSchema.safeParse(cleanedData);

        if (validation.success) {
          try {
            await createStudent(firestore, user.uid, validation.data);
            successCount++;
          } catch (error) {
            errorCount++;
          }
        } else {
          errorCount++;
        }
      }
      
      if (errorCount > 0 && successCount > 0) {
        toast({
          variant: "destructive",
          title: 'Import Complete with Errors',
          description: `${successCount} students imported. ${errorCount} rows failed due to invalid data.`,
        });
      } else if (errorCount > 0 && successCount === 0) {
         toast({
          variant: "destructive",
          title: 'Import Failed',
          description: 'No students were imported. Please check the file format and data.',
        });
      }
      else if (successCount > 0) {
        toast({
          title: 'Import Complete',
          description: `${successCount} students imported successfully.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: 'No Data Imported',
          description: 'No valid student data was found in the file.',
        });
      }

      setIsImporting(false);
      setFile(null);
      setIsOpen(false);
  }


  const handleCsvImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
        const text = e.target?.result;
        if (typeof text !== 'string') {
            toast({ variant: 'destructive', title: 'Could not read file.' });
            setIsImporting(false);
            return;
        }

        const lines = text.split(/\r\n?|\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) {
            toast({ variant: 'destructive', title: 'Empty or invalid CSV file. A header row and at least one data row are required.' });
            setIsImporting(false);
            return;
        }
        const headers = lines[0].split(',').map(h => h.trim());
        const requiredHeaders = ['name', 'rollNumber', 'department', 'section', 'birthday'];
        const hasRequiredHeaders = requiredHeaders.every(h => headers.includes(h));

        if (!hasRequiredHeaders) {
            toast({
                variant: 'destructive',
                title: 'Invalid CSV Headers',
                description: `File must include headers: ${requiredHeaders.join(', ')}`,
            });
            setIsImporting(false);
            return;
        }
        
        const nameIndex = headers.indexOf('name');
        const rollNumberIndex = headers.indexOf('rollNumber');
        const departmentIndex = headers.indexOf('department');
        const sectionIndex = headers.indexOf('section');
        const birthdayIndex = headers.indexOf('birthday');
        const phoneNumberIndex = headers.indexOf('phoneNumber'); // Optional
        
        const rows = lines.slice(1);
        const studentsToImport = rows.map(row => {
            const data = row.split(',');
            return {
              name: data[nameIndex]?.trim(),
              rollNumber: data[rollNumberIndex]?.trim(),
              department: data[departmentIndex]?.trim(),
              section: data[sectionIndex]?.trim(),
              birthday: data[birthdayIndex]?.trim(),
              phoneNumber: phoneNumberIndex !== -1 ? data[phoneNumberIndex]?.trim() : undefined,
            };
        }).filter(s => s.name && s.rollNumber);

        await processImportedStudents(studentsToImport);
    };
    reader.readAsText(file);
  }

  const handleAiImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
        const dataUri = e.target?.result;
        if (typeof dataUri !== 'string') {
            toast({ variant: 'destructive', title: 'Could not read the selected file.' });
            setIsImporting(false);
            return;
        }
        
        try {
            const result = await extractStudentsFromPdf({ pdfDataUri: dataUri });
            const filteredStudents = result.students.filter(student => student && student.name && student.rollNumber);
            await processImportedStudents(filteredStudents);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'AI Processing Failed',
                description: 'Could not extract student data from the file. Please ensure it is a text-based document with a clear structure.',
            });
             setIsImporting(false);
        }
    };
    reader.readAsDataURL(file);
  }

  const handleImport = async () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No file selected',
        description: 'Please select a file to import.',
      });
      return;
    }
    setIsImporting(true);

    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        handleCsvImport(file);
    } else {
        handleAiImport(file);
    }
  };

  const closeDialog = () => {
    setFile(null);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Students</DialogTitle>
          <DialogDescription>
            Select a file to bulk-import students. CSV files must have a header row with columns: name, rollNumber, department, section, birthday, and optionally phoneNumber. Other file formats like PDF or text files will be processed by AI.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="file-upload">Upload File</Label>
            <Input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeDialog} disabled={isImporting}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isImporting || !file}>
            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isImporting ? 'Importing...' : 'Start Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
