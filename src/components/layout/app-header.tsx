'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, Cake, LayoutDashboard, Users, CalendarDays, LogOut, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/firebase';
import { signOut, type User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';


const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/students', label: 'Students', icon: Users },
    { href: '/calendar', label: 'Calendar', icon: CalendarDays },
    { href: '/about', label: 'About', icon: Info },
];

const pageTitles: { [key: string]: string } = {
    '/': 'Dashboard',
    '/students': 'Student Directory',
    '/calendar': 'Birthday Calendar',
    '/about': 'About',
};

interface AppHeaderProps {
    user: User | null;
}

export default function AppHeader({ user }: AppHeaderProps) {
    const pathname = usePathname();
    const router = useRouter();
    const auth = useAuth();
    const { toast } = useToast();
    const title = pageTitles[pathname] || 'Dashboard';

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
            toast({ variant: 'destructive', title: 'Logout Failed', description: 'Could not log you out. Please try again.' });
        }
    };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="sm:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <Cake className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">Birthday Reminder</span>
            </Link>
            {navItems.map(item => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn("flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground", pathname === item.href && "text-foreground")}
                >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="flex w-full items-center gap-4">
        <h1 className="text-xl font-semibold">{title}</h1>
        <div className="ml-auto flex items-center gap-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar>
                    <AvatarImage src={user?.photoURL || "https://picsum.photos/seed/prof/40/40"} alt={user?.displayName || "User"} data-ai-hint="person professor" />
                    <AvatarFallback>{user?.displayName?.[0] || 'P'}</AvatarFallback>
                    </Avatar>
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                    <p>{user?.displayName || 'Professor'}</p>
                    <p className="text-xs text-muted-foreground font-normal">{user?.email || 'professor@school.edu'}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
