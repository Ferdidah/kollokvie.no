'use client'

import { usePathname } from 'next/navigation'
import DashboardNav from './DashboardNav'

export function DashboardNavWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isEmneRoute = pathname?.match(/^\/dashboard\/emner\/[^/]+\/?/) !== null
  
  // If we're in an emne route, let the emne layout handle the full structure
  if (isEmneRoute) {
    return <>{children}</>
  }
  
  // For non-emne routes, provide the dashboard structure
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <DashboardNav />
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  )
}

