'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cake, LayoutDashboard, Users, CalendarDays, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/students', label: 'Students', icon: Users },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/about', label: 'About', icon: Info },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r bg-card sm:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-primary [text-shadow:0_0_8px_hsl(var(--primary)/0.7)]">
          <Cake className="h-6 w-6" />
          <span className="font-headline text-lg">Birthday Reminder</span>
        </Link>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  pathname === item.href && 'bg-primary/10 text-primary'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
