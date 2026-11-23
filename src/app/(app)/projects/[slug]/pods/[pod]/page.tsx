'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { usePod } from '@/hooks/usePods';
import { PodHeader } from '@/features/pods/PodHeader';
import { MemberList } from '@/features/pods/MemberList';
import { AddMemberDialog } from '@/features/pods/AddMemberDialog';
import { useMockSession } from '@/features/auth/useMockSession';
import { usePermissions } from '@/lib/permissions/usePermissions';
import { Can } from '@/lib/permissions/Can';
import { Pod, PodMember, PodRole } from '@/types/auth-pod';
import { PodBoard } from '@/features/tickets';
import { Users, LayoutGrid, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const demoteLeads = (list: PodMember[]): PodMember[] =>
  list.map((member) =>
    member.roleInPod === 'Pod Lead' ? { ...member, roleInPod: 'Contributor' as PodRole } : member
  );

function PodDetailContent({
  podId,
  projectSlug,
  podData,
}: {
  podId: string;
  projectSlug?: string;
  podData: Pod | null;
}) {
  const router = useRouter();
  const session = useMockSession();
  const user = session.user;
  const [members, setMembers] = useState<PodMember[]>(podData?.members ?? []);
  const [activeTab, setActiveTab] = useState<'board' | 'members'>('members');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const myPodRole = user ? members.find((member) => member.userId === user.id)?.roleInPod : undefined;
  const userPodRoles: Record<string, PodRole> = myPodRole ? { [podId]: myPodRole } : {};
  const currentUser = {
    globalRole: user?.globalRole ?? ('Contributor' as const),
    userPodRoles,
  };
  const { can } = usePermissions(currentUser);

  useEffect(() => {
    if (session.status === 'signed-out') router.replace('/sign-in');
  }, [session.status, router]);

  if (session.status !== 'signed-in' || !user) {
    return <div className="p-6 text-slate-500">Checking your session...</div>;
  }

  if (!podData) {
    return (
      <div className="bg-white border border-slate-200/90 text-slate-900 rounded-2xl p-12 text-center space-y-3 shadow-xs">
        <h2 className="text-lg font-semibold text-slate-900">Pod not found</h2>
        <p className="text-sm text-slate-500">
          This pod does not exist, or you do not have access to it.
        </p>
        <Link href={projectSlug ? `/projects/${projectSlug}` : '/projects'} className="inline-block text-sm font-medium text-[#5851d8] hover:underline">
          Back to Projects
        </Link>
      </div>
    );
  }

  const canManageMembers = can('manage_pod_members', podId);
  const canAssignLead = can('assign_pod_lead', podId);
  const lead = members.find((member) => member.roleInPod === 'Pod Lead');

  const handleAddMember = (newMember: PodMember) => {
    if (!canManageMembers) return;
    setMembers((prev) => {
      if (
        prev.some(
          (member) =>
            member.userId === newMember.userId ||
            member.email.trim().toLowerCase() === newMember.email.trim().toLowerCase()
        )
      ) {
        return prev;
      }
      const currentMembers = newMember.roleInPod === 'Pod Lead' ? demoteLeads(prev) : prev;
      return [...currentMembers, newMember];
    });
  };

  const handleUpdateMember = (updatedMember: PodMember) => {
    if (!canManageMembers) return;
    setMembers((prev) => {
      const currentMember = prev.find((member) => member.id === updatedMember.id);
      if (!currentMember) return prev;

      const roleChanged = currentMember.roleInPod !== updatedMember.roleInPod;
      if (
        roleChanged &&
        (currentMember.roleInPod === 'Pod Lead' || updatedMember.roleInPod === 'Pod Lead') &&
        !canAssignLead
      ) {
        return prev;
      }
      if (
        prev.some(
          (member) =>
            member.id !== updatedMember.id &&
            member.email.trim().toLowerCase() === updatedMember.email.trim().toLowerCase()
        )
      ) {
        return prev;
      }

      const membersWithoutPreviousLead =
        updatedMember.roleInPod === 'Pod Lead' ? demoteLeads(prev) : prev;
      return membersWithoutPreviousLead.map((member) =>
        member.id === updatedMember.id ? updatedMember : member
      );
    });
  };

  const handleRemoveMember = (memberId: string) => {
    if (!canManageMembers) return;
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={projectSlug ? `/projects/${projectSlug}` : '/projects'}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Project
        </Link>
        <span className="text-xs font-mono text-[#5851d8] bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full font-medium">
          Viewing as: {user.name} ({user.globalRole})
        </span>
      </div>

      <PodHeader
        pod={{
          ...podData,
          leadId: lead?.userId ?? null,
          leadName: lead?.name,
          memberCount: members.length,
          members,
        }}
      />

      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'members'
                ? 'bg-white text-slate-900 border border-slate-200/90 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/70'
            }`}
          >
            <Users className="w-4 h-4" /> Members ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'board'
                ? 'bg-white text-slate-900 border border-slate-200/90 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/70'
            }`}
          >
            <LayoutGrid className="w-4 h-4" /> Board
          </button>
        </div>

        <Can action="manage_pod_members" podId={podId} currentUser={currentUser}>
          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="inline-flex items-center gap-2 bg-[#5851d8] hover:bg-[#4a43c4] text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </Can>
      </div>

      {activeTab === 'members' ? (
        <MemberList
          members={members}
          onRemoveMember={handleRemoveMember}
          onUpdateMember={handleUpdateMember}
          canManageMembers={canManageMembers}
          canAssignLead={canAssignLead}
        />
      ) : (
        // Board tab: Task & Issue Management (M11, M12, S1, S3).
        <div className="rounded-2xl bg-white border border-slate-200/90 p-4 text-slate-900 sm:p-6 shadow-xs">
          <PodBoard
            projectSlug={projectSlug || podData.projectSlug}
            podId={podId}
            podName={podData.name}
            podLeadName={lead?.name ?? null}
            members={members}
            currentUser={currentUser}
          />
        </div>
      )}

      <AddMemberDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAddMember={handleAddMember}
        existingEmails={members.map((member) => member.email)}
        canAssignLead={canAssignLead}
      />
    </div>
  );
}

// Loads the pod within its project (so pod-fe in two projects never collide),
// then mounts the detail view keyed by pod so its member state starts from the loaded data.
function PodDetailLoader({ podId, projectSlug }: { podId: string; projectSlug: string }) {
  const { data: podData, isLoading } = usePod(projectSlug, podId);
  if (isLoading) {
    return <div className="p-6 text-slate-400">Loading pod details...</div>;
  }
  return (
    <PodDetailContent
      key={`${projectSlug}-${podData?.id ?? podId}`}
      podId={podId}
      projectSlug={projectSlug}
      podData={podData ?? null}
    />
  );
}

function PodDetailResolver({ params }: { params: Promise<{ slug: string; pod: string }> }) {
  const { slug, pod } = use(params);
  return <PodDetailLoader key={`${slug}-${pod}`} podId={pod} projectSlug={slug} />;
}

export default function PodDetailPage({ params }: { params: Promise<{ slug: string; pod: string }> }) {
  return (
    <Suspense fallback={<div className="p-6 text-slate-400">Loading pod details...</div>}>
      <PodDetailResolver params={params} />
    </Suspense>
  );
}
