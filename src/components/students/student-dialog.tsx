'use client';

import type { Student } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createStudent, updateStudent } from '@/lib/student-actions';
import { studentSchema } from '@/lib/student-schema';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { z } from 'zod';
import { useFirestore } from '@/firebase';

interface StudentSheetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  student: Student | null;
}

const departments = [
    "Artificial Intelligence and Machine Learning",
    "Computer Science",
    "Designing",
    "Information Technology",
    "Electronics",
    "Mechanical",
    "Civil"
];

export function StudentDialog({ isOpen, setIsOpen, student }: StudentSheetProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
        id: student?.id || undefined,
        name: student?.name || '',
        rollNumber: student?.rollNumber || '',
        department: student?.department || '',
        section: student?.section || '',
        birthday: student?.birthday || '',
        photoUrl: student?.photoUrl || '',
        phoneNumber: student?.phoneNumber || '',
    },
  });

  useEffect(() => {
    form.reset({
        id: student?.id || undefined,
        name: student?.name || '',
        rollNumber: student?.rollNumber || '',
        department: student?.department || '',
        section: student?.section || '',
        birthday: student?.birthday || '',
        photoUrl: student?.photoUrl || '',
        phoneNumber: student?.phoneNumber || '',
    })
  }, [student, form, isOpen])


  const onSubmit = async (values: z.infer<typeof studentSchema>) => {
    setIsSubmitting(true);
    try {
        if (student) {
            await updateStudent(firestore, student.id, values);
            toast({ title: "Success!", description: "Student updated successfully." });
        } else {
            const { id, ...newStudentData } = values;
            await createStudent(firestore, newStudentData);
            toast({ title: "Success!", description: "Student added successfully." });
        }
        setIsOpen(false);
    } catch (error) {
        console.error("Form submission error:", error);
        toast({
            title: "Uh oh! Something went wrong.",
            description: "An unexpected error occurred.",
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  };


  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{student ? 'Edit Student' : 'Add New Student'}</SheetTitle>
          <SheetDescription>
            {student ? "Update the student's details below." : "Enter the details for the new student."}
          </SheetDescription>
        </SheetHeader>
        
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid gap-4 py-4"
            >
             {student && <input type="hidden" {...form.register('id')} />}
             <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                        <Input placeholder="Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <FormField
                control={form.control}
                name="rollNumber"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Roll Number</FormLabel>
                    <FormControl>
                        <Input placeholder="20241001" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a department" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {departments.map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
             <FormField
                control={form.control}
                name="section"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Section</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., A" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <FormField
                control={form.control}
                name="birthday"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Birthday</FormLabel>
                    <FormControl>
                        <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
             <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                        <Input type="tel" placeholder="+1 555-555-5555" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <FormField
                control={form.control}
                name="photoUrl"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Photo URL (Optional)</FormLabel>
                    <FormControl>
                        <Input placeholder="https://example.com/photo.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <SheetFooter className="mt-4">
                <SheetClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </SheetClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (student ? 'Saving...' : 'Adding...') : (student ? 'Save Changes' : 'Add Student')}
                </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
