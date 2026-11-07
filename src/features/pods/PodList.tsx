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
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Domain Pods</h3>
      </div>

      {pods.length === 0 ? (
        <div className="text-center p-8 bg-slate-900/50 border border-slate-800 rounded-xl">
          <p className="text-slate-400 text-sm">No pods have been created for this project yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pods.map((pod) => (
            <div
              key={pod.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs font-mono font-semibold text-slate-300">
                    {pod.type}
                  </span>
                  <h4 className="font-semibold text-white">{pod.name}</h4>
                </div>

                <Link
                  href={`/projects/${projectSlug}/pods/${pod.id}`}
                  aria-label={`Open ${pod.name}`}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <span>Lead: <strong className="text-slate-200">{pod.leadName || 'Unassigned'}</strong></span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {pod.memberCount} members
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};