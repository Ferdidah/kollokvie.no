import { DashboardNavWrapper } from '@/components/navigation/DashboardNavWrapper'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardNavWrapper>{children}</DashboardNavWrapper>
}


