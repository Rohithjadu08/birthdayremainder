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

  const handleImport = async () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No file selected',
        description: 'Please select a CSV file to import.',
      });
      return;
    }

    setIsImporting(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result;
      if (typeof text !== 'string') {
        toast({ variant: 'destructive', title: 'Could not read file.' });
        setIsImporting(false);
        return;
      }

      // Basic CSV parsing, assumes no commas in fields
      const lines = text.split(/\r\n|\n/);
      const headers = lines[0].split(',').map(h => h.trim());
      // Expecting headers: name, rollNumber, department, birthday
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
      let successCount = 0;
      let errorCount = 0;

      for (const row of rows) {
        if (!row.trim()) continue;
        const data = row.split(',');
        const studentData = {
          name: data[nameIndex]?.trim(),
          rollNumber: data[rollNumberIndex]?.trim(),
          department: data[departmentIndex]?.trim(),
          birthday: data[birthdayIndex]?.trim(),
          photoUrl: '', // Will be auto-generated
        };

        const validation = studentSchema.safeParse(studentData);

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
          }
        } else {
            errorCount++;
            console.error("Validation failed for row:", row, validation.error.flatten().fieldErrors);
        }
      }
      
      toast({
        title: 'Import Complete',
        description: `${successCount} students imported successfully. ${errorCount} rows failed.`,
      });

      setIsImporting(false);
      setFile(null);
      setIsOpen(false);
    };

    reader.readAsText(file);
  };

  const closeDialog = () => {
    setFile(null);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Students from CSV</DialogTitle>
          <DialogDescription>
            Select a CSV file to bulk-import students. The file must have a header row with columns: name, rollNumber, department, birthday (in YYYY-MM-DD format).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="file-upload">CSV File</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".csv"
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
