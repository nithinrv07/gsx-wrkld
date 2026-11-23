// Pods data layer (Module 5, M9).
// Mock mode: the built-in MOCK_PODS plus pods created in this browser (localStorage).
// When the backend lands, replace these function bodies with calls to
//   GET  /api/projects/{slug}/pods
//   POST /api/projects/{slug}/pods
// (see the Backend Requirements report). Components only depend on the return types.

import { MOCK_PODS, MOCK_USERS } from '@/lib/mocks/pod-auth.mock';
import { matchProjectSlug } from '@/features/tickets/lib/ticketAdapter';
import type { Pod, PodMember, PodType } from '@/types/auth-pod';

export const POD_STORAGE_KEY = 'wrkld_mock_pods';

export const POD_TYPE_LABELS: Record<PodType, string> = {
  FE: 'Frontend',
  BE: 'Backend',
  INT: 'Integration',
  QA: 'Quality Assurance',
};

export const POD_TYPES = Object.keys(POD_TYPE_LABELS) as PodType[];

export interface CreatePodInput {
  name: string;
  type: PodType;
  /** User id of the Pod Lead, or null to leave the pod without a lead. */
  leadId: string | null;
}

/** Pod URLs use `pod-<type>` (pod-fe, pod-be, ...), one pod of each type per project. */
export const podIdFor = (type: PodType) => `pod-${type.toLowerCase()}`;

function readCreated(): Pod[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(POD_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Pod[]) : [];
  } catch {
    return [];
  }
}

function writeCreated(pods: Pod[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(POD_STORAGE_KEY, JSON.stringify(pods));
  } catch (err) {
    console.warn('Failed to persist pods to localStorage', err);
  }
}

function podsForProject(projectSlug: string): Pod[] {
  return [...MOCK_PODS, ...readCreated()].filter((p) => matchProjectSlug(p.projectSlug, projectSlug));
}

function matchesPodId(pod: Pod, podId: string): boolean {
  const id = podId.toLowerCase();
  return pod.id.toLowerCase() === id || pod.type.toLowerCase() === id || podIdFor(pod.type) === id;
}

export const podsApi = {
  /** Every pod in every project (for the /pods directory). */
  async listAllPods(): Promise<Pod[]> {
    return [...MOCK_PODS, ...readCreated()];
  },

  async listPods(projectSlug: string): Promise<Pod[]> {
    return podsForProject(projectSlug);
  },

  /** A pod within one project. Scoped by project, so pod-fe in two projects never collide. */
  async getPod(projectSlug: string, podId: string): Promise<Pod | null> {
    return podsForProject(projectSlug).find((p) => matchesPodId(p, podId)) ?? null;
  },

  async createPod(projectSlug: string, input: CreatePodInput): Promise<Pod> {
    const slug = projectSlug.trim().toLowerCase();
    const name = input.name.trim();
    if (!slug) throw new Error('A project is required to create a pod.');
    if (name.length < 3) throw new Error('Pod name must be at least 3 characters.');
    if (!POD_TYPES.includes(input.type)) throw new Error(`Unknown pod type "${input.type}".`);

    if (podsForProject(slug).some((p) => p.type === input.type)) {
      throw new Error(`This project already has a ${POD_TYPE_LABELS[input.type]} pod.`);
    }

    let members: PodMember[] = [];
    let leadName: string | undefined;
    if (input.leadId) {
      const lead = MOCK_USERS.find((u) => u.id === input.leadId);
      if (!lead) throw new Error('The selected Pod Lead was not found.');
      leadName = lead.name;
      members = [
        {
          id: `mem-${slug}-${input.type.toLowerCase()}-${lead.id}`,
          userId: lead.id,
          name: lead.name,
          email: lead.email,
          githubHandle: lead.githubHandle,
          avatarUrl: lead.image,
          roleInPod: 'Pod Lead',
          joinedDate: new Date().toISOString().slice(0, 10),
        },
      ];
    }

    const pod: Pod = {
      id: podIdFor(input.type),
      projectSlug: slug,
      name,
      type: input.type,
      leadId: input.leadId,
      leadName,
      memberCount: members.length,
      members,
    };

    writeCreated([...readCreated(), pod]);
    return pod;
  },
};
