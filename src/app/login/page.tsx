import { LoginForm } from '@/components/auth/login-form';
import { Cake } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center mb-8">
            <div className="bg-primary/20 p-3 rounded-full mb-4">
                <Cake className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-center">
                Student Birthday Reminder
            </h1>
            <p className="text-muted-foreground text-center mt-2">
                Sign in to your professor account.
            </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
