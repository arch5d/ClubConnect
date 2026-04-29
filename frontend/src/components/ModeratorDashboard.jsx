import { useMemo, useState } from 'react'
import { API_BASE, SKILLS, GOALS, CATEGORIES, TIME_SLOTS } from '../constants'
import EventCard from './EventCard'
import { CategoryBadge, StatCard, Toast } from './ui'

const EMPTY_EVENT_FORM = {
  title: '', description: '', skills_required: [], goal_tags: [],
  scope: 'intra_college', capacity_band: 'medium', capacity_limit: 50,
  registration_open_till: '', time_slot: 'sat-10:00', club_id: '', venue: '', prize: '',
}

const EMPTY_CLUB_FORM = { name: '', description: '', category: 'Technical' }

export default function ModeratorDashboard({ user, events, clubs, onEventsChange, onClubsChange }) {
  const [tab, setTab] = useState('events') // events | create-event | clubs | create-club | analytics
  const [eventForm, setEventForm] = useState(EMPTY_EVENT_FORM)
  const [clubForm, setClubForm] = useState(EMPTY_CLUB_FORM)
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const myEvents = events.filter(e => e.moderator_id === user.user_id)
  const myClubs = clubs.filter(c => c.moderator_id === user.user_id)
  const totalRegistrations = useMemo(() => myEvents.reduce((s, e) => s + e.registered_count, 0), [myEvents])

  const updateEvent = (field, value) => setEventForm(p => ({ ...p, [field]: value }))
  const updateClub = (field, value) => setClubForm(p => ({ ...p, [field]: value }))

  const toggleSkill = (skill) => {
    const has = eventForm.skills_required.includes(skill)
    updateEvent('skills_required', has ? eventForm.skills_required.filter(s => s !== skill) : [...eventForm.skills_required, skill])
  }
  const toggleGoal = (goal) => {
    const has = eventForm.goal_tags.includes(goal)
    updateEvent('goal_tags', has ? eventForm.goal_tags.filter(g => g !== goal) : [...eventForm.goal_tags, goal])
  }

  const handleCreateEvent = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        event_id: `evt-${Date.now()}`,
        ...eventForm,
        capacity_limit: Number(eventForm.capacity_limit),
        registered_count: 0,
        registration_open_till: new Date(eventForm.registration_open_till).toISOString(),
        club_id: eventForm.club_id || null,
        moderator_id: user.user_id,
      }
      const res = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed to create event')
      setEventForm(EMPTY_EVENT_FORM)
      await onEventsChange()
      showToast('Event created successfully!', 'success')
      setTab('events')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Delete this event? This cannot be undone.')) return
    try {
      const res = await fetch(`${API_BASE}/events/${eventId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      await onEventsChange()
      showToast('Event deleted', 'info')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleCreateClub = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        club_id: `club-${Date.now()}`,
        ...clubForm,
        moderator_id: user.user_id,
      }
      const res = await fetch(`${API_BASE}/clubs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed to create club')
      setClubForm(EMPTY_CLUB_FORM)
      await onClubsChange()
      showToast(`Club "${clubForm.name}" created!`, 'success')
      setTab('clubs')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClub = async (clubId) => {
    if (!confirm('Delete this club?')) return
    try {
      const res = await fetch(`${API_BASE}/clubs/${clubId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      await onClubsChange()
      showToast('Club deleted', 'info')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const inputCls = 'rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-zinc-100 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 w-full'
  const labelCls = 'block text-xs text-zinc-400 mb-1'

  const navTabs = [
    { id: 'events', label: '🗓 My Events', count: myEvents.length },
    { id: 'create-event', label: '+ Create Event' },
    { id: 'clubs', label: '🏛 My Clubs', count: myClubs.length },
    { id: 'create-club', label: '+ Create Club' },
    { id: 'analytics', label: '📊 Analytics' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="My Events" value={myEvents.length} />
        <StatCard label="Total Registrations" value={totalRegistrations} color="text-emerald-300" />
        <StatCard label="My Clubs" value={myClubs.length} color="text-cyan-300" />
        <StatCard label="All Events" value={events.length} color="text-zinc-400" />
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
        {navTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === t.id
                ? 'bg-cyan-400 text-zinc-950'
                : 'border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500'
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${tab === t.id ? 'bg-zinc-950/30' : 'bg-zinc-800 text-zinc-400'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* My Events */}
      {tab === 'events' && (
        <div className="space-y-4">
          {myEvents.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
              <p className="text-zinc-400">You haven't created any events yet.</p>
              <button onClick={() => setTab('create-event')} className="mt-3 text-sm text-cyan-400 hover:underline">
                Create your first event →
              </button>
            </div>
          ) : (
            myEvents.map(ev => (
              <EventCard key={ev.event_id} event={ev} clubs={clubs} showActions={true} onDelete={handleDeleteEvent} />
            ))
          )}
        </div>
      )}

      {/* Create Event */}
      {tab === 'create-event' && (
        <form onSubmit={handleCreateEvent} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-zinc-100">Create New Event</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Event Title *</label>
              <input required value={eventForm.title} onChange={e => updateEvent('title', e.target.value)} placeholder="e.g. Python Workshop" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Time Slot *</label>
              <select required value={eventForm.time_slot} onChange={e => updateEvent('time_slot', e.target.value)} className={inputCls}>
                {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Description *</label>
              <textarea required rows={3} value={eventForm.description} onChange={e => updateEvent('description', e.target.value)} placeholder="Describe the event…" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Venue</label>
              <input value={eventForm.venue} onChange={e => updateEvent('venue', e.target.value)} placeholder="e.g. Lab Block 3, Room 301" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Prize / Reward</label>
              <input value={eventForm.prize} onChange={e => updateEvent('prize', e.target.value)} placeholder="e.g. ₹10,000 + Certificate" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Scope</label>
              <select value={eventForm.scope} onChange={e => updateEvent('scope', e.target.value)} className={inputCls}>
                <option value="intra_college">Intra College</option>
                <option value="inter_college">Inter College</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Capacity Band</label>
              <select value={eventForm.capacity_band} onChange={e => updateEvent('capacity_band', e.target.value)} className={inputCls}>
                <option value="small">Small (≤30)</option>
                <option value="medium">Medium (≤80)</option>
                <option value="large">Large (100+)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Capacity Limit *</label>
              <input type="number" min={1} required value={eventForm.capacity_limit} onChange={e => updateEvent('capacity_limit', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Registration Open Till *</label>
              <input type="datetime-local" required value={eventForm.registration_open_till} onChange={e => updateEvent('registration_open_till', e.target.value)} className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Assign to Club (optional)</label>
              <select value={eventForm.club_id} onChange={e => updateEvent('club_id', e.target.value)} className={inputCls}>
                <option value="">— Standalone event —</option>
                {clubs.map(c => <option key={c.club_id} value={c.club_id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className={labelCls}>Skills Required</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {SKILLS.map(skill => (
                  <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      eventForm.skills_required.includes(skill)
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                        : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-500'
                    }`}>
                    {skill.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className={labelCls}>Goal Tags</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {GOALS.map(goal => (
                  <button key={goal} type="button" onClick={() => toggleGoal(goal)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      eventForm.goal_tags.includes(goal)
                        ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300'
                        : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-500'
                    }`}>
                    {goal}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="rounded-xl bg-cyan-400 px-6 py-2.5 font-medium text-zinc-950 hover:bg-cyan-300 disabled:opacity-60 transition">
              {loading ? 'Creating…' : 'Create Event'}
            </button>
            <button type="button" onClick={() => setEventForm(EMPTY_EVENT_FORM)}
              className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm text-zinc-400 hover:border-zinc-500 transition">
              Reset
            </button>
          </div>
        </form>
      )}

      {/* My Clubs */}
      {tab === 'clubs' && (
        <div className="space-y-4">
          {myClubs.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
              <p className="text-zinc-400">You haven't created any clubs yet.</p>
              <button onClick={() => setTab('create-club')} className="mt-3 text-sm text-cyan-400 hover:underline">
                Create your first club →
              </button>
            </div>
          ) : (
            myClubs.map(club => {
              const clubEvents = events.filter(e => e.club_id === club.club_id)
              return (
                <div key={club.club_id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-zinc-100">{club.name}</h3>
                        <CategoryBadge category={club.category} />
                      </div>
                      <p className="mt-1 text-sm text-zinc-400">{club.description}</p>
                      <p className="mt-2 text-xs text-zinc-500">{clubEvents.length} event{clubEvents.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button onClick={() => handleDeleteClub(club.club_id)}
                      className="shrink-0 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-500 hover:border-red-500 hover:text-red-400 transition">
                      Delete
                    </button>
                  </div>
                  {clubEvents.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {clubEvents.map(ev => (
                        <EventCard key={ev.event_id} event={ev} clubs={clubs} compact showActions={false} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Create Club */}
      {tab === 'create-club' && (
        <form onSubmit={handleCreateClub} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-100">Register New Club</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Club Name *</label>
              <input required value={clubForm.name} onChange={e => updateClub('name', e.target.value)} placeholder="e.g. Robotics Club" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <select value={clubForm.category} onChange={e => updateClub('category', e.target.value)} className={inputCls}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Description *</label>
              <textarea required rows={3} value={clubForm.description} onChange={e => updateClub('description', e.target.value)} placeholder="What does this club do?" className={inputCls} />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="rounded-xl bg-cyan-400 px-6 py-2.5 font-medium text-zinc-950 hover:bg-cyan-300 disabled:opacity-60 transition">
            {loading ? 'Creating…' : 'Register Club'}
          </button>
        </form>
      )}

      {/* Analytics */}
      {tab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Events Created" value={myEvents.length} color="text-cyan-300" />
            <StatCard label="Total Registrations" value={totalRegistrations} color="text-emerald-300" />
            <StatCard label="Avg Registrations/Event" value={myEvents.length ? (totalRegistrations / myEvents.length).toFixed(1) : 0} color="text-violet-300" />
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <h3 className="mb-4 font-semibold text-zinc-100">Event Fill Rate</h3>
            <div className="space-y-3">
              {myEvents.length === 0 ? (
                <p className="text-sm text-zinc-500">No events yet.</p>
              ) : (
                myEvents.map(ev => {
                  const pct = Math.round((ev.registered_count / ev.capacity_limit) * 100)
                  const bar = pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                  return (
                    <div key={ev.event_id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-zinc-300 truncate max-w-[60%]">{ev.title}</span>
                        <span className="text-zinc-400">{ev.registered_count}/{ev.capacity_limit} ({pct}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-zinc-800">
                        <div className={`h-2 rounded-full transition-all ${bar}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <h3 className="mb-4 font-semibold text-zinc-100">All Events Overview</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-left text-xs text-zinc-500">
                    <th className="pb-2 pr-4">Event</th>
                    <th className="pb-2 pr-4">Club</th>
                    <th className="pb-2 pr-4">Scope</th>
                    <th className="pb-2 pr-4">Registered</th>
                    <th className="pb-2">Deadline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {events.map(ev => {
                    const club = clubs.find(c => c.club_id === ev.club_id)
                    return (
                      <tr key={ev.event_id} className="text-zinc-300">
                        <td className="py-2 pr-4 font-medium">{ev.title}</td>
                        <td className="py-2 pr-4 text-zinc-500">{club?.name || '—'}</td>
                        <td className="py-2 pr-4 text-zinc-500">{ev.scope.replace('_', ' ')}</td>
                        <td className="py-2 pr-4">{ev.registered_count}/{ev.capacity_limit}</td>
                        <td className="py-2 text-zinc-500">{new Date(ev.registration_open_till).toLocaleDateString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
