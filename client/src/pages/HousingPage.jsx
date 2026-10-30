import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { housingApi } from '../api/apiClient'
import { Home, Bed, BedDouble, ChevronDown, Loader2, CheckCircle2, LogOut } from 'lucide-react'
import { Spinner, EmptyState } from '../components/common/ui'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function HousingPage() {
  const { data: blocks, isLoading } = useQuery({
    queryKey: ['housing-blocks'],
    queryFn: () => housingApi.getBlocks().then(r => r.data),
  })

  const blockTypeColors = {
    BOYS: 'border-blue-500/30 bg-blue-500/5',
    GIRLS: 'border-violet-500/30 bg-violet-500/5',
    VIP: 'border-amber-500/30 bg-amber-500/5',
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Home size={22} className="text-emerald-400" /> Housing Management
        </h2>
        <p className="text-gray-400 text-sm">Real-time room occupancy and bed allocation control</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size={8} /></div>
      ) : blocks?.length === 0 ? (
        <EmptyState icon={Home} title="No housing blocks configured" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {blocks?.map(block => (
            <div key={block.id} className={`glass-card p-5 border ${blockTypeColors[block.blockType] || ''}`}>
              {/* Block header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white text-sm">{block.blockName}</h3>
                  <p className="text-gray-500 text-xs capitalize">{block.blockType} Block</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-base">
                    {block.occupiedBeds}<span className="text-gray-500 font-normal text-sm">/{block.totalCapacity}</span>
                  </p>
                  <p className="text-gray-400 text-xs">{block.availableBeds} available</p>
                </div>
              </div>
              {/* Occupancy bar */}
              <div className="h-2 rounded-full bg-gray-800 overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    (block.occupiedBeds / block.totalCapacity) > 0.9 ? 'bg-rose-500' :
                    (block.occupiedBeds / block.totalCapacity) > 0.7 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${(block.occupiedBeds / block.totalCapacity) * 100}%` }}
                />
              </div>
              {/* Rooms grid */}
              {block.rooms?.length > 0 && (
                <div className="grid grid-cols-5 gap-1.5">
                  {block.rooms.map(room => (
                    <div key={room.id} title={`${room.roomNumber}: ${room.occupied}/${room.capacity}`}
                      className={`rounded p-1 text-center text-xs font-mono cursor-default transition-colors ${
                        room.isFull ? 'bg-rose-500/20 text-rose-400' :
                        room.occupied > 0 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                      {room.roomNumber.split('-')[1]}
                      <div className="text-xs opacity-70">{room.occupied}/{room.capacity}</div>
                    </div>
                  ))}
                </div>
              )}
              {/* Legend */}
              <div className="flex gap-3 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />Full</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Partial</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Available</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

