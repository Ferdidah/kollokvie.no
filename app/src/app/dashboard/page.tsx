import { redirect } from 'next/navigation'

export default function DashboardPage() {
  // Redirect to the new emner-based system
  redirect('/emner')
}