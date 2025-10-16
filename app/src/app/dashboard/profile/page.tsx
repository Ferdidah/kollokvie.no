import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login')
  }

  // Fetch user's notes and todos
  const { data: notes, error: notesError } = await supabase
    .from('notes')
    .select('*')
    .order('updated_at', { ascending: false })

  const { data: todos, error: todosError } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false })

  if (notesError) console.error('Error fetching notes:', notesError)
  if (todosError) console.error('Error fetching todos:', todosError)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-black tracking-tight">Profile</h1>
          <p className="mt-3 text-lg text-black font-medium">Hei, {user.email?.split('@')[0]} !</p>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-10">
          <div className="bg-white border-2 border-blue-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}