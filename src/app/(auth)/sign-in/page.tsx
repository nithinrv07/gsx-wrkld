'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_USERS } from '@/lib/mocks/pod-auth.mock';
import { saveMockSession } from '@/features/auth/useMockSession';
import { ShieldCheck, ArrowRight, CheckCircle2, GitBranch } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState(MOCK_USERS[0].id);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const userToLogin = MOCK_USERS.find((u) => u.id === selectedUser) || MOCK_USERS[0];
    saveMockSession(userToLogin);

    setTimeout(() => {
      setIsLoading(false);
      router.push('/');
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Sign in to Wrkld</h1>
          <p className="text-sm text-slate-400">
            Multi-Tier Agile Project & Pod Management Platform
          </p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-lg border border-slate-700 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
          >
            <GitBranch className="w-5 h-5 text-indigo-400" />
            <span>{isLoading ? 'Signing in...' : 'Sign in with GitHub'}</span>
            <ArrowRight className="w-4 h-4 ml-auto text-slate-400" />
          </button>

          <div className="mt-8 pt-6 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Dev Mode: Select Mock Persona
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-indigo-400" /> Mock Mode
              </span>
            </div>

            <div className="space-y-2">
              {MOCK_USERS.map((user) => (
                <label
                  key={user.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedUser === user.id
                      ? 'bg-indigo-950/40 border-indigo-500/50 text-white'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="mockUser"
                      value={user.id}
                      checked={selectedUser === user.id}
                      onChange={() => setSelectedUser(user.id)}
                      className="text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-200">{user.name}</p>
                      <p className="text-xs text-slate-500">@{user.githubHandle}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono">
                    {user.globalRole}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </form>

        <p className="text-xs text-center text-slate-500">
          Mock sign-in for development. No real authentication happens yet.
        </p>
      </div>
    </div>
  );
}