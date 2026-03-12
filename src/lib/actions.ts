'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ADMIN_EMAIL = 'professor@school.edu';
const ADMIN_PASSWORD = 'password123';

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    cookies().set('session', 'admin-session-token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // One week
      path: '/',
    });
    return redirect('/');
  }

  return {
    message: 'Invalid email or password.',
  };
}

export async function logout() {
  cookies().delete('session');
  redirect('/login');
}
