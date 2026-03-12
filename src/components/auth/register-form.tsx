'use client';

import { useFormStatus } from 'react-dom';
import { useActionState, useState, useEffect } from 'react';
import { register } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Registering...' : 'Register'}
      <UserPlus className="ml-2 h-4 w-4" />
    </Button>
  );
}

const PasswordRequirement = ({ meets, text }: { meets: boolean; text: string }) => (
    <div className={`flex items-center text-xs ${meets ? 'text-primary' : 'text-muted-foreground'}`}>
      {meets ? <CheckCircle2 className="mr-2 h-3 w-3" /> : <XCircle className="mr-2 h-3 w-3 text-muted-foreground" />}
      {text}
    </div>
);

export function RegisterForm() {
  const [state, formAction] = useActionState(register, undefined);
  const { toast } = useToast();

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const passwordReqs = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    match: password && password === passwordConfirm,
  };
  
  useEffect(() => {
    if (state?.message) {
      if (state.success) {
        toast({
          title: "Success!",
          description: state.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: state.message,
        });
      }
    }
  }, [state, toast]);

  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          {state?.message && !state.success && (
            <p className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-md">
              {state.message}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" type="text" placeholder="Professor Plum" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="professor@school.edu"
              required
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
            />
          </div>
          <div className="space-y-1 pt-2">
              <PasswordRequirement meets={passwordReqs.length} text="At least 8 characters" />
              <PasswordRequirement meets={passwordReqs.lowercase} text="Contains a lowercase letter" />
              <PasswordRequirement meets={passwordReqs.uppercase} text="Contains an uppercase letter" />
              <PasswordRequirement meets={passwordReqs.number} text="Contains a number" />
              <PasswordRequirement meets={passwordReqs.special} text="Contains a special character" />
              {passwordConfirm && <PasswordRequirement meets={passwordReqs.match} text="Passwords match" />}
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </Card>
    </form>
  );
}
