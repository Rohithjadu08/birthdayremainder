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
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { createStudent, updateStudent, studentSchema, type State } from '@/lib/student-actions';
import { useFormStatus } from 'react-dom';
import { useActionState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { z } from 'zod';

interface StudentSheetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  student: Student | null;
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Student')}
    </Button>
  );
}

export function StudentDialog({ isOpen, setIsOpen, student }: StudentSheetProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  const form = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
        id: student?.id || undefined,
        name: student?.name || '',
        rollNumber: student?.rollNumber || '',
        department: student?.department || '',
        birthday: student?.birthday || '',
        photoUrl: student?.photoUrl || '',
    },
  });

  useEffect(() => {
    form.reset({
        id: student?.id || undefined,
        name: student?.name || '',
        rollNumber: student?.rollNumber || '',
        department: student?.department || '',
        birthday: student?.birthday || '',
        photoUrl: student?.photoUrl || '',
    })
  }, [student, form, isOpen])


  const action = student ? updateStudent : createStudent;
  const [state, formAction] = useActionState<State, FormData>(action, { message: '', errors: {} });

  useEffect(() => {
    if (state.message) {
      if(Object.keys(state.errors).length > 0) {
        toast({
          title: "Uh oh! Something went wrong.",
          description: state.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success!",
          description: state.message,
        })
        setIsOpen(false);
      }
    }
  }, [state, toast, setIsOpen]);

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
                ref={formRef}
                action={formAction}
                onSubmit={form.handleSubmit(() => formRef.current?.submit())}
                className="grid gap-4 py-4"
            >
             {student && <input type="hidden" name="id" value={student.id} />}
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
                    <FormControl>
                        <Input placeholder="Computer Science" {...field} />
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
                    <Button variant="outline">Cancel</Button>
                </SheetClose>
                <SubmitButton isEditing={!!student} />
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
