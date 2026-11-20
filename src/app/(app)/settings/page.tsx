'use client';

import React, { useState } from 'react';
import { Save, UserCheck, Shield, Users, Check } from 'lucide-react';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
} from '@/components/ui';
import { useMockSession, saveMockSession } from '@/features/auth/useMockSession';
import { MOCK_USERS, MOCK_PODS } from '@/lib/mocks/pod-auth.mock';
import type { User } from '@/types/auth-pod';

function ProfileForm({ user }: { user: User }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [githubHandle, setGithubHandle] = useState(user.githubHandle || '');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveMockSession({
      ...user,
      name: name.trim() || user.name,
      email: email.trim() || user.email,
      githubHandle: githubHandle.trim() || user.githubHandle,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#5851d8] focus:ring-2 focus:ring-[#5851d8]/15 outline-none transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Global Role</label>
          <input
            type="text"
            disabled
            value={user.globalRole}
            className="w-full px-3.5 py-2 text-sm bg-slate-100/80 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#5851d8] focus:ring-2 focus:ring-[#5851d8]/15 outline-none transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">GitHub Handle</label>
          <input
            type="text"
            value={githubHandle}
            onChange={(e) => setGithubHandle(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#5851d8] focus:ring-2 focus:ring-[#5851d8]/15 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" variant="primary" size="sm" leftIcon={<Save className="w-4 h-4" />}>
          Save Preferences
        </Button>
        {savedNotice && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
            <Check className="w-3.5 h-3.5" /> Changes saved
          </span>
        )}
      </div>
    </form>
  );
}

export default function SettingsPage() {
  const session = useMockSession();
  const user = session.status === 'signed-in' ? session.user : MOCK_USERS[1];

  const handleSwitchUser = (selectedUserId: string) => {
    const targetUser = MOCK_USERS.find((u) => u.id === selectedUserId);
    if (targetUser) {
      saveMockSession(targetUser);
    }
  };

  // Find pod affiliations for the current user
  const userPods = MOCK_PODS.filter(
    (pod) =>
      pod.leadId === user.id ||
      pod.members.some((m) => m.userId === user.id) ||
      user.globalRole === 'Super Admin' ||
      user.globalRole === 'Project Lead'
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account preferences, pod configuration, and testing session roles."
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Settings' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your identity across Wrkld pods, project boards, and sprint planning sessions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm key={user.id} user={user} />
            </CardContent>
          </Card>

          {/* Switch Profile for Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#5851d8]" />
                <span>Switch Testing Profile & Role</span>
              </CardTitle>
              <CardDescription>
                Simulate different team roles and permissions across Dashboard, Projects, and Kanban.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MOCK_USERS.map((u) => {
                  const isActive = u.id === user.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSwitchUser(u.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-indigo-50/70 border-indigo-200 ring-2 ring-[#5851d8]/30 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#5851d8] to-purple-400 text-white flex items-center justify-center font-semibold text-xs shrink-0 shadow-inner">
                        {u.name
                          .split(' ')
                          .map((p) => p[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 truncate flex items-center gap-1.5">
                          {u.name}
                          {isActive && (
                            <span className="text-[10px] font-bold text-[#5851d8] bg-indigo-100 px-1.5 py-0.2 rounded">
                              ACTIVE
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{u.globalRole}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Pod Affiliation */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#5851d8]" />
                <span>Pod Affiliation</span>
              </CardTitle>
              <CardDescription>
                Active pod and membership assignments in project scopes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {userPods.length === 0 ? (
                <p className="text-sm text-slate-500 py-2">No active pod assignments.</p>
              ) : (
                userPods.map((p) => {
                  const isLead = p.leadId === user.id;
                  const memberRole =
                    p.members.find((m) => m.userId === user.id)?.roleInPod ??
                    (isLead
                      ? 'Pod Lead'
                      : user.globalRole === 'Super Admin'
                      ? 'Super Admin'
                      : user.globalRole === 'Project Lead'
                      ? 'Project Lead'
                      : 'Member');

                  return (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#5851d8] bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                            {p.type}
                          </span>
                          <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Lead: {p.leadName || 'Unassigned'} · {p.memberCount} members
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          memberRole === 'Pod Lead' || memberRole === 'Super Admin' || memberRole === 'Project Lead'
                            ? 'bg-indigo-50 text-[#5851d8] border border-indigo-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {memberRole}
                      </span>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Access Permissions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-600">
              <p>
                <strong className="text-slate-900">Current Role:</strong> {user.globalRole}
              </p>
              <p>
                Permissions follow the role-based access control (RBAC) matrix for Pods, Sprints, and Kanban boards.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
