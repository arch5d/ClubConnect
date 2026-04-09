import { useState } from 'react'

const API_BASE = 'http://127.0.0.1:8000'

const CATEGORIES = ['Technical', 'Cultural', 'Sports', 'Literary', 'Social', 'Research', 'General']

const CATEGORY_COLORS = {
  Technical: 'bg-blue-900/40 text-blue-300 border-blue-700/40',
  Cultural: 'bg-pink-900/40 text-pink-300 border-pink-700/40',
  Sports: 'bg-orange-900/40 text-orange-300 border-orange-700/40',
  Literary: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/40',
  Social: 'bg-green-900/40 text-green-300 border-green-700/40',
  Research: 'bg-purple-900/40 text-purple-300 border-purple-700/40',
  General: 'bg-zinc-800 text-zinc-300 border-zinc-700',
}

function ClubCard({ club, events, expanded, onToggle }) {
  const clubEvents = events.filter(e => e.club_id === club.club_id)
  const colorClass = CATEGORY_COLORS[club.category] || CATEGORY_COLORS.General

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-5 text-left hover:bg-zinc-800/50 transition"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-zinc-100">{club.name}</h3>
              <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${colorClass}`}>
                {club.category}
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-400 line-clamp-2">{club.description}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="text-xs text-zinc-500">{clubEvents.length} event{clubEvents.length !== 1 ? 's' : ''}</span>
            <span className="text-zinc-500 text-sm">{expanded ? '▲' : '▼'}</span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-zinc-800 px-5 pb-5 pt-4">
          {clubEvents.length === 0 ? (
            <p className="text-sm text-zinc-500">No events under this club yet.</p>
          ) : (
            <div className="space-y-3">
              {clubEvents.map(ev => (
                <div key={ev.event_id} className="rounded-xl border border-zinc-700 bg-zinc-950 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-zinc-100">{ev.title}</h4>
                    <span className="shrink-0 rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                      {ev.scope.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-400">{ev.description}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-500">
                    <span>🕐 {ev.time_slot}</span>
                    <span>👥 {ev.registered_count}/{ev.capacity_limit}</span>
                    <span>📅 Open till {new Date(ev.registration_open_till).toLocaleDateString()}</span>
                  </div>
                  {ev.skills_required.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {ev.skills_required.map(s => (
                        <span key={s} className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                          {s.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ClubsPage({ clubs, events, role, onClubCreated }) {
  const [expandedClub, setExpandedClub] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'Technical',
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleCreateClub = async (e) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      setFeedback('')
      const payload = {
        club_id: `club-${Date.now()}`,
        name: form.name,
        description: form.description,
        category: form.category,
      }
      const res = await fetch(`${API_BASE}/clubs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Club creation failed')
      setFeedback(`Club "${form.name}" registered successfully.`)
      setForm({ name: '', description: '', category: 'Technical' })
      setShowForm(false)
      if (onClubCreated) await onClubCreated()
    } catch (err) {
      setFeedback(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">
            {role === 'moderator' ? 'Manage Clubs' : 'Browse Clubs'}
          </h2>
          <p className="mt-0.5 text-sm text-zinc-400">
            {clubs.length} club{clubs.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        {role === 'moderator' && (
          <button
            onClick={() => setShowForm(v => !v)}
            className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-cyan-300 transition"
          >
            {showForm ? 'Cancel' : '+ Register Club'}
          </button>
        )}
      </div>

      {feedback && (
        <p className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {feedback}
        </p>
      )}

      {/* Create Club Form */}
      {role === 'moderator' && showForm && (
        <form onSubmit={handleCreateClub} className="rounded-2xl border border-cyan-800/40 bg-zinc-900 p-6">
          <h3 className="mb-4 font-semibold text-zinc-100">Register New Club</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400">Club Name</label>
              <input
                required
                value={form.name}
                onChange={e => update('name', e.target.value)}
                placeholder="e.g. Coding Club"
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:ring focus:ring-cyan-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400">Category</label>
              <select
                value={form.category}
                onChange={e => update('category', e.target.value)}
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:ring focus:ring-cyan-500"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs text-zinc-400">Description</label>
              <textarea
                required
                value={form.description}
                onChange={e => update('description', e.target.value)}
                rows={3}
                placeholder="What does this club do?"
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:ring focus:ring-cyan-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 rounded-lg bg-cyan-400 px-5 py-2 text-sm font-medium text-zinc-950 hover:bg-cyan-300 disabled:opacity-50"
          >
            {isLoading ? 'Registering...' : 'Register Club'}
          </button>
        </form>
      )}

      {/* Club List */}
      {clubs.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
          <p className="text-zinc-400">No clubs registered yet.</p>
          {role === 'moderator' && (
            <p className="mt-1 text-sm text-zinc-500">Use the button above to register the first club.</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {clubs.map(club => (
            <ClubCard
              key={club.club_id}
              club={club}
              events={events}
              expanded={expandedClub === club.club_id}
              onToggle={() => setExpandedClub(prev => prev === club.club_id ? null : club.club_id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
