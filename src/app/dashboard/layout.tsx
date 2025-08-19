import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/middleware';
import { Sidebar } from '@/components/dashboard/sidebar';
import { OnboardingTour } from '@/components/dashboard/onboarding-tour';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-[#F3F4EE]">
      {/* Sidebar */}
      <div className="sidebar">
        <Sidebar className="w-64 flex-shrink-0" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#F3F4EE]">{children}</main>
      </div>

      {/* Onboarding Tour */}
      <OnboardingTour />
    </div>
  );
}
