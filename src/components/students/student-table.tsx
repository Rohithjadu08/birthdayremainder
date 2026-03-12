'use client';

import { useState, useMemo } from 'react';
import type { Student } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Search, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { StudentDialog } from './student-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteStudent } from '@/lib/student-actions';
import { useFirestore } from '@/firebase';


interface StudentTableProps {
  students: Student[];
}

export default function StudentTable({ students: initialStudents }: StudentTableProps) {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const departments = useMemo(() => ['all', ...Array.from(new Set(initialStudents.map(s => s.department)))], [initialStudents]);

  const filteredStudents = useMemo(() => {
    return initialStudents.filter(student => {
      const searchMatch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const departmentMatch = departmentFilter === 'all' || student.department === departmentFilter;
      return searchMatch && departmentMatch;
    });
  }, [initialStudents, searchTerm, departmentFilter]);
  
  const handleAdd = () => {
    setSelectedStudent(null);
    setIsSheetOpen(true);
  };
  
  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsSheetOpen(true);
  };

  const handleDeleteConfirm = (student: Student) => {
    setSelectedStudent(student);
    setIsAlertOpen(true);
  };

  const handleDeleteAction = async () => {
    if (!selectedStudent) return;
    setIsSubmitting(true);
    await deleteStudent(firestore, selectedStudent.id);
    setIsSubmitting(false);
    setIsAlertOpen(false);
  };
  
  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex w-full sm:w-auto items-center gap-2">
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                    {departments.map(dep => <SelectItem key={dep} value={dep}>{dep === 'all' ? 'All Departments' : dep}</SelectItem>)}
                </SelectContent>
            </Select>
            <Button onClick={handleAdd} className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Student
            </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Roll Number</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="hidden md:table-cell">Birthday</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                         <AvatarImage src={student.photoUrl} alt={student.name} data-ai-hint={student.imageHint} />
                         <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{student.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{student.rollNumber}</TableCell>
                  <TableCell>{student.department}</TableCell>
                  <TableCell className="hidden md:table-cell">{format(new Date(student.birthday), 'MMMM d, yyyy')}</TableCell>
                  <TableCell>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(student)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteConfirm(student)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <StudentDialog 
        isOpen={isSheetOpen}
        setIsOpen={setIsSheetOpen}
        student={selectedStudent}
      />
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the student record for <span className="font-semibold">{selectedStudent?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAction} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
