'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  FolderKanban,
  Zap,
  CheckSquare,
  Users,
  BarChart2,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { CURRENT_USER } from '@/constants/navigation';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

function SidebarNav({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    if (href === '/dashboard' || href === '/') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname?.startsWith(href) ?? false;
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', href: '/projects', icon: FolderKanban },
    { label: 'Sprints', href: '/sprints', icon: Zap },
    { label: 'Tasks', href: '/tasks', icon: CheckSquare },
    { label: 'Pods', href: '/pods', icon: Users },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <nav className="space-y-1 px-3 py-4" aria-label="Main Navigation">
      <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        Menu
      </div>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isItemActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              active
                ? 'bg-[#5851d8] text-white shadow-sm shadow-indigo-600/30 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Icon
              className={`w-4 h-4 shrink-0 transition-colors ${
                active ? 'text-white' : 'text-slate-400 group-hover:text-white'
              }`}
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-[#0e1322] border-r border-[#1a2238] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-18 px-6 border-b border-[#1a2238] shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#5851d8] to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-900/40 font-bold text-lg group-hover:scale-105 transition-transform">
              W
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white block leading-none">
                Wrkld
              </span>
              <span className="text-[10px] text-slate-500 font-mono">GSX Community</span>
            </div>
          </Link>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 lg:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto">
          <Suspense fallback={<div className="p-4 text-xs text-slate-500">Loading navigation...</div>}>
            <SidebarNav onClose={onClose} />
          </Suspense>
        </div>

        {/* User Profile at Bottom */}
        <div className="p-3 border-t border-[#1a2238] bg-[#0b0f19] shrink-0">
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors group">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#5851d8] to-purple-400 text-white flex items-center justify-center font-semibold text-xs shrink-0 shadow-inner">
                {CURRENT_USER.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">
                  {CURRENT_USER.name}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {CURRENT_USER.role}
                </p>
              </div>
            </div>
            <button
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
              aria-label="User actions"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
