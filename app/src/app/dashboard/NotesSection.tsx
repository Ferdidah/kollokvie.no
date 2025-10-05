'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import type { Note, NoteInsert } from '@/types/database'

interface NotesSectionProps {
  notes: Note[]
}

export function NotesSection({ notes: initialNotes }: NotesSectionProps) {
  const supabase = createClient()
  const router = useRouter()
  
  const [notes, setNotes] = useState(initialNotes)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    content: ''
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

      if (editingNote) {
        // Update existing note
        const { data, error } = await supabase
          .from('notes')
          .update({
            title: formData.title.trim(),
            content: formData.content.trim() || null
          })
          .eq('id', editingNote.id)
          .select()
          .single()

        if (error) throw error

        setNotes(prev => prev.map(note => 
          note.id === editingNote.id ? data : note
        ))
      } else {
        // Create new note
        const noteData: NoteInsert = {
          user_id: user.id,
          title: formData.title.trim(),
          content: formData.content.trim() || null
        }

        const { data, error } = await supabase
          .from('notes')
          .insert(noteData)
          .select()
          .single()

        if (error) throw error

        setNotes(prev => [data, ...prev])
      }

      // Reset form
      setFormData({ title: '', content: '' })
      setShowForm(false)
      setEditingNote(null)
      
    } catch (error: any) {
      console.error('Error saving note:', error)
      alert('Kunne ikke lagre notat: ' + (error.message || 'Ukjent feil'))
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(noteId: string) {
    if (!confirm('Er du sikker på at du vil slette dette notatet?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)

      if (error) throw error

      setNotes(prev => prev.filter(note => note.id !== noteId))
    } catch (error: any) {
      console.error('Error deleting note:', error)
      alert('Kunne ikke slette notat: ' + (error.message || 'Ukjent feil'))
    }
  }

  function startEdit(note: Note) {
    setEditingNote(note)
    setFormData({
      title: note.title,
      content: note.content || ''
    })
    setShowForm(true)
  }

  function cancelEdit() {
    setEditingNote(null)
    setFormData({ title: '', content: '' })
    setShowForm(false)
  }

  return (
    <div className="bg-white border-2 border-blue-100 shadow-xl rounded-3xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-black">Mine Notater</h2>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={showForm}
          className="inline-flex items-center px-6 py-3 border-2 border-blue-200 text-sm font-bold rounded-2xl text-black bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nytt Notat
        </button>
      </div>

      {/* New/Edit Note Form */}
      {showForm && (
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-bold text-black mb-2">
                  Tittel
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="block w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-black font-medium placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Skriv tittel på notatet..."
                  required
                />
              </div>
              
              <div>
                <label htmlFor="content" className="block text-sm font-bold text-black mb-2">
                  Innhold
                </label>
                <textarea
                  id="content"
                  rows={5}
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="block w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-black font-medium placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                  placeholder="Skriv notatinnhold her..."
                />
              </div>
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex justify-center items-center py-3 px-6 border-2 border-transparent shadow-lg text-base font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
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
                  editingNote ? 'Oppdater Notat' : 'Lagre Notat'
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

      {/* Notes List */}
      <div className="space-y-4">
        {notes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="h-10 w-10 text-blue-600" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-black mb-2">Ingen notater ennå</h3>
            <p className="text-black font-medium">
              Opprett ditt første notat ved å klikke på "Nytt Notat" over.
            </p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-gradient-to-r from-white to-blue-50 border-2 border-blue-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-200">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-black mb-2">{note.title}</h3>
                  {note.content && (
                    <p className="text-black font-medium leading-relaxed mb-3 line-clamp-4">{note.content}</p>
                  )}
                  <p className="text-sm text-black font-medium opacity-70">
                    📅 {new Date(note.updated_at).toLocaleDateString('nb-NO')} • ⏰ {new Date(note.updated_at).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                
                <div className="ml-6 flex flex-col space-y-2">
                  <button
                    onClick={() => startEdit(note)}
                    className="inline-flex items-center px-3 py-2 text-xs font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors duration-200"
                  >
                    ✏️ Rediger
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="inline-flex items-center px-3 py-2 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors duration-200"
                  >
                    🗑️ Slett
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
