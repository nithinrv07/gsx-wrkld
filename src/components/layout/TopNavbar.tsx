'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Bell, Menu, ChevronDown, ChevronRight, Sparkles, LogOut } from 'lucide-react';
import { useMockSession, clearMockSession } from '@/features/auth/useMockSession';
import { useSprints } from '@/hooks/useSprints';
import { useOpenBlockers } from '@/lib/dashboard/queries';
import { useReadAlerts } from '@/lib/dashboard/local-store';

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

function getProjectSlugFromPath(pathname: string | null): string {
  if (!pathname) return 'wrkld-core';
  const match = pathname.match(/^\/projects\/([^/]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return 'wrkld-core';
}

function formatSegmentLabel(segment: string): string {
  const lower = segment.toLowerCase();
  if (lower === 'wrkld-core' || lower === 'wrkld') {
    return 'Wrkld Platform';
  }
  if (lower === 'kanban-sync') {
    return 'Kanban Sync';
  }
  if (lower === 'telemetry-engine') {
    return 'Telemetry Engine';
  }
  if (lower === 'pod-fe') {
    return 'Frontend Pod';
  }
  if (lower === 'pod-be') {
    return 'Backend Pod';
  }
  if (lower === 'pod-int') {
    return 'Integration Pod';
  }
  if (lower === 'pod-qa') {
    return 'QA Pod';
  }
  return segment
    .split(/[-_]+/)
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : ''))
    .join(' ');
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}

function getBreadcrumbs(pathname: string | null): BreadcrumbItem[] {
  if (!pathname || pathname === '/' || pathname === '/dashboard') {
    return [
      { label: 'Home', href: '/dashboard' },
      { label: 'Dashboard' },
    ];
  }

  const segments = pathname.split('/').filter(Boolean);
  const crumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/dashboard' }];

  let accPath = '';
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    accPath += `/${seg}`;
    const isLast = i === segments.length - 1;

    crumbs.push({
      label: formatSegmentLabel(seg),
      href: isLast ? undefined : accPath,
    });
  }

  return crumbs;
}

interface TopNavbarProps {
  onMenuToggle: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onMenuToggle }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // The signed-in user comes from the session
  const session = useMockSession();
  const rawUser = session.status === 'signed-in' ? session.user : null;
  const user = rawUser
    ? {
        ...rawUser,
        name: titleCase(rawUser.name),
      }
    : null;

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Dynamic Sprint Data
  const projectSlug = getProjectSlugFromPath(pathname);
  const { data: sprints } = useSprints(projectSlug);
  const activeSprint = sprints?.find((s) => s.status === 'active' || s.status === 'in-progress') ?? sprints?.[0];
  const sprintBadgeText = activeSprint
    ? `${activeSprint.name.split(/[—–-]/)[0].trim()} (${activeSprint.status === 'active' || activeSprint.status === 'in-progress' ? 'Current' : titleCase(activeSprint.status)})`
    : 'Sprint 2 (Current)';

  // Dynamic Notifications Data
  const blockersQuery = useOpenBlockers();
  const blockers = blockersQuery.data ?? [];
  const [readKeys, setReadKeys] = useReadAlerts(rawUser?.id ?? 'default');
  const unreadBlockers = blockers.filter((b) => !readKeys.includes(b.key));
  const hasUnread = unreadBlockers.length > 0;

  // Dynamic Breadcrumbs
  const breadcrumbs = getBreadcrumbs(pathname);

  // Close menus on Escape or a click outside
  useEffect(() => {
    if (!showUserMenu && !showNotifications) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
      if (showNotifications && notificationsRef.current && !notificationsRef.current.contains(target)) {
        setShowNotifications(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowUserMenu(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [showUserMenu, showNotifications]);

  const signOut = () => {
    setShowUserMenu(false);
    clearMockSession();
    router.push('/sign-in');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-18 px-4 sm:px-6 lg:px-8 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      {/* Left: Mobile Toggle, Dynamic Breadcrumbs & Global Search */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 max-w-2xl">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 shrink-0"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic Breadcrumbs */}
        <nav aria-label="Breadcrumbs" className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 shrink-0 mr-1">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.href || `${crumb.label}-${index}`}>
                {crumb.href && !isLast ? (
                  <Link href={crumb.href} className="hover:text-slate-700 transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'text-slate-700 font-medium' : ''}>
                    {crumb.label}
                  </span>
                )}
                {!isLast && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Search Input Container */}
        <div className="relative w-full max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search anything... (tasks, pods, projects)"
            className="w-full pl-10 pr-12 py-2 text-sm bg-slate-100/70 hover:bg-slate-100 focus:bg-white text-slate-900 placeholder-slate-400 rounded-xl border border-transparent focus:border-[#5851d8] focus:ring-2 focus:ring-[#5851d8]/15 transition-all outline-none"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3.5 ml-4">
        {/* Sprint Quick Badge (Shown on desktop) */}
        <div
          title={activeSprint?.name || 'Active Sprint'}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50/80 border border-indigo-100 text-xs font-medium text-[#5851d8]"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#5851d8]" />
          <span>{sprintBadgeText}</span>
        </div>

        {/* Notification Bell Button */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-3 z-50 animate-scale-up">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">
                  Notifications {hasUnread ? `(${unreadBlockers.length})` : ''}
                </span>
                {hasUnread && (
                  <button
                    type="button"
                    onClick={() => {
                      setReadKeys(Array.from(new Set([...readKeys, ...blockers.map((b) => b.key)])));
                    }}
                    className="text-[11px] font-medium text-[#5851d8] hover:underline cursor-pointer bg-transparent border-none p-0"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="py-2 px-3 space-y-2 max-h-72 overflow-y-auto">
                {blockersQuery.isLoading ? (
                  <div className="py-4 text-center text-xs text-slate-400">Loading notifications...</div>
                ) : blockers.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">No active blocker alerts</div>
                ) : (
                  blockers.map((blocker) => {
                    const isUnread = !readKeys.includes(blocker.key);
                    return (
                      <div
                        key={blocker.key}
                        onClick={() => {
                          if (isUnread) {
                            setReadKeys([...readKeys, blocker.key]);
                          }
                        }}
                        className={`p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 items-start ${
                          isUnread ? 'bg-indigo-50/30' : ''
                        }`}
                      >
                        <div
                          className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                            isUnread ? 'bg-[#5851d8]' : 'bg-slate-300'
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs ${isUnread ? 'font-medium text-slate-800' : 'font-normal text-slate-600'}`}>
                            <span className="font-semibold text-slate-900 mr-1.5">[{blocker.key}]</span>
                            {blocker.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                            <span className="capitalize">{blocker.projectSlug}</span>
                            {blocker.pod && <span>· Pod {blocker.pod}</span>}
                            <span>· {blocker.severity}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Trigger */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1 sm:pr-2.5 rounded-full hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 cursor-pointer border border-slate-200/60 bg-white shadow-2xs"
            aria-label={user ? `User menu for ${user.name}` : 'User menu'}
            aria-haspopup="true"
            aria-expanded={showUserMenu}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#5851d8] to-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              {user ? initialsOf(user.name) : '?'}
            </div>
            {user && (
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-900 leading-tight">{user.name}</span>
                <span className="text-[10px] text-slate-500">{user.globalRole}</span>
              </div>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block mr-0.5" />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-scale-up">
              {user ? (
                <>
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-600 truncate">
                      @{user.githubHandle} · {user.globalRole}
                    </p>
                  </div>
                  <div className="py-1 text-sm text-slate-700">
                    <button
                      type="button"
                      onClick={signOut}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" />
                      Sign out
                    </button>
                  </div>
                </>
              ) : (
                <div className="px-4 py-2.5 text-sm">
                  <p className="text-slate-700">You&apos;re not signed in.</p>
                  <Link href="/sign-in" onClick={() => setShowUserMenu(false)} className="mt-1 inline-block font-medium text-[#5851d8] underline">
                    Sign in
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
