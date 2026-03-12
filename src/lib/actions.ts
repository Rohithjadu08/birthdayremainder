'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { users } from './users-db';

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    const sessionPayload = JSON.stringify({ email: user.email, name: user.name });
    cookies().set('session', sessionPayload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // One week
      path: '/',
    });
    return { success: true };
  }

  return {
    success: false,
    message: 'Invalid email or password.',
  };
}

export async function logout() {
  cookies().delete('session');
  redirect('/login');
}

export async function register(prevState: any, formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const passwordConfirm = formData.get('passwordConfirm') as string;

    if (!name || !email || !password) {
        return { message: "All fields are required.", success: false };
    }

    if (password !== passwordConfirm) {
        return { message: "Passwords do not match.", success: false };
    }
    
    if (password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
        return { message: "Password does not meet the requirements.", success: false };
    }

    if (users.find(u => u.email === email)) {
        return { message: "An account with this email already exists.", success: false };
    }

    users.push({ email, password, name });
    
    console.log('Registered new user:', { name, email });

    return { message: 'Registration successful! You can now sign in.', success: true };
}
