'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface CreateTaskProps {
  emneId: string
  meetingId?: string | null
}

export function CreateTask({ emneId, meetingId }: CreateTaskProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: '',
    isShared: false // false = personal task (user_id), true = shared task (user_id = null)
  })

  const supabase = createClient()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setError('Tittel er påkrevd')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Ikke autentisert')

      const { error: insertError } = await supabase
        .from('tasks')
        .insert({
          emne_id: emneId,
          meeting_id: meetingId || null,
          user_id: formData.isShared ? null : user.id, // null = shared task
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          priority: formData.priority,
          due_date: formData.due_date || null,
          status: 'todo'
        })

      if (insertError) throw insertError

      // Reset form and close
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        isShared: false
      })
      setIsOpen(false)
      router.refresh()
    } catch (err: any) {
      console.error('Error creating task:', err)
      setError(err.message || 'Kunne ikke opprette oppgave')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full mb-6 inline-flex items-center justify-center px-4 py-3 border-2 border-blue-200 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Opprett ny oppgave
      </button>
    )
  }

  return (
    <div className="bg-white border-2 border-blue-100 rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-black">Opprett ny oppgave</h2>
        <button
          onClick={() => {
            setIsOpen(false)
            setError(null)
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-bold text-black mb-2">
            Tittel *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            placeholder="F.eks. Gjennomgang av kapittel 5"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-bold text-black mb-2">
            Beskrivelse
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            placeholder="Ytterligere detaljer om oppgaven..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="priority" className="block text-sm font-bold text-black mb-2">
              Prioritet
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            >
              <option value="low">Lav</option>
              <option value="medium">Medium</option>
              <option value="high">Høy</option>
            </select>
          </div>

          <div>
            <label htmlFor="due_date" className="block text-sm font-bold text-black mb-2">
              Forfall
            </label>
            <input
              type="datetime-local"
              id="due_date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isShared"
            checked={formData.isShared}
            onChange={(e) => setFormData(prev => ({ ...prev, isShared: e.target.checked }))}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isShared" className="ml-2 text-sm font-medium text-black">
            Felles oppgave (synlig for alle medlemmer)
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Oppretter...' : 'Opprett oppgave'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              setError(null)
            }}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg text-black font-medium hover:bg-gray-50"
          >
            Avbryt
          </button>
        </div>
      </form>
    </div>
  )
}

