'use client';

import React, { use, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

function ProjectPodsRedirectResolver({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();

  useEffect(() => {
    if (slug) {
      router.replace(`/projects/${slug}`);
    }
  }, [slug, router]);

  return (
    <div className="p-6 text-xs text-slate-400 animate-pulse">
      Redirecting to project...
    </div>
  );
}

export default function ProjectPodsRedirectPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-slate-400">Redirecting...</div>}>
      <ProjectPodsRedirectResolver params={params} />
    </Suspense>
  );
}
