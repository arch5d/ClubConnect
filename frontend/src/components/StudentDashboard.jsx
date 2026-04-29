import { useEffect, useMemo, useState } from 'react'
import { API_BASE } from '../constants'
import EventCard from './EventCard'
import { Spinner, Toast, StatCard } from './ui'

export default function StudentDashboard({ user, events, clubs, onEventsChange }) {
  const [tab, setTab] = useState('browse') // browse | registered | recommendations | search
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [registeredIds, setRegisteredIds] = useState([])
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Load student's registered events
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/students/${user.user_id}`)
        if (res.ok) {
          const data = await res.json()
          setRegisteredIds(data.registered_events || [])
        }
      } catch {}
    }
    fetchProfile()
  }, [user.user_id])

  // Load recommendations
  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await fetch(`${API_BASE}/recommendations/${user.user_id}`)
        if (res.ok) setRecommendations(await res.json())
      } catch {}
    }
    fetchRecs()
  }, [user.user_id, events])

  const handleRegister = async (eventId) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/events/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: user.user_id, event_id: eventId }),
      })
      const data = await res.json()
      if (!res.ok) {
        const message = data.detail || data.message || 'Registration failed'
        throw new Error(message)
      }
      setRegisteredIds(prev => [...prev, eventId])
      onEventsChange()
      showToast(data.message || 'Successfully registered for event', 'success')
    } catch (err) {
      showToast(err.message || 'Registration failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUnregister = async (eventId) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/events/register`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: user.user_id, event_id: eventId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to unregister')
      setRegisteredIds(prev => prev.filter(id => id !== eventId))
      onEventsChange()
      showToast('Unregistered successfully', 'info')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) {
      showToast('Please enter a search query', 'error')
      return
    }
    setSearchLoading(true)
    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Search failed')
      }
      const results = await res.json()
      setSearchResults(results)
      setTab('search')
      if (results.length === 0) {
        showToast('No events matched your search', 'info')
      }
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSearchLoading(false)
    }
  }

  const registeredEvents = useMemo(
    () => events.filter(e => registeredIds.includes(e.event_id)),
    [events, registeredIds]
  )

  const upcomingCount = events.filter(e => new Date(e.registration_open_till) > new Date()).length

  const tabs = [
    { id: 'browse', label: '🗓 Browse Events', count: events.length },
    { id: 'registered', label: '✓ My Registrations', count: registeredIds.length },
    { id: 'recommendations', label: '⚡ For You', count: recommendations.length },
  ]

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Events" value={events.length} />
        <StatCard label="Open for Registration" value={upcomingCount} color="text-emerald-300" />
        <StatCard label="My Registrations" value={registeredIds.length} color="text-cyan-300" />
        <StatCard label="Clubs" value={clubs.length} color="text-violet-300" />
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search events by title, skill, or description… (KMP)"
          className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-zinc-100 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
        <button
          type="submit"
          disabled={searchLoading}
          className="rounded-xl bg-emerald-500 px-5 py-2.5 font-medium text-zinc-950 hover:bg-emerald-400 disabled:opacity-60 transition"
        >
          {searchLoading ? '…' : 'Search'}
        </button>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === t.id
                ? 'bg-emerald-500 text-zinc-950'
                : 'border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${tab === t.id ? 'bg-zinc-950/30' : 'bg-zinc-800 text-zinc-400'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
        {tab === 'search' && (
          <button
            onClick={() => setTab('search')}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950"
          >
            🔍 Search Results
            <span className="ml-1.5 rounded-full bg-zinc-950/30 px-1.5 py-0.5 text-xs">{searchResults.length}</span>
          </button>
        )}
      </div>

      {loading && <Spinner />}

      {/* Browse */}
      {tab === 'browse' && (
        <div className="space-y-4">
          {events.length === 0 ? (
            <p className="text-zinc-500">No events available yet.</p>
          ) : (
            events.map(ev => (
              <EventCard
                key={ev.event_id}
                event={ev}
                clubs={clubs}
                isRegistered={registeredIds.includes(ev.event_id)}
                onRegister={handleRegister}
                onUnregister={handleUnregister}
              />
            ))
          )}
        </div>
      )}

      {/* My Registrations */}
      {tab === 'registered' && (
        <div className="space-y-4">
          {registeredEvents.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
              <p className="text-zinc-400">You haven't registered for any events yet.</p>
              <button onClick={() => setTab('browse')} className="mt-3 text-sm text-emerald-400 hover:underline">
                Browse events →
              </button>
            </div>
          ) : (
            registeredEvents.map(ev => (
              <EventCard
                key={ev.event_id}
                event={ev}
                clubs={clubs}
                isRegistered={true}
                onUnregister={handleUnregister}
              />
            ))
          )}
        </div>
      )}

      {/* Recommendations */}
      {tab === 'recommendations' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <p className="text-sm text-zinc-400">Personalised using Heap Top-K + Greedy scheduling</p>
            <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-cyan-300">O(n log k)</span>
            <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-emerald-300">O(r)</span>
          </div>
          {recommendations.length === 0 ? (
            <p className="text-zinc-500">No recommendations yet. Update your profile with skills and goals.</p>
          ) : (
            recommendations.map(item => (
              <div key={item.event.event_id} className="relative">
                <div className="absolute right-4 top-4 z-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                  {Math.round(item.score * 100)}% match
                </div>
                <EventCard
                  event={item.event}
                  clubs={clubs}
                  isRegistered={registeredIds.includes(item.event.event_id)}
                  onRegister={handleRegister}
                  onUnregister={handleUnregister}
                />
              </div>
            ))
          )}
        </div>
      )}

      {/* Search Results */}
      {tab === 'search' && (
        <div className="space-y-4">
          {searchResults.length === 0 ? (
            <p className="text-zinc-500">No events matched your search.</p>
          ) : (
            searchResults.map(ev => (
              <EventCard
                key={ev.event_id}
                event={ev}
                clubs={clubs}
                isRegistered={registeredIds.includes(ev.event_id)}
                onRegister={handleRegister}
                onUnregister={handleUnregister}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
