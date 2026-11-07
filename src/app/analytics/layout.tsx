import { DashboardProviders } from '@/components/dashboard/DashboardProviders';

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <DashboardProviders>{children}</DashboardProviders>;
}
