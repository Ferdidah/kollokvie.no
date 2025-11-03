import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { CreateTask } from '@/components/emner/CreateTask'
import { TaskList } from '@/components/emner/TaskList'
import type { Task } from '@/types/database'

export const dynamic = 'force-dynamic' // Ensure data is always fresh

interface TasksPageProps {
  params: Promise<{
    emneId: string
  }>
}

export default async function TasksPage({ params }: TasksPageProps) {
  const { emneId } = await params
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch emne details to verify access
  const { data: emne, error: emneError } = await supabase
    .from('emne')
    .select('*')
    .eq('id', emneId)
    .single()

  if (emneError || !emne) {
    redirect('/dashboard/emner')
  }

  // Check if user is a member
  const { data: membership } = await supabase
    .from('emne_members')
    .select('role')
    .eq('emne_id', emneId)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    redirect('/dashboard/emner')
  }

  // Fetch all tasks for this emne (all members can see all tasks)
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .eq('emne_id', emneId)
    .order('created_at', { ascending: false })

  if (tasksError) {
    console.error('Error fetching tasks:', tasksError)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-black text-black tracking-tight">Oppgaver</h1>
        <p className="mt-3 text-lg text-black font-medium">
          Felles- og personlige oppgaver med filtre og eierskap
        </p>
      </div>

      <CreateTask emneId={emneId} />

      <TaskList 
        emneId={emneId}
        initialTasks={(tasks || []) as Task[]}
        currentUserId={user.id}
      />
    </div>
  )
}
