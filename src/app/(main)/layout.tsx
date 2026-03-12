import AppHeader from '@/components/layout/app-header';
import AppSidebar from '@/components/layout/app-sidebar';
import { AuthGate } from './AuthGate';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = { name: 'Professor', email: 'professor@school.edu' };

  return (
    <AuthGate>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <AppHeader user={user} />
          <main className="flex-1 overflow-y-auto bg-background p-6 md:p-8 lg:p-10">
            <div 
              className="fixed inset-0 bg-repeat bg-center -z-10 opacity-5"
              style={{backgroundImage: 'url(/background-pattern.svg)'}}>
            </div>
            {children}
          </main>
        </div>
      </div>
    </AuthGate>
  );
}
