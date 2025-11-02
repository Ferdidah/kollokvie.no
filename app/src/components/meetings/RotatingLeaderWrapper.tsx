'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { RotatingLeader } from '@/components/meetings/RotatingLeader'
import type { EmneMember } from '@/types/database'

interface RotatingLeaderWrapperProps {
  members: EmneMember[]
  currentLeader: string | null
  emneId: string
}

interface MemberWithEmail extends EmneMember {
  email?: string
}

export function RotatingLeaderWrapper({ members, currentLeader, emneId }: RotatingLeaderWrapperProps) {
  const [membersWithEmails, setMembersWithEmails] = useState<MemberWithEmail[]>(members)
  const supabase = createClient()

  useEffect(() => {
    const fetchMemberEmails = async () => {
      try {
        const { data, error: rpcError } = await supabase.rpc('get_emne_member_emails', {
          p_emne_id: emneId
        })

        if (rpcError) {
          console.error('Error fetching member emails for RotatingLeader:', rpcError)
          return
        }

        if (data && Array.isArray(data) && data.length > 0) {
          const transformedMembers: MemberWithEmail[] = data.map((row: any) => ({
            id: row.member_id || row.id,
            user_id: row.member_user_id || row.user_id,
            role: (row.member_role || row.role) as 'admin' | 'member' | 'leader',
            joined_at: row.member_joined_at || row.joined_at,
            email: row.member_email || row.email
          }))
          setMembersWithEmails(transformedMembers)
        }
      } catch (err) {
        console.error('Error in fetchMemberEmails:', err)
      }
    }

    fetchMemberEmails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emneId])

  const handleAssignLeader = (userId: string) => {
    // TODO: Implement leader assignment logic (e.g., RPC call)
    // This would update the meeting_leader field in the meetings table
  }

  const handleRotateLeader = () => {
    // TODO: Implement leader rotation logic (e.g., RPC call)
    // This would rotate to the next member in the list
  }

  return (
    <RotatingLeader 
      members={membersWithEmails}
      currentLeader={currentLeader}
      onAssignLeader={handleAssignLeader}
      onRotateLeader={handleRotateLeader}
    />
  )
}
