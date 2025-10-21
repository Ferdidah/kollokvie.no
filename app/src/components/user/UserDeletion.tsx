'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface UserDeletionProps {
  userId: string
  userEmail: string
}

export function UserDeletion({ userId, userEmail }: UserDeletionProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [confirmationText, setConfirmationText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()
  const router = useRouter()

  const handleDeleteAccount = async () => {
    if (confirmationText !== 'SLETT KONTO') {
      setError('Du må skrive "SLETT KONTO" for å bekrefte')
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      // Use the RPC function to safely delete all user data
      const { error: deleteError } = await supabase.rpc('delete_user_account')

      if (deleteError) {
        throw new Error(`Feil ved sletting av brukerdata: ${deleteError.message}`)
      }

      // Sign out and redirect
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()

    } catch (error: any) {
      console.error('Error deleting account:', error)
      setError(error.message || 'En feil oppstod ved sletting av kontoen')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      {/* Delete Account Button */}
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-red-800 mb-2">Slett konto</h3>
            <p className="text-red-700 font-medium text-sm">
              Dette vil permanent slette din konto og all tilhørende data. Denne handlingen kan ikke angres.
            </p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center px-4 py-2 border-2 border-red-300 shadow-lg text-sm font-bold rounded-xl text-red-700 bg-white hover:bg-red-50 hover:border-red-400 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Slett konto
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Bekreft sletting av konto</h3>
              <p className="text-gray-700 font-medium mb-4">
                Du er på vei til å permanent slette kontoen <strong>{userEmail}</strong> og all tilhørende data.
              </p>
              <p className="text-red-600 font-bold text-sm mb-4">
                Dette inkluderer alle dine emner, møter, notater og oppgaver. Denne handlingen kan ikke angres.
              </p>
            </div>

            <div className="mb-6">
              <label htmlFor="confirmation" className="block text-sm font-bold text-black mb-2">
                Skriv "SLETT KONTO" for å bekrefte:
              </label>
              <input
                type="text"
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="SLETT KONTO"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-red-500 transition-colors duration-200 text-black"
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                <p className="text-red-700 font-medium text-sm">{error}</p>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setConfirmationText('')
                  setError(null)
                }}
                className="flex-1 inline-flex items-center justify-center px-4 py-3 border-2 border-gray-300 shadow-lg text-sm font-bold rounded-xl text-black bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Avbryt
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || confirmationText !== 'SLETT KONTO'}
                className="flex-1 inline-flex items-center justify-center px-4 py-3 border-2 border-transparent shadow-lg text-sm font-bold rounded-xl text-white bg-red-600 hover:bg-red-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sletter...
                  </>
                ) : (
                  'Slett konto permanent'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
