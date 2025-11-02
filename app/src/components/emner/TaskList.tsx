'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import type { Task } from '@/types/database'

interface TaskListProps {
  emneId: string
  initialTasks: Task[]
  currentUserId: string
}

type FilterStatus = 'all' | 'todo' | 'in_progress' | 'completed'
type FilterOwnership = 'all' | 'mine' | 'felles'
type FilterPriority = 'all' | 'high' | 'medium' | 'low'

export function TaskList({ emneId, initialTasks, currentUserId }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [ownershipFilter, setOwnershipFilter] = useState<FilterOwnership>('all')
  const [priorityFilter, setPriorityFilter] = useState<FilterPriority>('all')
  
  const supabase = createClient()
  const router = useRouter()

  // Fetch tasks when filters change or component mounts
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true)
      try {
        let query = supabase
          .from('tasks')
          .select('*')
          .eq('emne_id', emneId)
          .order('created_at', { ascending: false })

        // Apply status filter
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter)
        }

        // Apply ownership filter
        if (ownershipFilter === 'mine') {
          query = query.eq('user_id', currentUserId)
        } else if (ownershipFilter === 'felles') {
          query = query.is('user_id', null)
        }
        // 'all' shows both personal and shared tasks

        // Apply priority filter
        if (priorityFilter !== 'all') {
          query = query.eq('priority', priorityFilter)
        }

        const { data, error } = await query

        if (error) throw error
        setTasks(data || [])
      } catch (err) {
        console.error('Error fetching tasks:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emneId, statusFilter, ownershipFilter, priorityFilter, currentUserId])

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      const updateData: any = { status: newStatus, updated_at: new Date().toISOString() }
      
      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString()
      } else if (newStatus !== 'completed') {
        updateData.completed_at = null
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)

      if (error) throw error

      // Optimistically update UI
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus, completed_at: updateData.completed_at, updated_at: updateData.updated_at }
          : task
      ))
      
      router.refresh()
    } catch (err) {
      console.error('Error updating task:', err)
      alert('Kunne ikke oppdatere oppgave')
    }
  }

  const deleteTask = async (taskId: string) => {
    if (!confirm('Er du sikker på at du vil slette denne oppgaven?')) return

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      setTasks(prev => prev.filter(task => task.id !== taskId))
      router.refresh()
    } catch (err) {
      console.error('Error deleting task:', err)
      alert('Kunne ikke slette oppgave')
    }
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low': return 'bg-green-100 text-green-800 border-green-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-300'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'todo': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const filteredTasks = tasks.filter(task => {
    // Additional client-side filtering if needed
    return true
  })

  return (
    <div>
      {/* Filters */}
      <div className="bg-white border-2 border-gray-100 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-black mb-2 uppercase">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-black font-medium"
            >
              <option value="all">Alle</option>
              <option value="todo">Todo</option>
              <option value="in_progress">Pågår</option>
              <option value="completed">Fullført</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-2 uppercase">Eierskap</label>
            <select
              value={ownershipFilter}
              onChange={(e) => setOwnershipFilter(e.target.value as FilterOwnership)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-black font-medium"
            >
              <option value="all">Alle oppgaver</option>
              <option value="mine">Mine oppgaver</option>
              <option value="felles">Felles oppgaver</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-2 uppercase">Prioritet</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as FilterPriority)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-black font-medium"
            >
              <option value="all">Alle</option>
              <option value="high">Høy</option>
              <option value="medium">Medium</option>
              <option value="low">Lav</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-white border-2 border-gray-100 rounded-xl">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-black mb-2">Ingen oppgaver</h3>
          <p className="text-gray-600 font-medium">Opprett din første oppgave for å komme i gang</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white border-2 rounded-xl p-5 hover:shadow-lg transition-all ${
                task.status === 'completed' ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      onChange={(e) => {
                        updateTaskStatus(task.id, e.target.checked ? 'completed' : 'todo')
                      }}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <h3 className={`font-bold text-lg ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-black'}`}>
                      {task.title}
                    </h3>
                  </div>

                  {task.description && (
                    <p className="text-gray-700 font-medium mb-3 ml-8">{task.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 ml-8">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold border-2 ${getPriorityColor(task.priority)}`}>
                      {task.priority === 'high' ? 'Høy' : task.priority === 'medium' ? 'Medium' : 'Lav'}
                    </span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold border-2 ${getStatusColor(task.status)}`}>
                      {task.status === 'todo' ? 'Todo' : task.status === 'in_progress' ? 'Pågår' : task.status === 'completed' ? 'Fullført' : 'Kansellert'}
                    </span>
                    {task.user_id === null && (
                      <span className="px-2 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-800 border-2 border-purple-300">
                        Felles
                      </span>
                    )}
                    {task.user_id === currentUserId && task.user_id !== null && (
                      <span className="px-2 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 border-2 border-blue-300">
                        Min
                      </span>
                    )}
                    {task.due_date && (
                      <span className="text-xs text-gray-600 font-medium">
                        Forfall: {new Date(task.due_date).toLocaleDateString('nb-NO', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {task.status !== 'completed' && (
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value as Task['status'])}
                      className="px-3 py-1 border-2 border-gray-200 rounded-lg text-sm font-medium text-black"
                    >
                      <option value="todo">Todo</option>
                      <option value="in_progress">Pågår</option>
                      <option value="completed">Fullført</option>
                    </select>
                  )}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Slett oppgave"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

