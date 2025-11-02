'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface Member {
  id: string
  user_id: string
  role: 'admin' | 'member' | 'leader'
  joined_at: string
  email?: string
  // Also support the renamed columns from the function
  member_id?: string
  member_user_id?: string
  member_email?: string
  member_role?: string
  member_joined_at?: string
}

interface MemberListProps {
  members: Member[]
  emneId: string
  currentUserId: string
  isCreator: boolean
}

export function MemberList({ members: initialMembers, emneId, currentUserId, isCreator }: MemberListProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [loading, setLoading] = useState(true)
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()
  const router = useRouter()

  // Fetch member emails on mount
  useEffect(() => {
    const fetchMemberEmails = async () => {
      try {
        // Try to fetch member emails via RPC function
        const { data, error: rpcError } = await supabase.rpc('get_emne_member_emails', {
          p_emne_id: emneId
        })

        if (rpcError) {
          console.error('Error fetching member emails via RPC:', rpcError)
          console.error('Full error details:', JSON.stringify(rpcError, null, 2))
          
          // Fallback: Keep the initial members (without emails) and just show them
          // The function might not exist yet, or there's a permission issue
          setLoading(false)
          return
        }

        if (data && Array.isArray(data) && data.length > 0) {
          // Transform the function results to match Member interface
          const transformedMembers: Member[] = data.map((row: any) => ({
            id: row.member_id || row.id,
            user_id: row.member_user_id || row.user_id,
            role: (row.member_role || row.role) as 'admin' | 'member' | 'leader',
            joined_at: row.member_joined_at || row.joined_at,
            email: row.member_email || row.email
          }))
          setMembers(transformedMembers)
        } else if (data && Array.isArray(data)) {
          // Empty array - no members with emails, keep initial members
          setMembers(initialMembers)
        }
      } catch (err) {
        console.error('Error in fetchMemberEmails:', err)
        // On error, keep the initial members we have
        setMembers(initialMembers)
      } finally {
        setLoading(false)
      }
    }

    fetchMemberEmails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emneId])

  const handleRemoveMember = async (memberId: string, userId: string) => {
    if (!confirm('Er du sikker på at du vil fjerne dette medlemmet?')) {
      return
    }

    setRemovingMemberId(memberId)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from('emne_members')
        .delete()
        .eq('id', memberId)

      if (deleteError) {
        throw new Error(deleteError.message)
      }

      router.refresh()
    } catch (err: any) {
      console.error('Error removing member:', err)
      setError(err.message || 'Kunne ikke fjerne medlem')
    } finally {
      setRemovingMemberId(null)
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator'
      case 'leader':
        return 'Leder'
      default:
        return 'Medlem'
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700'
      case 'leader':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <p className="text-black">Laster medlemmer...</p>
      </div>
    )
  }

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <p className="text-black">Ingen medlemmer ennå.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-black mb-4">Medlemmer ({members.length})</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {members.map((member) => {
          const canRemove = isCreator && member.user_id !== currentUserId
          const isCurrentUser = member.user_id === currentUserId

          return (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-medium">
                    {member.email?.charAt(0).toUpperCase() || member.user_id.slice(0, 1).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-black">
                    {member.email || `Bruker ${member.user_id.slice(0, 8)}...`}
                    {isCurrentUser && (
                      <span className="ml-2 text-sm text-gray-500">(Deg)</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    Ble med {new Date(member.joined_at).toLocaleDateString('no-NO')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(member.role)}`}>
                  {getRoleLabel(member.role)}
                </span>
                
                {canRemove && (
                  <button
                    onClick={() => handleRemoveMember(member.id, member.user_id)}
                    disabled={removingMemberId === member.id}
                    className="text-red-600 hover:text-red-700 disabled:opacity-50"
                    title="Fjern medlem"
                  >
                    {removingMemberId === member.id ? (
                      'Fjerner...'
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

