'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, FolderKanban, Users, Settings } from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

function SidebarNav() {
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') return true;
    if (href === '/projects' && pathname?.startsWith('/projects')) return true;
    return false;
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', href: '/projects', icon: FolderKanban },
  ];

  return (
    <nav className="space-y-1 px-2 py-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isItemActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              active
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 min-h-screen flex flex-col">
      <div className="p-4 border-b border-slate-800 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
          W
        </div>
        <div>
          <h1 className="font-bold text-white text-base leading-none">Wrkld</h1>
          <span className="text-[10px] text-slate-500 font-mono">GSX Community</span>
        </div>
      </div>

      <Suspense fallback={<div className="p-4 text-xs text-slate-500">Loading navigation...</div>}>
        <SidebarNav />
      </Suspense>
    </aside>
  );
};
