'use client';

import React, { Suspense } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, FolderKanban, LogOut } from 'lucide-react';
import { CURRENT_USER } from '@/constants/navigation';
import { useMockSession, clearMockSession } from '@/features/auth/useMockSession';
import { useAuth } from '@/lib/auth/rbac';

function titleCase(s: string): string {
  if (!s) return '';
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w.length > 1 ? w[0].toUpperCase() + w.slice(1) : w.toUpperCase()))
    .join(' ');
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

// Two destinations only (spec 12.2): Dashboard and Projects. Pods, sprints,
// boards and analytics are all reached from inside a project.
const MENU = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() ?? '';
  const router = useRouter();

  const isItemActive = (href: string) =>
    href === '/dashboard'
      ? pathname === '/dashboard' || pathname === '/'
      : pathname === href || pathname.startsWith(`${href}/`);

  const handleSignOut = () => {
    clearMockSession();
    router.push('/sign-in');
  };

  return (
    <div className="flex flex-col h-full px-3 py-4">
      <nav aria-label="Main navigation" className="space-y-1">
        {MENU.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-blue-50 text-blue-600 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0 text-slate-400" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const auth = useAuth();
  const session = useMockSession();
  const sessionUser = session.status === 'signed-in' ? session.user : null;

  // Derive name, role and initials from canonical useMockSession(), falling back to auth context or CURRENT_USER
  const rawName = sessionUser?.name || auth.user?.name || CURRENT_USER.name;
  const name = titleCase(rawName);
  const role =
    (auth.user && auth.user.role && auth.user.name === rawName ? auth.user.role : null) ||
    sessionUser?.globalRole ||
    CURRENT_USER.role;
  const initials = initialsOf(name);

  const user = {
    name,
    role,
    initials,
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden backdrop-blur-xs" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200/90 bg-white transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo Header matching screenshot */}
        <div className="p-4 px-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#5851d8] to-blue-600 flex items-center justify-center font-extrabold text-white text-lg shadow-sm">
            W
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-base leading-tight">Wrkld</h1>
            <span className="text-[11px] text-slate-400 font-medium">Pod Agile</span>
          </div>
        </div>

        {/* Navigation Area */}
        <div className="flex-1 overflow-y-auto">
          <Suspense fallback={<div className="p-4 text-xs text-slate-400">Loading navigation...</div>}>
            <SidebarNav onNavigate={onClose} />
          </Suspense>
        </div>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3 p-1.5 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#5851d8] to-blue-500 text-white flex items-center justify-center font-semibold text-xs shrink-0 shadow-xs">
              {user.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
