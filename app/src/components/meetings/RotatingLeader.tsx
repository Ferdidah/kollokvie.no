'use client'

import { useState } from 'react'
import type { EmneMember } from '@/types/database'

interface RotatingLeaderProps {
  members: EmneMember[]
  currentLeader?: string | null
  onAssignLeader?: (userId: string) => void
  onRotateLeader?: () => void
}

export function RotatingLeader({ members, currentLeader, onAssignLeader, onRotateLeader }: RotatingLeaderProps) {
  const [showAssignModal, setShowAssignModal] = useState(false)

  const currentLeaderMember = members.find(m => m.user_id === currentLeader)
  const availableMembers = members.filter(m => m.user_id !== currentLeader)

  const handleAssignLeader = (userId: string) => {
    if (onAssignLeader) {
      onAssignLeader(userId)
    }
    setShowAssignModal(false)
  }

  const handleRotateLeader = () => {
    if (onRotateLeader) {
      onRotateLeader()
    }
  }

  return (
    <div className="bg-white border-2 border-blue-100 shadow-xl rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-black">Møteleder</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAssignModal(true)}
            className="inline-flex items-center px-2 py-1 text-xs font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors duration-200"
          >
            Tildel
          </button>
          <button
            onClick={handleRotateLeader}
            className="inline-flex items-center px-2 py-1 text-xs font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors duration-200"
          >
            Roter
          </button>
        </div>
      </div>

      {currentLeaderMember ? (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-sm">
              {currentLeaderMember.user_id.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-bold text-black text-sm">
              User {currentLeaderMember.user_id.slice(0, 8)}
            </p>
            <p className="text-gray-600 text-xs">Nåværende leder</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-600 font-medium text-sm mb-3">Ingen leder tildelt</p>
          <button
            onClick={() => setShowAssignModal(true)}
            className="inline-flex items-center px-3 py-2 border-2 border-gray-300 shadow-lg text-sm font-bold rounded-xl text-black bg-white hover:bg-gray-50 hover:border-gray-400 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
          >
            Tildel leder
          </button>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-black mb-4">Tildel møteleder</h3>
            <div className="space-y-3">
              {availableMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleAssignLeader(member.user_id)}
                  className="w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-bold text-sm">
                      {member.user_id.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-black text-sm">
                      User {member.user_id.slice(0, 8)}
                    </p>
                    <p className="text-gray-600 text-xs">
                      {member.role === 'admin' ? 'Administrator' : 
                       member.role === 'leader' ? 'Leder' : 'Medlem'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowAssignModal(false)}
                className="inline-flex items-center px-4 py-2 border-2 border-gray-300 shadow-lg text-sm font-bold rounded-xl text-black bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rotation History */}
      <div className="mt-4 pt-4 border-t-2 border-gray-200">
        <h4 className="text-sm font-bold text-black mb-2">Roteringshistorikk</h4>
        <div className="space-y-2">
          {members.slice(0, 3).map((member, index) => (
            <div key={member.id} className="flex items-center space-x-2 text-xs">
              <div className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-bold text-xs">
                  {member.user_id.slice(0, 1).toUpperCase()}
                </span>
              </div>
              <span className="text-gray-600">
                User {member.user_id.slice(0, 8)} - Møte {index + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

