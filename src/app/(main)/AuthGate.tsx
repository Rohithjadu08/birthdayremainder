'use client';

import { useUser } from '@/firebase';
import { useEffect } from 'react';
import { Loader } from 'lucide-react';
import { redirect } from 'next/navigation';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    // If loading is finished and there's no user, redirect to login.
    if (!isUserLoading && !user) {
      redirect('/login');
    }
  }, [user, isUserLoading]);

  // While loading, or if there's no user (and we're about to redirect), show a loader.
  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If loading is finished and there is a user, show the content.
  return <>{children}</>;
}
