'use client';

import React, { useState } from 'react';
import { Search, Bell, Menu, ChevronDown, CheckCircle2, Sparkles } from 'lucide-react';
import { CURRENT_USER } from '@/constants/navigation';

interface TopNavbarProps {
  onMenuToggle: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onMenuToggle }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-18 px-4 sm:px-6 lg:px-8 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-lg">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Input Container */}
        <div className="relative w-full">
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
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50/80 border border-indigo-100 text-xs font-medium text-[#5851d8]">
          <Sparkles className="w-3.5 h-3.5 text-[#5851d8]" />
          <span>Sprint 2 (Current)</span>
        </div>

        {/* Notification Bell Button */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-3 z-50 animate-scale-up">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">
                  Notifications
                </span>
                <span className="text-[11px] font-medium text-[#5851d8] hover:underline cursor-pointer">
                  Mark all as read
                </span>
              </div>
              <div className="py-2 px-3 space-y-2 max-h-72 overflow-y-auto">
                <div className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 items-start">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-[#5851d8] shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-slate-800">
                      Divya assigned a task: Fix mobile responsiveness
                    </p>
                    <span className="text-[10px] text-slate-400">2m ago</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 items-start">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-slate-300 shrink-0" />
                  <div>
                    <p className="text-xs font-normal text-slate-600">
                      Sprint 2 Review meeting scheduled for tomorrow 11:00 AM
                    </p>
                    <span className="text-[10px] text-slate-400">1h ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Trigger */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1 pl-1.5 rounded-full hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 cursor-pointer"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#5851d8] to-purple-500 text-white flex items-center justify-center font-semibold text-xs shadow-xs">
              {CURRENT_USER.initials[0]}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block mr-1" />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-scale-up">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {CURRENT_USER.name}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {CURRENT_USER.email}
                </p>
              </div>
              <div className="py-1 text-sm text-slate-700">
                <a
                  href="/settings"
                  className="flex items-center px-4 py-2 hover:bg-slate-50 transition-colors"
                >
                  Account Settings
                </a>
                <div className="px-4 py-2 text-xs text-slate-400 border-t border-slate-100 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Pod: Alpha</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
