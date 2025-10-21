'use client'

import { RotatingLeader } from '@/components/meetings/RotatingLeader'
import type { EmneMember } from '@/types/database'

interface RotatingLeaderWrapperProps {
  members: EmneMember[]
  currentLeader: string | null
}

export function RotatingLeaderWrapper({ members, currentLeader }: RotatingLeaderWrapperProps) {
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
      members={members}
      currentLeader={currentLeader}
      onAssignLeader={handleAssignLeader}
      onRotateLeader={handleRotateLeader}
    />
  )
}
