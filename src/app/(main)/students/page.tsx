import { getStudents } from '@/lib/data';
import StudentTable from '@/components/students/student-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function StudentsPage() {
  const students = await getStudents();

  return (
    <Card>
        <CardHeader>
            <CardTitle>Student Directory</CardTitle>
            <CardDescription>View, search, and manage all student records.</CardDescription>
        </CardHeader>
        <CardContent>
            <StudentTable students={students} />
        </CardContent>
    </Card>
  );
}
