'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { GroupMember } from '@/types/database'

interface GroupMembersClientProps {
  members: GroupMember[]
  currentUserId: string
  isLeader: boolean
  groupId: string
}

export function GroupMembersClient({ 
  members, 
  currentUserId, 
  isLeader, 
  groupId 
}: GroupMembersClientProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)

  async function handleRoleChange(memberId: string, newRole: string) {
    setLoading(memberId)
    try {
      const { error } = await supabase
        .from('group_members')
        .update({ role: newRole })
        .eq('id', memberId)

      if (error) throw error

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error: any) {
      alert('Kunne ikke oppdatere rolle: ' + error.message)
    } finally {
      setLoading(null)
    }
  }

  async function handleRemoveMember(memberId: string, memberUserId: string) {
    if (memberUserId === currentUserId) {
      alert('Du kan ikke fjerne deg selv fra gruppen')
      return
    }

    if (!confirm('Er du sikker på at du vil fjerne dette medlemmet fra gruppen?')) {
      return
    }

    setLoading(memberId)
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error: any) {
      alert('Kunne ikke fjerne medlem: ' + error.message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-3">
      {members.map((member) => (
        <div key={member.id} className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {member.user_id.substring(0, 2).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {member.user_id === currentUserId ? 'Du' : `Bruker ${member.user_id.substring(0, 8)}`}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {member.role === 'leader' ? 'Gruppeleder' : 'Medlem'}
                {member.user_id === currentUserId && ' (deg)'}
              </p>
            </div>
          </div>
          
          {isLeader && member.user_id !== currentUserId && (
            <div className="flex items-center space-x-2">
              {member.role === 'member' ? (
                <button
                  onClick={() => handleRoleChange(member.id, 'leader')}
                  disabled={loading === member.id}
                  className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  Gjør til leder
                </button>
              ) : (
                <button
                  onClick={() => handleRoleChange(member.id, 'member')}
                  disabled={loading === member.id}
                  className="text-xs text-gray-600 hover:text-gray-700 disabled:opacity-50"
                >
                  Fjern lederrolle
                </button>
              )}
              <button
                onClick={() => handleRemoveMember(member.id, member.user_id)}
                disabled={loading === member.id}
                className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                Fjern
              </button>
            </div>
          )}
        </div>
      ))}
      
      {members.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          Ingen medlemmer i gruppen ennå.
        </p>
      )}
    </div>
  )
}

