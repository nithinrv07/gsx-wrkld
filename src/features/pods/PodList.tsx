'use client';

import React from 'react';
import { Pod } from '@/types/auth-pod';
import { Users, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface PodListProps {
  pods: Pod[];
  projectSlug: string;
}

export const PodList: React.FC<PodListProps> = ({ pods, projectSlug }) => {
  if (pods.length === 0) {
    return (
      <div className="text-center p-8 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
        <p className="text-slate-500 text-sm">No domain pods configured for this project yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {pods.map((pod) => (
        <div
          key={pod.id}
          className="group relative bg-white border border-slate-200/90 hover:border-[#5851d8]/40 hover:shadow-xs rounded-2xl p-5 transition-all space-y-3.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-xs font-mono font-semibold text-[#5851d8]">
                {pod.type}
              </span>
              <h3 className="font-semibold text-slate-900 group-hover:text-[#5851d8] transition-colors">
                {pod.name}
              </h3>
            </div>

            <Link
              href={`/projects/${projectSlug}/pods/${pod.id}`}
              aria-label={`Open ${pod.name} board`}
              className="p-1.5 text-slate-400 group-hover:text-[#5851d8] hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>
              Lead: <strong className="text-slate-700 font-medium">{pod.leadName || 'Unassigned'}</strong>
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{pod.memberCount} {pod.memberCount === 1 ? 'member' : 'members'}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};