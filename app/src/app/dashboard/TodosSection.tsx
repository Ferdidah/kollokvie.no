'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import type { Todo, TodoInsert } from '@/types/database'

interface TodosSectionProps {
  todos: Todo[]
}

export function TodosSection({ todos: initialTodos }: TodosSectionProps) {
  const supabase = createClient()
  const router = useRouter()
  
  const [todos, setTodos] = useState(initialTodos)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: ''
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('Tittel er påkrevd')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (editingTodo) {
        // Update existing todo
        const { data, error } = await supabase
          .from('todos')
          .update({
            title: formData.title.trim(),
            description: formData.description.trim() || null,
            due_date: formData.due_date || null
          })
          .eq('id', editingTodo.id)
          .select()
          .single()

        if (error) throw error

        setTodos(prev => prev.map(todo => 
          todo.id === editingTodo.id ? data : todo
        ))
      } else {
        // Create new todo
        const todoData: TodoInsert = {
          user_id: user.id,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          due_date: formData.due_date || null,
          completed: false
        }

        const { data, error } = await supabase
          .from('todos')
          .insert(todoData)
          .select()
          .single()

        if (error) throw error

        setTodos(prev => [data, ...prev])
      }

      // Reset form
      setFormData({ title: '', description: '', due_date: '' })
      setShowForm(false)
      setEditingTodo(null)
      
    } catch (error: any) {
      console.error('Error saving todo:', error)
      alert('Kunne ikke lagre todo: ' + (error.message || 'Ukjent feil'))
    } finally {
      setLoading(false)
    }
  }

  async function toggleCompleted(todoId: string, completed: boolean) {
    try {
      const { data, error } = await supabase
        .from('todos')
        .update({ completed })
        .eq('id', todoId)
        .select()
        .single()

      if (error) throw error

      setTodos(prev => prev.map(todo => 
        todo.id === todoId ? { ...todo, completed } : todo
      ))
    } catch (error: any) {
      console.error('Error updating todo:', error)
      alert('Kunne ikke oppdatere todo: ' + (error.message || 'Ukjent feil'))
    }
  }

  async function handleDelete(todoId: string) {
    if (!confirm('Er du sikker på at du vil slette denne todo-en?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', todoId)

      if (error) throw error

      setTodos(prev => prev.filter(todo => todo.id !== todoId))
    } catch (error: any) {
      console.error('Error deleting todo:', error)
      alert('Kunne ikke slette todo: ' + (error.message || 'Ukjent feil'))
    }
  }

  function startEdit(todo: Todo) {
    setEditingTodo(todo)
    setFormData({
      title: todo.title,
      description: todo.description || '',
      due_date: todo.due_date ? todo.due_date.split('T')[0] : ''
    })
    setShowForm(true)
  }

  function cancelEdit() {
    setEditingTodo(null)
    setFormData({ title: '', description: '', due_date: '' })
    setShowForm(false)
  }

  const completedTodos = todos.filter(todo => todo.completed)
  const pendingTodos = todos.filter(todo => !todo.completed)

  return (
    <div className="bg-white border-2 border-purple-100 shadow-xl rounded-3xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3">
            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-black">Mine Todos</h2>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={showForm}
          className="inline-flex items-center px-6 py-3 border-2 border-purple-200 text-sm font-bold rounded-2xl text-black bg-purple-50 hover:bg-purple-100 hover:border-purple-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-all duration-200"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ny Todo
        </button>
      </div>

      {/* New/Edit Todo Form */}
      {showForm && (
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="todo-title" className="block text-sm font-bold text-black mb-2">
                  Tittel
                </label>
                <input
                  type="text"
                  id="todo-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="block w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-black font-medium placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                  placeholder="Hva skal gjøres?"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="todo-description" className="block text-sm font-bold text-black mb-2">
                  Beskrivelse (valgfri)
                </label>
                <textarea
                  id="todo-description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="block w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-black font-medium placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 resize-none"
                  placeholder="Flere detaljer..."
                />
              </div>

              <div>
                <label htmlFor="todo-due-date" className="block text-sm font-bold text-black mb-2">
                  Forfallsdato (valgfri)
                </label>
                <input
                  type="date"
                  id="todo-due-date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  className="block w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-black font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                />
              </div>
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex justify-center items-center py-3 px-6 border-2 border-transparent shadow-lg text-base font-bold rounded-xl text-white bg-purple-600 hover:bg-purple-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-all duration-200"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Lagrer...
                  </>
                ) : (
                  editingTodo ? 'Oppdater Todo' : 'Lagre Todo'
                )}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex justify-center py-3 px-6 border-2 border-gray-300 shadow-lg text-base font-bold rounded-xl text-black bg-white hover:bg-gray-50 hover:border-gray-400 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
              >
                Avbryt
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Todos List */}
      <div className="space-y-6">
        {/* Pending Todos */}
        {pendingTodos.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-black mb-4 flex items-center">
              <span className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
              Gjenstående ({pendingTodos.length})
            </h3>
            <div className="space-y-3">
              {pendingTodos.map((todo) => (
                <div key={todo.id} className="bg-gradient-to-r from-white to-purple-50 border-2 border-purple-100 rounded-2xl p-5 hover:shadow-lg transition-all duration-200 hover:border-purple-200">
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={(e) => toggleCompleted(todo.id, e.target.checked)}
                      className="mt-1 h-5 w-5 text-purple-600 focus:ring-purple-500 border-2 border-gray-300 rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold text-black mb-1">{todo.title}</h4>
                      {todo.description && (
                        <p className="text-black font-medium mb-2 leading-relaxed">{todo.description}</p>
                      )}
                      {todo.due_date && (
                        <p className="text-sm text-black font-medium opacity-70 inline-flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Forfaller: {new Date(todo.due_date).toLocaleDateString('nb-NO')}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => startEdit(todo)}
                        className="inline-flex items-center px-3 py-2 text-xs font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors duration-200"
                      >
                        ✏️ Rediger
                      </button>
                      <button
                        onClick={() => handleDelete(todo.id)}
                        className="inline-flex items-center px-3 py-2 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors duration-200"
                      >
                        🗑️ Slett
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Todos */}
        {completedTodos.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-black mb-4 flex items-center">
              <span className="w-3 h-3 bg-green-400 rounded-full mr-2"></span>
              Fullført ({completedTodos.length})
            </h3>
            <div className="space-y-3">
              {completedTodos.map((todo) => (
                <div key={todo.id} className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5 opacity-80 hover:opacity-100 transition-all duration-200">
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={(e) => toggleCompleted(todo.id, e.target.checked)}
                      className="mt-1 h-5 w-5 text-green-600 focus:ring-green-500 border-2 border-gray-300 rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold text-green-800 line-through mb-1">{todo.title}</h4>
                      {todo.description && (
                        <p className="text-green-700 font-medium line-through leading-relaxed">{todo.description}</p>
                      )}
                    </div>
                    
                    <div className="flex">
                      <button
                        onClick={() => handleDelete(todo.id)}
                        className="inline-flex items-center px-3 py-2 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors duration-200"
                      >
                        🗑️ Slett
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {todos.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="h-10 w-10 text-purple-600" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-black mb-2">Ingen todos ennå</h3>
            <p className="text-black font-medium">
              Opprett din første todo ved å klikke på "Ny Todo" over.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
