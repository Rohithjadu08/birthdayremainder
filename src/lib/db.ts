import type { Student } from './types';
import { placeholderImages } from './placeholder-images.json';
import { format } from 'date-fns';

const createInitialStudents = (): Student[] => {
  return placeholderImages.map((img, index) => {
    const departments = ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering', 'Biomedical Engineering', 'Aerospace Engineering', 'Industrial Engineering', 'Art History', 'Music Theory'];
    const today = new Date();
    
    let birthday;
    const year = today.getFullYear();
    const studentBirthYear = year - (20 + index % 5); // Students are between 20-24 years old

    if (index === 0) {
      // First student always has birthday today
      birthday = new Date(studentBirthYear, today.getMonth(), today.getDate());
    } else if (index > 0 && index < 4) {
      // Next 3 students have birthdays in the coming week
      const upcomingDate = new Date();
      upcomingDate.setDate(today.getDate() + index * 2);
      birthday = new Date(studentBirthYear, upcomingDate.getMonth(), upcomingDate.getDate());
    } else {
      // Others have random birthdays throughout the year
      const randomMonth = Math.floor(Math.random() * 12);
      const randomDay = Math.floor(Math.random() * 28) + 1;
      birthday = new Date(studentBirthYear, randomMonth, randomDay);
    }
  
    return {
      id: `${index + 1}`,
      name: `Student ${String.fromCharCode(65 + index)}`,
      rollNumber: `2024${(1000 + index).toString()}`,
      department: departments[index % departments.length],
      birthday: format(birthday, 'yyyy-MM-dd'),
      photoUrl: img.imageUrl,
      imageHint: img.imageHint,
    };
  });
};


// This will act as our in-memory database.
// In a real app, this would be a database connection.
// In dev, we store it on the global object to prevent it from being reset by HMR.
declare global {
  var students: Student[] | undefined;
}

export let students: Student[];

if (process.env.NODE_ENV === 'production') {
  students = createInitialStudents();
} else {
  if (!global.students) {
    global.students = createInitialStudents();
  }
  students = global.students;
}
