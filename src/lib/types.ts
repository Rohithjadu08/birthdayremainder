export interface Student {
  id: string;
  userId: string;
  name: string;
  rollNumber: string;
  department: string;
  section: string;
  birthday: string; // YYYY-MM-DD format
  photoUrl?: string;
  imageHint?: string;
  phoneNumber?: string;
}
