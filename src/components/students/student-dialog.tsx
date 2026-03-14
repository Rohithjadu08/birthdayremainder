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
import { useFirestore, useStorage } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

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
  const storage = useStorage();
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
        let submissionData = { ...values };

        const photoValue = values.photoUrl;
        
        // If a new file is uploaded, get its URL
        if (photoValue && typeof photoValue === 'object' && photoValue.length > 0) {
            const file = photoValue[0] as File;
            toast({ description: "Uploading photo..." });
            const imagePath = `student-photos/${values.rollNumber || Date.now()}-${file.name}`;
            const storageRef = ref(storage, imagePath);
            await uploadBytes(storageRef, file);
            submissionData.photoUrl = await getDownloadURL(storageRef);
        } else if (student) {
            // If editing and no new file is chosen, keep the existing photo URL
            submissionData.photoUrl = student.photoUrl;
        } else {
            // If creating and no file, set to empty so a placeholder can be used
            submissionData.photoUrl = '';
        }

        if (student) {
            await updateStudent(firestore, student.id, submissionData);
            toast({ title: "Success!", description: "Student updated successfully." });
        } else {
            const { id, ...newStudentData } = submissionData;
            await createStudent(firestore, newStudentData as any);
            toast({ title: "Success!", description: "Student added successfully." });
        }
        setIsOpen(false);
    } catch (error) {
        console.error("Form submission error:", error);
        toast({
            title: "Uh oh! Something went wrong.",
            description: "An unexpected error occurred during submission.",
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
                render={({ field: { onChange, ...restField } }) => (
                    <FormItem>
                        <FormLabel>Photo</FormLabel>
                        {student?.photoUrl && (
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={student.photoUrl} alt={student.name} />
                                    <AvatarFallback>{student.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <p className="text-sm text-muted-foreground">Current photo.</p>
                            </div>
                        )}
                        <FormControl>
                            <Input 
                                type="file" 
                                accept="image/*,.pdf"
                                onChange={(e) => onChange(e.target.files)}
                                {...restField}
                                className="pt-2"
                             />
                        </FormControl>
                        <FormDescription>
                            Upload a photo (image or PDF). Leave blank to keep the current photo.
                        </FormDescription>
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
