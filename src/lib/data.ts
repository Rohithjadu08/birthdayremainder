import type { Student } from './types';
import { isToday, isWithinInterval, addDays, startOfToday, endOfToday, endOfDay } from 'date-fns';

// These functions now operate on a list of students provided as an argument.

export function getTodaysBirthdays(allStudents: Student[]): Student[] {
  const today = new Date();
  
  return allStudents.filter(student => {
    const studentBirthday = new Date(student.birthday);
    return studentBirthday.getMonth() === today.getMonth() && studentBirthday.getDate() === today.getDate();
  });
}

export function getUpcomingBirthdays(allStudents: Student[]): Student[] {
  const today = startOfToday();
  const oneWeekFromNow = endOfDay(addDays(today, 7));

  return allStudents.filter(student => {
    const birthday = new Date(student.birthday);
    const studentBirthdayThisYear = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
    
    // Ignore today's birthdays as they are shown separately
    if (isToday(studentBirthdayThisYear)) {
      return false;
    }
    
    // If the birthday this year has already passed, check for next year
    if (studentBirthdayThisYear < today) {
       const studentBirthdayNextYear = new Date(today.getFullYear() + 1, birthday.getMonth(), birthday.getDate());
       return isWithinInterval(studentBirthdayNextYear, { start: today, end: oneWeekFromNow });
    }

    return isWithinInterval(studentBirthdayThisYear, { start: today, end: oneWeekFromNow });
  }).sort((a, b) => {
      const today = new Date();
      const dateA = new Date(a.birthday);
      const dateB = new Date(b.birthday);
      const birthdayAThisYear = new Date(today.getFullYear(), dateA.getMonth(), dateA.getDate());
      const birthdayBThisYear = new Date(today.getFullYear(), dateB.getMonth(), dateB.getDate());

      const resolvedDateA = birthdayAThisYear < today ? new Date(today.getFullYear() + 1, dateA.getMonth(), dateA.getDate()) : birthdayAThisYear;
      const resolvedDateB = birthdayBThisYear < today ? new Date(today.getFullYear() + 1, dateB.getMonth(), dateB.getDate()) : birthdayBThisYear;

      return resolvedDateA.getTime() - resolvedDateB.getTime();
  });
}
