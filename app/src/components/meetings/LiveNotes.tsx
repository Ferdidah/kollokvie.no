'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Contribution } from '@/types/database'

interface LiveNotesProps {
  emneId: string
  meetingId: string
  userId: string
}

export function LiveNotes({ emneId, meetingId, userId }: LiveNotesProps) {
  const [notes, setNotes] = useState<Contribution[]>([])
  const [newNote, setNewNote] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // Fetch existing notes
  useEffect(() => {
    fetchNotes()
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('meeting-notes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'contributions',
          filter: `emne_id=eq.${emneId},meeting_id=eq.${meetingId}`
        }, 
        (payload) => {
          console.log('Real-time update:', payload)
          fetchNotes()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [emneId, meetingId])

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('contributions')
        .select('*')
        .eq('emne_id', emneId)
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setNotes(data || [])
    } catch (error) {
      console.error('Error fetching notes:', error)
    }
  }

  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newNote.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('contributions')
        .insert({
          emne_id: emneId,
          meeting_id: meetingId,
          user_id: userId,
          title: 'Møtenotat',
          content: newNote.trim(),
          type: 'note'
        })

      if (error) throw error
      
      setNewNote('')
      // Notes will be updated via real-time subscription
    } catch (error) {
      console.error('Error saving note:', error)
      alert('Kunne ikke lagre notat: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleTyping = (value: string) => {
    setNewNote(value)
    setIsTyping(value.length > 0)
  }

  return (
    <div className="bg-white border-2 border-blue-100 shadow-xl rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-black">Live Notater</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>Auto-lagring aktivert</span>
        </div>
      </div>

      {/* Notes Display */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 min-h-[200px] max-h-[400px] overflow-y-auto mb-4">
        {notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="bg-white border-2 border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-xs">
                        {note.user_id === userId ? 'Du' : 'M'}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-black">
                      {note.user_id === userId ? 'Deg' : 'Medlem'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(note.created_at).toLocaleTimeString('nb-NO', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <p className="text-gray-700 font-medium text-sm leading-relaxed">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 font-medium">
              Ingen notater ennå. Start å skriv for å dele med gruppen.
            </p>
          </div>
        )}
      </div>

      {/* Note Input */}
      <form onSubmit={handleSubmitNote} className="space-y-3">
        <div className="relative">
          <textarea
            value={newNote}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder="Skriv ditt notat her... (trykk Enter for å sende)"
            className="block w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-black font-medium placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
            rows={3}
            disabled={loading}
          />
          {isTyping && (
            <div className="absolute bottom-2 right-2">
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>Skriver...</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              Vedlegg
            </button>
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Del
            </button>
          </div>
          
          <button
            type="submit"
            disabled={loading || !newNote.trim()}
            className="inline-flex items-center px-4 py-2 border-2 border-transparent shadow-lg text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Lagrer...
              </>
            ) : (
              'Send notat'
            )}
          </button>
        </div>
      </form>

      {/* Export Options */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t-2 border-gray-200">
        <div className="text-sm text-gray-600">
          {notes.length} notater • Sist oppdatert {new Date().toLocaleTimeString('nb-NO')}
        </div>
        <button className="inline-flex items-center px-3 py-2 border-2 border-gray-300 shadow-lg text-sm font-bold rounded-xl text-black bg-white hover:bg-gray-50 hover:border-gray-400 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Eksporter notater
        </button>
      </div>
    </div>
  )
}

