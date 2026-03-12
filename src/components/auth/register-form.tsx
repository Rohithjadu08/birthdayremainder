'use client';

import { useState } from 'react';
import { useAuth } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const PasswordRequirement = ({ meets, text }: { meets: boolean; text: string }) => (
    <div className={`flex items-center text-xs ${meets ? 'text-primary' : 'text-muted-foreground'}`}>
      {meets ? <CheckCircle2 className="mr-2 h-3 w-3" /> : <XCircle className="mr-2 h-3 w-3" />}
      {text}
    </div>
);

export function RegisterForm() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const passwordReqs = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    match: password && password === passwordConfirm,
  };
  const allReqsMet = Object.values(passwordReqs).every(Boolean);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!allReqsMet) {
      setError("Please ensure all password requirements are met.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      toast({
        title: "Registration Successful",
        description: "Welcome! You are now logged in.",
      });
      router.push('/');
    } catch (error: any) {
      console.error(error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email address is already in use.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "The password is too weak.";
      }
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <Card>
        <CardContent className="space-y-4 pt-6">
           {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Registration Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" type="text" placeholder="Professor Plum" required value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="professor@school.edu"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              required 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="passwordConfirm">Confirm Password</Label>
            <Input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                required
                placeholder="••••••••"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                disabled={isLoading}
            />
          </div>
          <div className="space-y-1 pt-2">
              <PasswordRequirement meets={passwordReqs.length} text="At least 8 characters" />
              <PasswordRequirement meets={passwordReqs.lowercase} text="Contains a lowercase letter" />
              <PasswordRequirement meets={passwordReqs.uppercase} text="Contains an uppercase letter" />
              <PasswordRequirement meets={passwordReqs.number} text="Contains a number" />
              {passwordConfirm && <PasswordRequirement meets={passwordReqs.match} text="Passwords match" />}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading || !allReqsMet}>
            {isLoading ? <Loader2 className="animate-spin" /> : <UserPlus />}
            {isLoading ? 'Registering...' : 'Register'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
