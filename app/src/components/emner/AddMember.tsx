'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface AddMemberProps {
  emneId: string
  isCreator: boolean
}

export function AddMember({ emneId, isCreator }: AddMemberProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'member' | 'leader'>('member')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

  // Only creators can add members (or admins, but we'll check server-side)
  if (!isCreator) {
    return null
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: rpcError } = await supabase.rpc('add_emne_member', {
        p_emne_id: emneId,
        p_user_email: email.trim(),
        p_role: role
      })

      if (rpcError) {
        throw new Error(rpcError.message)
      }

      setSuccess(true)
      setEmail('')
      
      // Refresh to show new member in list and update counts
      router.refresh()
    } catch (err: any) {
      console.error('Error adding member:', err)
      setError(err.message || 'Kunne ikke legge til medlem')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      <h2 className="text-2xl font-bold text-black mb-4">Legg til medlem</h2>
      
      <form onSubmit={handleAddMember} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
            E-postadresse
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="bruker@example.com"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-black mb-2">
            Rolle
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as 'admin' | 'member' | 'leader')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
          >
            <option value="member">Medlem</option>
            <option value="admin">Administrator</option>
            <option value="leader">Leder</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            Medlem lagt til!
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Legger til...' : 'Legg til medlem'}
        </button>
      </form>
    </div>
  )
}

