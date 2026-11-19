'use client';

import React, { useState, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';

export interface AppLayoutProps {
  children: React.ReactNode;
}

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  // On sign-in / auth pages, bypass the application shell (no sidebar or top navbar)
  const isAuthPage = pathname === '/sign-in' || pathname?.startsWith('/sign-in');

  if (isAuthPage) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fd] text-slate-900 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-64 transition-all duration-300 w-full overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar onMenuToggle={() => setIsMobileSidebarOpen((prev) => !prev)} />

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <Suspense fallback={<main className="min-h-screen w-full">{children}</main>}>
      <AppLayoutContent>{children}</AppLayoutContent>
    </Suspense>
  );
};
