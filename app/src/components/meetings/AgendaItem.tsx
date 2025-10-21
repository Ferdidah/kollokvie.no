'use client'

import { useState } from 'react'
import type { AgendaItem as AgendaItemType } from '@/types/database'

interface AgendaItemProps {
  item: AgendaItemType
  index: number
  onUpdate?: (item: AgendaItemType) => void
  onDelete?: (itemId: string) => void
  editable?: boolean
}

export function AgendaItem({ item, index, onUpdate, onDelete, editable = false }: AgendaItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: item.title,
    description: item.description || '',
    estimated_minutes: item.estimated_minutes || 15
  })

  const handleSave = () => {
    if (onUpdate) {
      onUpdate({
        ...item,
        title: editData.title,
        description: editData.description,
        estimated_minutes: editData.estimated_minutes
      })
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData({
      title: item.title,
      description: item.description || '',
      estimated_minutes: item.estimated_minutes || 15
    })
    setIsEditing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'skipped':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Fullført'
      case 'in_progress':
        return 'Pågår'
      case 'skipped':
        return 'Hoppet over'
      default:
        return 'Venter'
    }
  }

  return (
    <div className="flex items-start space-x-3 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl">
      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
        <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
      </div>
      
      <div className="flex-1">
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              className="block w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-black font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Agenda-punkt tittel"
            />
            <textarea
              value={editData.description}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              className="block w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-black font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
              rows={2}
              placeholder="Beskrivelse (valgfri)"
            />
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Estimat:</label>
              <select
                value={editData.estimated_minutes}
                onChange={(e) => setEditData(prev => ({ ...prev, estimated_minutes: parseInt(e.target.value) }))}
                className="border-2 border-gray-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={5}>5 min</option>
                <option value={10}>10 min</option>
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                className="inline-flex items-center px-3 py-1 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
              >
                Lagre
              </button>
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-3 py-1 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                Avbryt
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="font-bold text-black mb-1">{item.title}</h3>
            {item.description && (
              <p className="text-gray-700 font-medium text-sm mb-2">{item.description}</p>
            )}
            {item.estimated_minutes && (
              <p className="text-gray-600 text-xs">Estimat: {item.estimated_minutes} min</p>
            )}
          </>
        )}
      </div>
      
      <div className="flex flex-col items-end space-y-2">
        <div className={`px-2 py-1 rounded-lg text-xs font-bold ${getStatusColor(item.status)}`}>
          {getStatusText(item.status)}
        </div>
        
        {editable && !isEditing && (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-2 py-1 text-xs font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors duration-200"
            >
              Rediger
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(item.id)}
                className="inline-flex items-center px-2 py-1 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors duration-200"
              >
                Slett
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

