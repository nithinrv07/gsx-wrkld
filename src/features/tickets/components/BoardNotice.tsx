'use client';

// Short confirmation or refusal message after an action (doc 10.1 "Honest feedback").
// Swap for the Frontend Lead's shared Toast once it exists.

import React, { useEffect } from 'react';
import { Check, Lock } from 'lucide-react';

export interface Notice {
  id: number;
  tone: 'ok' | 'refused';
  title: string;
  text: string;
}

export function BoardNotice({ notice, onDismiss }: { notice: Notice | null; onDismiss: () => void }) {
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(onDismiss, 5000);
    return () => window.clearTimeout(timer);
  }, [notice, onDismiss]);

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed bottom-6 right-6 z-[80]">
      {notice && (
        <div
          className={`pointer-events-auto flex max-w-[400px] items-start gap-2.5 rounded-xl border px-4 py-3 text-[13px] leading-relaxed shadow-lg ${
            notice.tone === 'refused' ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-emerald-200 bg-white text-emerald-950'
          }`}
        >
          {notice.tone === 'refused' ? (
            <Lock className="mt-0.5 h-4 w-4 flex-none text-rose-700" aria-hidden="true" />
          ) : (
            <Check className="mt-0.5 h-4 w-4 flex-none text-emerald-700" aria-hidden="true" />
          )}
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold">{notice.title}</span>
            <span className="text-slate-600">{notice.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
