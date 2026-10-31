import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { attendeeApi } from '../api/apiClient'
import { UserPlus, Loader2, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

const WORKSHOPS = [
  'AI & ML Workshop', 'Web Dev Masterclass', 'Cloud Computing Bootcamp',
  'Cybersecurity Essentials', 'Robotics & IoT Lab', 'UI/UX Design'
]
const COMPETITIONS = [
  'Hackathon 48hr', 'Coding Contest', 'Robo Wars', 'CTF Challenge',
  'UI/UX Design Challenge', 'Startup Pitch', 'Bug Bounty'
]

const defaultForm = {
  fullName: '', email: '', phone: '', college: '',
  workshops: [], competitions: [],
  housingRequired: false,
  hostelPreference: 'Hostel Garnet A (Boys)',
  paymentMode: 'CASH',
  paymentReference: '', amountPaid: '',
}

export default function WalkInPage() {
  const [form, setForm] = useState(defaultForm)
  const [registered, setRegistered] = useState(null)

  const mutation = useMutation({
    mutationFn: (data) => attendeeApi.registerWalkIn(data).then(r => r.data),
    onSuccess: (data) => {
      setRegistered(data)
      setForm(defaultForm)
      toast.success(`Walk-in registered! ID: ${data.registrationId}`)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Registration failed')
  })

  const toggle = (field, value) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(value) ? f[field].filter(v => v !== value) : [...f[field], value]
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate({ ...form, amountPaid: form.amountPaid ? parseFloat(form.amountPaid) : null })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <UserPlus size={22} className="text-violet-400" /> Walk-in Registration
        </h2>
        <p className="text-gray-400 text-sm">On-site admission with instant ticket generation</p>
      </div>

      {/* Success card */}
      {registered && (
        <div className="glass-card p-5 border border-emerald-500/30 bg-emerald-500/5 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 size={22} className="text-emerald-400" />
            <div>
              <p className="text-emerald-400 font-bold">Registration Successful!</p>
              <p className="text-gray-300 text-sm">{registered.fullName}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-gray-500">Reg. ID: </span><span className="text-white font-mono font-semibold">{registered.registrationId}</span></div>
            <div><span className="text-gray-500">QR Code: </span><span className="text-white font-mono text-xs">{registered.qrCode}</span></div>
          </div>
          <button onClick={() => setRegistered(null)} className="btn-secondary text-xs mt-3 py-1.5 px-3">
            Register Another
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
        {/* Personal details */}
        <Section title="Personal Details">
          <Field label="Full Name" required>
            <input className="input-field" placeholder="Arjun Sharma" required
              value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
          </Field>
          <Field label="Email" required>
            <input className="input-field" type="email" placeholder="arjun@college.edu" required
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </Field>
          <Field label="Phone" required>
            <input className="input-field" placeholder="9876543210" required pattern="[6-9]\d{9}"
              value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </Field>
          <Field label="College / Institution" required>
            <input className="input-field" placeholder="SRM Institute of Science and Technology" required
              value={form.college} onChange={e => setForm(f => ({ ...f, college: e.target.value }))} />
          </Field>
        </Section>

        {/* Workshops */}
        <Section title="Workshops">
          <CheckboxGrid items={WORKSHOPS} selected={form.workshops} onToggle={v => toggle('workshops', v)} color="blue" />
        </Section>

        {/* Competitions */}
        <Section title="Competitions">
          <CheckboxGrid items={COMPETITIONS} selected={form.competitions} onToggle={v => toggle('competitions', v)} color="violet" />
        </Section>

        {/* Housing */}
        <Section title="Accommodation">
          <div className="space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form.housingRequired}
                onChange={e => setForm(f => ({ ...f, housingRequired: e.target.checked }))}
                className="w-4 h-4 accent-blue-500" />
              <span className="text-gray-300 text-sm">Requires on-campus housing allocation</span>
            </label>

            {form.housingRequired && (
              <div className="p-3 bg-gray-800/60 border border-gray-700/60 rounded-lg space-y-2 animate-fade-in">
                <label className="text-xs font-medium text-gray-400">Assigned Hostel / Block Preference</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Hostel Garnet A (Boys)', label: 'Hostel: Garnet A (Boys)', color: 'border-blue-500/40 text-blue-300' },
                    { id: 'Hostel Opal C (Girls)', label: 'Hostel: Opal C (Girls)', color: 'border-violet-500/40 text-violet-300' },
                  ].map(h => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, hostelPreference: h.id }))}
                      className={`text-xs px-3 py-2 rounded-lg border text-left transition-all ${
                        form.hostelPreference === h.id
                          ? `${h.color} bg-gray-700/60 font-semibold shadow-sm`
                          : 'border-gray-700 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* Payment */}
        <Section title="Payment">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Payment Mode">
              <select className="input-field" value={form.paymentMode}
                onChange={e => setForm(f => ({ ...f, paymentMode: e.target.value }))}>
                {['CASH','UPI','CARD','WAIVER'].map(m => <option key={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Amount (₹)">
              <input className="input-field" type="number" min="0" placeholder="500"
                value={form.amountPaid} onChange={e => setForm(f => ({ ...f, amountPaid: e.target.value }))} />
            </Field>
          </div>
          <Field label="Reference / Transaction ID">
            <input className="input-field" placeholder="UPI-TXN-12345 or Cash Receipt No."
              value={form.paymentReference}
              onChange={e => setForm(f => ({ ...f, paymentReference: e.target.value }))} />
          </Field>
        </Section>

        <button type="submit" disabled={mutation.isPending}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base">
          {mutation.isPending
            ? <><Loader2 size={16} className="animate-spin" /> Registering...</>
            : <><UserPlus size={16} /> Register Walk-in Attendee</>}
        </button>
      </form>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-1.5">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, children, required }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-400">{label}{required && ' *'}</label>
      {children}
    </div>
  )
}

function CheckboxGrid({ items, selected, onToggle, color }) {
  const activeClass = color === 'violet' ? 'bg-violet-500/20 border-violet-500/60 text-violet-300' : 'bg-blue-500/20 border-blue-500/60 text-blue-300'
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(item => (
        <button key={item} type="button" onClick={() => onToggle(item)}
          className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150 ${
            selected.includes(item) ? activeClass : 'border-gray-700 text-gray-400 hover:border-gray-600'
          }`}>
          {item}
        </button>
      ))}
    </div>
  )
}

