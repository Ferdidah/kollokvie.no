'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface JoinGroupClientProps {
  groupId: string
  groupName: string
}

export function JoinGroupClient({ groupId, groupName }: JoinGroupClientProps) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleJoinGroup() {
    setLoading(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Du må være logget inn for å bli med i en gruppe')
        router.push('/login')
        return
      }

      // Join the group
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member'
        })

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('Du er allerede medlem av denne gruppen')
        }
        throw error
      }

      // Success - redirect to group page
      router.push(`/groups/${groupId}`)
      
    } catch (error: any) {
      console.error('Error joining group:', error)
      alert('Kunne ikke bli med i gruppen: ' + (error.message || 'Ukjent feil'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleJoinGroup}
      disabled={loading}
      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Blir med...
        </>
      ) : (
        `Bli med i "${groupName}"`
      )}
    </button>
  )
}

