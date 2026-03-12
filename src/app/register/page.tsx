'use client';

import Link from 'next/link';
import { Cake } from 'lucide-react';
import { RegisterForm } from '@/components/auth/register-form';
import { useUser } from '@/firebase';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { Loader } from 'lucide-react';

export default function RegisterPage() {
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && user) {
      redirect('/');
    }
  }, [user, isUserLoading]);

  if (isUserLoading || user) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <Link href="/" className="flex items-center gap-2 font-semibold mb-4">
            <Cake className="h-8 w-8 text-primary" />
            <span className="text-2xl">Birthday Reminder</span>
          </Link>
          <p className="text-muted-foreground text-center">
            Create an account to get started.
          </p>
        </div>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
