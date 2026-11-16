import { DashboardProviders } from '@/components/dashboard/DashboardProviders';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardProviders>{children}</DashboardProviders>;
}
