import { useEffect, useMemo, useState } from 'react'
import StudentProfilePage from './components/StudentProfilePage'
import ClubsPage from './components/ClubsPage'

const API_BASE = 'http://127.0.0.1:8000'

export const SKILLS = [
  'python', 'javascript', 'ui_ux', 'data_analysis',
  'public_speaking', 'cloud', 'machine_learning',
]
export const GOALS = ['learn', 'network', 'build', 'compete']

const STUDENT_ID = 'student-001'

const DEFAULT_PROFILE = {
  student_id: STUDENT_ID,
  full_name: 'Aarav Mehta',
  college: 'Tech Valley Institute',
  contact: 'aarav@student.edu',
  skills: ['python', 'data_analysis'],
  interests: ['hackathons', 'ai'],
  goals: ['learn', 'build'],
  available_slots: ['sat-10:00', 'sun-14:00', 'fri-18:00'],
  bio: 'Passionate about algorithms and building impactful tech.',
  year: '3rd Year',
  department: 'Computer Science',
  avatar_initials: 'AM',
}

function App() {
  const [role, setRole] = useState('student')
  const [activeTab, setActiveTab] = useState('dashboard') // dashboard | profile | clubs
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [events, setEvents] = useState([])
  const [clubs, setClubs] = useState([])
  const [feedback, setFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [studentProfile, setStudentProfile] = useState(DEFAULT_PROFILE)

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    skills_required: ['python'],
    goal_tags: ['learn'],
    scope: 'intra_college',
    capacity_band: 'medium',
    capacity_limit: 30,
    registration_open_till: '',
    time_slot: 'sat-10:00',
    club_id: '',
  })

  const totalRegistrations = useMemo(
    () => events.reduce((sum, e) => sum + (e.registered_count || 0), 0),
    [events],
  )

  const loadEvents = async () => {
    const res = await fetch(`${API_BASE}/events`)
    if (!res.ok) throw new Error('Unable to load events')
    setEvents(await res.json())
  }

  const loadClubs = async () => {
    const res = await fetch(`${API_BASE}/clubs`)
    if (!res.ok) throw new Error('Unable to load clubs')
    setClubs(await res.json())
  }

  const ensureStudentProfile = async () => {
    // Try to load existing profile first
    const res = await fetch(`${API_BASE}/students/${STUDENT_ID}`)
    if (res.ok) {
      const data = await res.json()
      setStudentProfile(data)
    } else {
      // Create default profile if not found
      await fetch(`${API_BASE}/students/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(DEFAULT_PROFILE),
      })
      setStudentProfile(DEFAULT_PROFILE)
    }
  }

  const loadRecommendations = async () => {
    const res = await fetch(`${API_BASE}/recommendations/${STUDENT_ID}`)
    if (!res.ok) throw new Error('Unable to load recommendations')
    setRecommendations(await res.json())
  }

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setIsLoading(true)
        await ensureStudentProfile()
        await loadEvents()
        await loadClubs()
        await loadRecommendations()
      } catch (err) {
        setFeedback(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    bootstrap()
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      setFeedback('')
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error('Search request failed')
      setSearchResults(await res.json())
    } catch (err) {
      setFeedback(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormUpdate = (field, value) =>
    setEventForm((prev) => ({ ...prev, [field]: value }))

  const handleCreateEvent = async (e) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      setFeedback('')
      const payload = {
        event_id: `evt-${Date.now()}`,
        ...eventForm,
        capacity_limit: Number(eventForm.capacity_limit),
        registered_count: 0,
        registration_open_till: new Date(eventForm.registration_open_till).toISOString(),
        club_id: eventForm.club_id || null,
      }
      const res = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Event creation failed')
      setFeedback('Event created successfully.')
      await loadEvents()
      await loadRecommendations()
    } catch (err) {
      setFeedback(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileSave = async (updatedProfile) => {
    try {
      setIsLoading(true)
      const res = await fetch(`${API_BASE}/students/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile),
      })
      if (!res.ok) throw new Error('Profile update failed')
      const saved = await res.json()
      setStudentProfile(saved)
      await loadRecommendations()
      setFeedback('Profile updated successfully.')
    } catch (err) {
      setFeedback(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const navBtn = (tab, label, accent) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
        activeTab === tab
          ? `bg-${accent}-500 text-zinc-950`
          : 'border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500'
      }`}
    >
      {label}
    </button>
  )

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <header className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-[0_0_40px_rgba(16,185,129,0.08)] backdrop-blur">
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">ClubConnect</p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-100 md:text-4xl">
            Algorithm-Driven Events Dashboard
          </h1>
          <p className="mt-2 text-zinc-400">
            DAA-T160 | Heap Top-K recommendations + KMP search engine
          </p>
        </header>

        {/* Role + Tab Nav */}
        <section className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => { setRole('student'); setActiveTab('dashboard') }}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition ${
              role === 'student'
                ? 'bg-emerald-500 text-zinc-950'
                : 'border border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-emerald-500'
            }`}
          >
            Student
          </button>
          <button
            onClick={() => { setRole('moderator'); setActiveTab('dashboard') }}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition ${
              role === 'moderator'
                ? 'bg-cyan-400 text-zinc-950'
                : 'border border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-cyan-400'
            }`}
          >
            Moderator
          </button>

          <span className="mx-1 h-5 w-px bg-zinc-700" />

          {role === 'student' && (
            <>
              {navBtn('dashboard', 'Dashboard', 'emerald')}
              {navBtn('profile', 'My Profile', 'emerald')}
              {navBtn('clubs', 'Clubs', 'emerald')}
            </>
          )}
          {role === 'moderator' && (
            <>
              {navBtn('dashboard', 'Create Event', 'cyan')}
              {navBtn('clubs', 'Manage Clubs', 'cyan')}
            </>
          )}
        </section>

        {feedback && (
          <p className="mt-4 rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-amber-200">
            {feedback}
          </p>
        )}

        {/* Student Dashboard */}
        {role === 'student' && activeTab === 'dashboard' && (
          <section className="mt-6 grid gap-6 lg:grid-cols-5">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 lg:col-span-3">
              <h2 className="text-xl font-semibold">Search Events</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Pattern matching powered by KMP.
                <span className="ml-2 rounded bg-zinc-800 px-2 py-1 text-xs text-emerald-300">O(n + m)</span>
              </p>
              <form onSubmit={handleSearch} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title, skill, or description"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-zinc-100 outline-none ring-emerald-500 focus:ring"
                />
                <button type="submit" className="rounded-lg bg-emerald-500 px-5 py-2 font-medium text-zinc-950 hover:bg-emerald-400">
                  Search
                </button>
              </form>
              <div className="mt-5 space-y-3">
                {searchResults.length === 0 ? (
                  <p className="text-sm text-zinc-500">No search results yet. Run a query to discover events.</p>
                ) : (
                  searchResults.map((ev) => (
                    <article key={ev.event_id} className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-zinc-100">{ev.title}</h3>
                        {ev.club_id && (
                          <span className="shrink-0 rounded bg-emerald-900/40 px-2 py-0.5 text-xs text-emerald-300">
                            {clubs.find(c => c.club_id === ev.club_id)?.name || ev.club_id}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-zinc-400">{ev.description}</p>
                      <p className="mt-2 text-xs text-zinc-500">{ev.time_slot} · {ev.scope}</p>
                    </article>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 lg:col-span-2">
              <h2 className="text-xl font-semibold">Recommended for You</h2>
              <p className="mt-1 text-sm text-zinc-400">Heap-Based Top-K + Greedy selection.</p>
              <div className="mt-2 flex gap-2 text-xs">
                <span className="rounded bg-zinc-800 px-2 py-1 text-cyan-300">Top-K: O(n log k)</span>
                <span className="rounded bg-zinc-800 px-2 py-1 text-emerald-300">Greedy: O(r)</span>
              </div>
              <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-2">
                {recommendations.map((item) => (
                  <article key={item.event.event_id} className="min-w-[250px] snap-start rounded-xl border border-zinc-700 bg-zinc-950 p-4">
                    <h3 className="font-medium">{item.event.title}</h3>
                    <p className="mt-1 text-sm text-zinc-400">{item.event.time_slot}</p>
                    <p className="mt-3 text-sm text-emerald-300">Match Score: {Math.round(item.score * 100)}%</p>
                  </article>
                ))}
                {recommendations.length === 0 && (
                  <p className="text-sm text-zinc-500">No recommendations yet.</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Student Profile */}
        {role === 'student' && activeTab === 'profile' && (
          <StudentProfilePage
            profile={studentProfile}
            onSave={handleProfileSave}
            isLoading={isLoading}
          />
        )}

        {/* Clubs (Student view) */}
        {role === 'student' && activeTab === 'clubs' && (
          <ClubsPage clubs={clubs} events={events} role="student" />
        )}

        {/* Moderator Dashboard */}
        {role === 'moderator' && activeTab === 'dashboard' && (
          <section className="mt-6 grid gap-6 lg:grid-cols-5">
            <form onSubmit={handleCreateEvent} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 lg:col-span-3">
              <h2 className="text-xl font-semibold">Create Event</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  required
                  value={eventForm.title}
                  onChange={(e) => handleFormUpdate('title', e.target.value)}
                  placeholder="Event title"
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                />
                <input
                  required
                  value={eventForm.time_slot}
                  onChange={(e) => handleFormUpdate('time_slot', e.target.value)}
                  placeholder="Time slot (e.g. sat-10:00)"
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                />
                <textarea
                  required
                  value={eventForm.description}
                  onChange={(e) => handleFormUpdate('description', e.target.value)}
                  placeholder="Event description"
                  className="sm:col-span-2 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                  rows={3}
                />
                <select
                  value={eventForm.scope}
                  onChange={(e) => handleFormUpdate('scope', e.target.value)}
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                >
                  <option value="intra_college">Intra College</option>
                  <option value="inter_college">Inter College</option>
                </select>
                <select
                  value={eventForm.capacity_band}
                  onChange={(e) => handleFormUpdate('capacity_band', e.target.value)}
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
                <input
                  type="number"
                  min={1}
                  value={eventForm.capacity_limit}
                  onChange={(e) => handleFormUpdate('capacity_limit', e.target.value)}
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                />
                <input
                  type="datetime-local"
                  required
                  value={eventForm.registration_open_till}
                  onChange={(e) => handleFormUpdate('registration_open_till', e.target.value)}
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                />
                <select
                  value={eventForm.club_id}
                  onChange={(e) => handleFormUpdate('club_id', e.target.value)}
                  className="sm:col-span-2 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                >
                  <option value="">— No Club (standalone event) —</option>
                  {clubs.map((c) => (
                    <option key={c.club_id} value={c.club_id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm text-zinc-400">Skills Required</p>
                  <div className="flex flex-wrap gap-2">
                    {SKILLS.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => {
                          const sel = eventForm.skills_required.includes(skill)
                          handleFormUpdate('skills_required',
                            sel ? eventForm.skills_required.filter(s => s !== skill)
                              : [...eventForm.skills_required, skill])
                        }}
                        className={`rounded px-2 py-1 text-xs ${
                          eventForm.skills_required.includes(skill)
                            ? 'bg-emerald-500 text-zinc-950'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm text-zinc-400">Goal Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {GOALS.map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => {
                          const sel = eventForm.goal_tags.includes(goal)
                          handleFormUpdate('goal_tags',
                            sel ? eventForm.goal_tags.filter(g => g !== goal)
                              : [...eventForm.goal_tags, goal])
                        }}
                        className={`rounded px-2 py-1 text-xs ${
                          eventForm.goal_tags.includes(goal)
                            ? 'bg-cyan-400 text-zinc-950'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button type="submit" className="mt-6 rounded-lg bg-cyan-400 px-5 py-2 font-medium text-zinc-950 hover:bg-cyan-300">
                Create Event
              </button>
            </form>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 lg:col-span-2">
              <h2 className="text-xl font-semibold">Analytics</h2>
              <p className="mt-1 text-sm text-zinc-400">Moderator summary snapshot</p>
              <div className="mt-4 rounded-xl border border-zinc-700 bg-zinc-950 p-4">
                <p className="text-sm text-zinc-400">Total Registered Events</p>
                <p className="mt-1 text-2xl font-semibold text-zinc-100">{events.length}</p>
              </div>
              <div className="mt-3 rounded-xl border border-zinc-700 bg-zinc-950 p-4">
                <p className="text-sm text-zinc-400">Total Registrations</p>
                <p className="mt-1 text-2xl font-semibold text-emerald-300">{totalRegistrations}</p>
              </div>
              <div className="mt-3 rounded-xl border border-zinc-700 bg-zinc-950 p-4">
                <p className="text-sm text-zinc-400">Total Clubs</p>
                <p className="mt-1 text-2xl font-semibold text-cyan-300">{clubs.length}</p>
              </div>
            </div>
          </section>
        )}

        {/* Clubs (Moderator view) */}
        {role === 'moderator' && activeTab === 'clubs' && (
          <ClubsPage
            clubs={clubs}
            events={events}
            role="moderator"
            onClubCreated={async () => { await loadClubs() }}
          />
        )}

        {isLoading && (
          <p className="mt-4 text-sm text-zinc-400">Syncing with backend...</p>
        )}
      </div>
    </main>
  )
}

export default App
