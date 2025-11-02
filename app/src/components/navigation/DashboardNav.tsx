'use client'

import { usePathname } from 'next/navigation'
import GlobalNav from './GlobalNav'

export function useIsEmneRoute() {
  const pathname = usePathname()
  return pathname?.match(/^\/dashboard\/emner\/[^/]+\/?/) !== null
}

export default function DashboardNav() {
  const isEmneRoute = useIsEmneRoute()
  
  // If we're in an emne detail route, don't render GlobalNav
  // The emne layout will handle navigation
  if (isEmneRoute) {
    return null
  }
  
  return <GlobalNav />
}

