'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface EmneDeletionProps {
  emneId: string
  emneTitle: string
  isCreator: boolean
}

export function EmneDeletion({ emneId, emneTitle, isCreator }: EmneDeletionProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }

    setLoading(true)

    try {
      // Call the delete function
      const { error } = await supabase.rpc('delete_emne', {
        p_emne_id: emneId
      })

      if (error) throw error

      // Success - redirect to emner list
      router.push('/emner')
      
    } catch (error: any) {
      console.error('Error deleting emne:', error)
      alert('Kunne ikke slette emne: ' + (error.message || 'Ukjent feil'))
      setShowConfirm(false)
    } finally {
      setLoading(false)
    }
  }

  if (!isCreator) {
    return null
  }

  return (
    <div className="bg-white border-2 border-red-100 shadow-xl rounded-2xl p-6">
      <h2 className="text-xl font-bold text-black mb-2">Farlig sone</h2>
      <p className="text-sm text-gray-600 mb-6">
        Du kan slette dette emnet permanent. Dette kan ikke angres.
      </p>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors duration-200"
        >
          Slett emne
        </button>
      ) : (
        <div className="space-y-4">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <p className="text-sm font-bold text-red-900 mb-2">
              ⚠️ Bekreft sletting
            </p>
            <p className="text-sm text-red-800">
              Er du sikker på at du vil slette <strong>"{emneTitle}"</strong>?
              Dette vil permanent slette alle møter, oppgaver, bidrag og dokumenter knyttet til dette emnet.
            </p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold rounded-xl transition-colors duration-200"
            >
              {loading ? 'Sletter...' : 'Bekreft sletting'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={loading}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-black font-bold rounded-xl transition-colors duration-200"
            >
              Avbryt
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

