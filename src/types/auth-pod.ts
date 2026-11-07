export type GlobalRole = 'Super Admin' | 'Project Lead' | 'Pod Lead' | 'Contributor';

export type PodRole = string;

export type PodType = 'FE' | 'BE' | 'INT' | 'QA';

export interface User {
  id: string;
  name: string;
  email: string;
  image: string;
  githubHandle: string;
  globalRole: GlobalRole;
}

export interface PodMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  githubHandle: string;
  avatarUrl: string;
  roleInPod: PodRole;
  joinedDate: string;
}

export interface Pod {
  id: string;
  projectSlug: string;
  name: string;
  type: PodType;
  leadId: string | null;
  leadName?: string;
  memberCount: number;
  members: PodMember[];
}
