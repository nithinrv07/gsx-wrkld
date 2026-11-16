'use client';

import React, { useMemo, useState } from 'react';
import { Bell, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui';
import { Ticket } from '@/types/dashboard';
import { AlertCard } from './AlertCard';
import { PanelEmpty, PanelError, PanelHeader, SkeletonBlock } from './primitives';

export interface AlertsPanelProps {
  blockers?: Ticket[];
  isLoading?: boolean;
  error?: Error | null;
  onRetry: () => void;
  isRetrying?: boolean;
  readKeys: string[];
  onReadKeysChange: (keys: string[]) => void;
}

/**
 * Shows open Blocker Flag tickets that were created manually.
 * Automatic 24-hour escalation is intentionally not part of the MVP.
 */
export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  blockers,
  isLoading,
  error,
  onRetry,
  isRetrying,
  readKeys,
  onReadKeysChange,
}) => {
  const [tab, setTab] = useState<'unread' | 'all'>('unread');
  const readSet = useMemo(() => new Set(readKeys), [readKeys]);
  const list = blockers ?? [];
  const unread = list.filter((b) => !readSet.has(b.key));
  const shown = tab === 'unread' ? unread : list;

  const toggle = (key: string) =>
    onReadKeysChange(readSet.has(key) ? readKeys.filter((k) => k !== key) : [...readKeys, key]);
  const markAll = () => onReadKeysChange(Array.from(new Set([...readKeys, ...list.map((b) => b.key)])));

  return (
    <Card id="alerts" className="scroll-mt-24">
      <PanelHeader
        title="Alerts"
        subtitle="Open blocker flags in your projects"
        icon={
          <span className="relative inline-flex">
            <Bell className="h-4 w-4 text-slate-500" />
            {unread.length > 0 && (
              <span
                className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white"
                aria-label={`${unread.length} unread blockers`}
              >
                {unread.length}
              </span>
            )}
          </span>
        }
        actions={
          unread.length > 0 && (
            <button onClick={markAll} className="cursor-pointer text-xs font-medium text-[#5851d8] hover:underline">
              Mark all read
            </button>
          )
        }
      />

      {isLoading ? (
        <div className="space-y-3 px-5 pb-5" aria-busy="true" aria-label="Loading alerts">
          {[0, 1].map((i) => (
            <SkeletonBlock key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <PanelError message={error.message} onRetry={onRetry} isRetrying={isRetrying} />
      ) : list.length === 0 ? (
        <PanelEmpty
          icon={<ShieldCheck className="h-5 w-5" />}
          title="No open blockers"
          description="Nothing is blocked right now. Blocker flags raised on your projects will appear here."
        />
      ) : (
        <>
          <div role="tablist" aria-label="Alert filter" className="mx-5 mb-3 flex gap-4 border-b border-slate-100 text-xs">
            {(['unread', 'all'] as const).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`-mb-px cursor-pointer border-b-2 pb-2 font-medium capitalize transition-colors ${
                  tab === t ? 'border-[#5851d8] text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                {t === 'unread' ? `Unread (${unread.length})` : `All open (${list.length})`}
              </button>
            ))}
          </div>
          {shown.length === 0 ? (
            <PanelEmpty
              icon={<ShieldCheck className="h-5 w-5" />}
              title="You're all caught up"
              description="You've read every open blocker. Switch to “All open” to see them again."
            />
          ) : (
            <ul className="space-y-2.5 px-5 pb-5">
              {shown.map((b) => (
                <li key={b.key}>
                  <AlertCard blocker={b} isRead={readSet.has(b.key)} onToggleRead={toggle} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Card>
  );
};
