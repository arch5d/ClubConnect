import { useEffect, useMemo, useState } from 'react'

const API_BASE = 'http://127.0.0.1:8000'

const STUDENT_ID = 'student-001'

const SKILLS = [
  'python',
  'javascript',
  'ui_ux',
  'data_analysis',
  'public_speaking',
  'cloud',
  'machine_learning',
]

const GOALS = ['learn', 'network', 'build', 'compete']

const DEFAULT_PROFILE = {
  student_id: STUDENT_ID,
  full_name: 'Aarav Mehta',
  college: 'Tech Valley Institute',
  contact: 'aarav@student.edu',
  skills: ['python', 'data_analysis'],
  interests: ['hackathons', 'ai'],
  goals: ['learn', 'build'],
  available_slots: ['sat-10:00', 'sun-14:00', 'fri-18:00'],
}

function App() {
  const [role, setRole] = useState('student')
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [events, setEvents] = useState([])
  const [feedback, setFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
  })

  const totalRegistrations = useMemo(
    () => events.reduce((sum, event) => sum + (event.registered_count || 0), 0),
    [events],
  )

  const loadEvents = async () => {
    const response = await fetch(`${API_BASE}/events`)
    if (!response.ok) {
      throw new Error('Unable to load events')
    }
    const data = await response.json()
    setEvents(data)
  }

  const ensureStudentProfile = async () => {
    await fetch(`${API_BASE}/students/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(DEFAULT_PROFILE),
    })
  }

  const loadRecommendations = async () => {
    const response = await fetch(`${API_BASE}/recommendations/${STUDENT_ID}`)
    if (!response.ok) {
      throw new Error('Unable to load recommendations')
    }
    const data = await response.json()
    setRecommendations(data)
  }

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setIsLoading(true)
        await ensureStudentProfile()
        await loadEvents()
        await loadRecommendations()
      } catch (error) {
        setFeedback(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    bootstrap()
  }, [])

  const handleSearch = async (event) => {
    event.preventDefault()
    try {
      setIsLoading(true)
      setFeedback('')
      const response = await fetch(
        `${API_BASE}/search?q=${encodeURIComponent(query)}`,
      )
      if (!response.ok) {
        throw new Error('Search request failed')
      }
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      setFeedback(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormUpdate = (field, value) => {
    setEventForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreateEvent = async (event) => {
    event.preventDefault()
    try {
      setIsLoading(true)
      setFeedback('')

      const payload = {
        event_id: `evt-${Date.now()}`,
        title: eventForm.title,
        description: eventForm.description,
        skills_required: eventForm.skills_required,
        goal_tags: eventForm.goal_tags,
        scope: eventForm.scope,
        capacity_band: eventForm.capacity_band,
        capacity_limit: Number(eventForm.capacity_limit),
        registered_count: 0,
        registration_open_till: new Date(
          eventForm.registration_open_till,
        ).toISOString(),
        time_slot: eventForm.time_slot,
      }

      const response = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Event creation failed')
      }

      setFeedback('Event created successfully.')
      await loadEvents()
      await loadRecommendations()
    } catch (error) {
      setFeedback(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-[0_0_40px_rgba(16,185,129,0.08)] backdrop-blur">
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">
            ClubConnect
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-100 md:text-4xl">
            Algorithm-Driven Events Dashboard
          </h1>
          <p className="mt-2 text-zinc-400">
            DAA-T160 | Heap Top-K recommendations + KMP search engine
          </p>
        </header>

        <section className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => setRole('student')}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition ${
              role === 'student'
                ? 'bg-emerald-500 text-zinc-950'
                : 'border border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-emerald-500'
            }`}
          >
            Student
          </button>
          <button
            onClick={() => setRole('moderator')}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition ${
              role === 'moderator'
                ? 'bg-cyan-400 text-zinc-950'
                : 'border border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-cyan-400'
            }`}
          >
            Moderator
          </button>
        </section>

        {feedback && (
          <p className="mt-4 rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-amber-200">
            {feedback}
          </p>
        )}

        {role === 'student' ? (
          <section className="mt-6 grid gap-6 lg:grid-cols-5">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 lg:col-span-3">
              <h2 className="text-xl font-semibold">Search Events</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Pattern matching powered by KMP.
                <span className="ml-2 rounded bg-zinc-800 px-2 py-1 text-xs text-emerald-300">
                  O(n + m)
                </span>
              </p>
              <form onSubmit={handleSearch} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by title, skill, or description"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-zinc-100 outline-none ring-emerald-500 focus:ring"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-500 px-5 py-2 font-medium text-zinc-950 hover:bg-emerald-400"
                >
                  Search
                </button>
              </form>

              <div className="mt-5 space-y-3">
                {searchResults.length === 0 ? (
                  <p className="text-sm text-zinc-500">
                    No search results yet. Run a query to discover events.
                  </p>
                ) : (
                  searchResults.map((event) => (
                    <article
                      key={event.event_id}
                      className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4"
                    >
                      <h3 className="font-medium text-zinc-100">{event.title}</h3>
                      <p className="mt-1 text-sm text-zinc-400">{event.description}</p>
                    </article>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 lg:col-span-2">
              <h2 className="text-xl font-semibold">Recommended for You</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Heap-Based Top-K + Greedy selection.
              </p>
              <div className="mt-2 flex gap-2 text-xs">
                <span className="rounded bg-zinc-800 px-2 py-1 text-cyan-300">
                  Top-K: O(n log k)
                </span>
                <span className="rounded bg-zinc-800 px-2 py-1 text-emerald-300">
                  Greedy: O(r)
                </span>
              </div>

              <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-2">
                {recommendations.map((item) => (
                  <article
                    key={item.event.event_id}
                    className="min-w-[250px] snap-start rounded-xl border border-zinc-700 bg-zinc-950 p-4"
                  >
                    <h3 className="font-medium">{item.event.title}</h3>
                    <p className="mt-1 text-sm text-zinc-400">{item.event.time_slot}</p>
                    <p className="mt-3 text-sm text-emerald-300">
                      Match Score: {Math.round(item.score * 100)}%
                    </p>
                  </article>
                ))}
                {recommendations.length === 0 && (
                  <p className="text-sm text-zinc-500">No recommendations yet.</p>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="mt-6 grid gap-6 lg:grid-cols-5">
            <form
              onSubmit={handleCreateEvent}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 lg:col-span-3"
            >
              <h2 className="text-xl font-semibold">Create Event</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  required
                  value={eventForm.title}
                  onChange={(event) => handleFormUpdate('title', event.target.value)}
                  placeholder="Event title"
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                />
                <input
                  required
                  value={eventForm.time_slot}
                  onChange={(event) => handleFormUpdate('time_slot', event.target.value)}
                  placeholder="Time slot (e.g. sat-10:00)"
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                />
                <textarea
                  required
                  value={eventForm.description}
                  onChange={(event) =>
                    handleFormUpdate('description', event.target.value)
                  }
                  placeholder="Event description"
                  className="sm:col-span-2 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                  rows={3}
                />
                <select
                  value={eventForm.scope}
                  onChange={(event) => handleFormUpdate('scope', event.target.value)}
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                >
                  <option value="intra_college">Intra College</option>
                  <option value="inter_college">Inter College</option>
                </select>
                <select
                  value={eventForm.capacity_band}
                  onChange={(event) =>
                    handleFormUpdate('capacity_band', event.target.value)
                  }
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
                  onChange={(event) =>
                    handleFormUpdate('capacity_limit', event.target.value)
                  }
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                />
                <input
                  type="datetime-local"
                  required
                  value={eventForm.registration_open_till}
                  onChange={(event) =>
                    handleFormUpdate('registration_open_till', event.target.value)
                  }
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                />
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
                          const selected = eventForm.skills_required.includes(skill)
                          handleFormUpdate(
                            'skills_required',
                            selected
                              ? eventForm.skills_required.filter((item) => item !== skill)
                              : [...eventForm.skills_required, skill],
                          )
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
                          const selected = eventForm.goal_tags.includes(goal)
                          handleFormUpdate(
                            'goal_tags',
                            selected
                              ? eventForm.goal_tags.filter((item) => item !== goal)
                              : [...eventForm.goal_tags, goal],
                          )
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

              <button
                type="submit"
                className="mt-6 rounded-lg bg-cyan-400 px-5 py-2 font-medium text-zinc-950 hover:bg-cyan-300"
              >
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
                <p className="mt-1 text-2xl font-semibold text-emerald-300">
                  {totalRegistrations}
                </p>
              </div>
            </div>
          </section>
        )}

        {isLoading && (
          <p className="mt-4 text-sm text-zinc-400">Syncing with backend...</p>
        )}
      </div>
    </main>
  )
}

export default App
