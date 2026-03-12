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
import { useFirestore } from '@/firebase';
import { createStudent } from '@/lib/student-actions';
import { Loader2 } from 'lucide-react';
import type { Student } from '@/lib/types';
import { studentSchema } from '@/lib/student-schema';
import { extractStudentsFromPdf } from '@/ai/flows/extract-students-flow';

interface StudentImportDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function StudentImportDialog({ isOpen, setIsOpen }: StudentImportDialogProps) {
  const firestore = useFirestore();
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

      for (const studentData of studentsToImport) {
        // Add empty photoUrl for validation
        const validationData = { ...studentData, photoUrl: '' };
        const validation = studentSchema.safeParse(validationData);

        if (validation.success) {
          try {
            const dataToCreate: Omit<Student, 'id' | 'imageHint' | 'photoUrl'> & { photoUrl?: string } = {
                name: validation.data.name,
                rollNumber: validation.data.rollNumber,
                department: validation.data.department,
                birthday: validation.data.birthday,
            };
            await createStudent(firestore, dataToCreate);
            successCount++;
          } catch (error) {
            errorCount++;
            console.error("Firestore creation error:", error);
          }
        } else {
            errorCount++;
            console.error("Validation failed for row:", studentData, validation.error.flatten().fieldErrors);
        }
      }
      
      toast({
        title: 'Import Complete',
        description: `${successCount} students imported successfully. ${errorCount} rows failed.`,
      });
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

        const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) {
            toast({ variant: 'destructive', title: 'Empty or invalid CSV file.' });
            setIsImporting(false);
            return;
        }
        const headers = lines[0].split(',').map(h => h.trim());
        const requiredHeaders = ['name', 'rollNumber', 'department', 'birthday'];
        const hasHeaders = requiredHeaders.every(h => headers.includes(h));

        if (!hasHeaders) {
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
        const birthdayIndex = headers.indexOf('birthday');
        
        const rows = lines.slice(1);
        const studentsToImport = rows.map(row => {
            const data = row.split(',');
            return {
              name: data[nameIndex]?.trim(),
              rollNumber: data[rollNumberIndex]?.trim(),
              department: data[departmentIndex]?.trim(),
              birthday: data[birthdayIndex]?.trim(),
            };
        });

        await processImportedStudents(studentsToImport);
        
        setIsImporting(false);
        setFile(null);
        setIsOpen(false);
    };
    reader.readAsText(file);
  }

  const handlePdfImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
        const dataUri = e.target?.result;
        if (typeof dataUri !== 'string') {
            toast({ variant: 'destructive', title: 'Could not read PDF file.' });
            setIsImporting(false);
            return;
        }
        
        try {
            const result = await extractStudentsFromPdf({ pdfDataUri: dataUri });
            await processImportedStudents(result.students);
        } catch (error) {
            console.error("PDF extraction error:", error);
            toast({
                variant: 'destructive',
                title: 'PDF Processing Failed',
                description: 'Could not extract student data from the PDF. Please ensure it is a text-based PDF with a clear table structure.',
            });
        } finally {
            setIsImporting(false);
            setFile(null);
            setIsOpen(false);
        }
    };
    reader.readAsDataURL(file);
  }

  const handleImport = async () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No file selected',
        description: 'Please select a CSV or PDF file to import.',
      });
      return;
    }
    setIsImporting(true);

    if (file.type === 'application/pdf') {
        handlePdfImport(file);
    } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        handleCsvImport(file);
    } else {
        toast({
            variant: 'destructive',
            title: 'Unsupported File Type',
            description: 'Please upload a CSV or a PDF file.',
        });
        setIsImporting(false);
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
            Select a CSV or PDF file to bulk-import students. For CSV, the file must have a header row with columns: name, rollNumber, department, birthday (in YYYY-MM-DD format). For PDF, the file should contain a table with the same information.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="file-upload">CSV or PDF File</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".csv,.pdf"
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
