import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { attendeeApi } from '../api/apiClient'
import { Search, DoorOpen, CheckCircle2, XCircle, Loader2, AlertCircle, QrCode } from 'lucide-react'
import { Badge } from '../components/common/ui'
import toast from 'react-hot-toast'

export default function GatePage() {
  const [query, setQuery] = useState('')
  const [gate, setGate] = useState('Main Gate')
  const [result, setResult] = useState(null)

  const checkInMutation = useMutation({
    mutationFn: (data) => attendeeApi.checkIn(data).then(r => r.data),
    onSuccess: (data) => {
      setResult(data)
      if (data.success) {
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }
      setQuery('')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Attendee not found')
      setResult(null)
    }
  })

  const handleCheckIn = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setResult(null)
    checkInMutation.mutate({ query: query.trim(), gateLocation: gate })
  }

  const a = result?.attendee

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <DoorOpen size={22} className="text-blue-400" /> Gate Admissions
        </h2>
        <p className="text-gray-400 text-sm">Scan QR code or enter Registration ID / Email for instant check-in</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleCheckIn} className="glass-card p-6 space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
            <QrCode size={12} /> Registration ID / QR Code / Email
          </label>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="VTX-2026-0001  or  QR-VTX-0001-A7K9  or  email"
            className="input-field text-base font-mono"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Gate Location</label>
          <select value={gate} onChange={e => setGate(e.target.value)}
            className="input-field">
            {['Main Gate','Gate A - North','Gate B - South','Gate C - East','VIP Entrance'].map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={checkInMutation.isPending || !query.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base">
          {checkInMutation.isPending
            ? <><Loader2 size={16} className="animate-spin" /> Verifying...</>
            : <><Search size={16} /> Verify & Check In</>}
        </button>
      </form>

      {/* Result */}
      {result && a && (
        <div className={`glass-card p-6 border-l-4 animate-fade-in ${result.success ? 'border-l-emerald-500' : 'border-l-amber-500'}`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${result.success ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
              {result.success ? <CheckCircle2 size={28} /> : <AlertCircle size={28} />}
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className={`font-bold text-lg ${result.success ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {result.success ? '✅ Entry Granted' : '⚠️ Already Checked In'}
                </p>
                <p className="text-gray-300 font-semibold text-base">{a.fullName}</p>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                <InfoRow label="Reg. ID" value={a.registrationId} mono />
                <InfoRow label="College" value={a.college} />
                <InfoRow label="Email" value={a.email} />
                <InfoRow label="Phone" value={a.phone} />
                <InfoRow label="Type" value={
                  <Badge variant={a.registrationType === 'PRE_REGISTERED' ? 'blue' : 'violet'}>
                    {a.registrationType.replace('_',' ')}
                  </Badge>
                } />
                <InfoRow label="Housing" value={
                  <Badge variant={a.housingRequired ? 'amber' : 'blue'}>
                    {a.housingRequired ? 'Required' : 'Not Required'}
                  </Badge>
                } />
              </div>
              {a.workshops?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Workshops</p>
                  <div className="flex flex-wrap gap-1.5">
                    {a.workshops.map(w => <span key={w} className="badge-blue text-xs">{w}</span>)}
                  </div>
                </div>
              )}
              {a.competitions?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Competitions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {a.competitions.map(c => <span key={c} className="badge-violet text-xs">{c}</span>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {checkInMutation.isError && !result && (
        <div className="glass-card p-5 border-l-4 border-l-rose-500 flex items-center gap-3 animate-fade-in">
          <XCircle size={22} className="text-rose-400 shrink-0" />
          <div>
            <p className="text-rose-400 font-semibold">Not Found</p>
            <p className="text-gray-400 text-sm">No attendee matched "{query}". Check the ID or register as walk-in.</p>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div>
      <span className="text-gray-500 text-xs">{label}: </span>
      <span className={`text-gray-200 text-sm ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  )
}

