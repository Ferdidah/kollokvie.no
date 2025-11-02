'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

interface Member {
  id: string
  user_id: string
  role: 'admin' | 'member' | 'leader'
  joined_at: string
  email?: string
  member_id?: string
  member_user_id?: string
  member_email?: string
  member_role?: string
  member_joined_at?: string
}

interface MeetingMembersProps {
  emneId: string
  initialMembers: Array<{
    id: string
    user_id: string
    role: 'admin' | 'member' | 'leader'
    joined_at: string
  }>
}

export function MeetingMembers({ emneId, initialMembers }: MeetingMembersProps) {
  const [members, setMembers] = useState<Member[]>(
    initialMembers.map(m => ({ ...m, email: undefined }))
  )
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    const fetchMemberEmails = async () => {
      try {
        const { data, error: rpcError } = await supabase.rpc('get_emne_member_emails', {
          p_emne_id: emneId
        })

        if (rpcError) {
          console.error('Error fetching member emails:', rpcError)
          setLoading(false)
          return
        }

        if (data && Array.isArray(data) && data.length > 0) {
          const transformedMembers: Member[] = data.map((row: any) => ({
            id: row.member_id || row.id,
            user_id: row.member_user_id || row.user_id,
            role: (row.member_role || row.role) as 'admin' | 'member' | 'leader',
            joined_at: row.member_joined_at || row.joined_at,
            email: row.member_email || row.email
          }))
          setMembers(transformedMembers)
        }
      } catch (err) {
        console.error('Error in fetchMemberEmails:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMemberEmails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emneId])

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

  if (loading) {
    return (
      <div className="bg-white border-2 border-blue-100 shadow-xl rounded-2xl p-6">
        <h3 className="text-lg font-bold text-black mb-4">Medlemmer</h3>
        <p className="text-gray-600 text-sm">Laster medlemmer...</p>
      </div>
    )
  }

  return (
    <div className="bg-white border-2 border-blue-100 shadow-xl rounded-2xl p-6">
      <h3 className="text-lg font-bold text-black mb-4">Medlemmer</h3>
      <div className="space-y-3">
        {members.map((member) => (
          <div key={member.id} className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-bold text-sm">
                {member.email?.charAt(0).toUpperCase() || member.user_id.slice(0, 1).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-black text-sm">
                {member.email?.split('@')[0] || `Bruker ${member.user_id.slice(0, 8)}`}
              </p>
              <p className="text-gray-600 text-xs">
                {getRoleLabel(member.role)}
              </p>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

