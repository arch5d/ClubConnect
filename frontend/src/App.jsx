import { useEffect, useState } from 'react'
import { API_BASE } from './constants'
import LoginPage from './components/LoginPage'
import StudentDashboard from './components/StudentDashboard'
import StudentProfilePage from './components/StudentProfilePage'
import ClubsPage from './components/ClubsPage'
import ModeratorDashboard from './components/ModeratorDashboard'
import { Avatar, Spinner } from './components/ui'

export default function App() {
  const [user, setUser] = useState(() => {
    // Restore user from localStorage on initial load
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [activeTab, setActiveTab] = useState('dashboard')
  const [events, setEvents] = useState([])
  const [clubs, setClubs] = useState([])
  const [studentProfile, setStudentProfile] = useState(null)
  const [bootstrapping, setBootstrapping] = useState(false)
  const [globalFeedback, setGlobalFeedback] = useState('')

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }, [user])

  const loadEvents = async () => {
    const res = await fetch(`${API_BASE}/events`)
    if (res.ok) setEvents(await res.json())
  }

  const loadClubs = async () => {
    const res = await fetch(`${API_BASE}/clubs`)
    if (res.ok) setClubs(await res.json())
  }

  const loadStudentProfile = async (userId) => {
    const res = await fetch(`${API_BASE}/students/${userId}`)
    if (res.ok) setStudentProfile(await res.json())
  }

  // Bootstrap after login
  useEffect(() => {
    if (!user) return
    const init = async () => {
      setBootstrapping(true)
      try {
        await Promise.all([loadEvents(), loadClubs()])
        if (user.role === 'student') await loadStudentProfile(user.user_id)
      } catch (err) {
        setGlobalFeedback('Failed to load data. Is the backend running?')
      } finally {
        setBootstrapping(false)
      }
    }
    init()
  }, [user])

  const handleLogin = (loginData) => {
    setUser(loginData)
    setActiveTab('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    setEvents([])
    setClubs([])
    setStudentProfile(null)
    setActiveTab('dashboard')
  }

  const handleProfileSave = async (updatedProfile) => {
    const res = await fetch(`${API_BASE}/students/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProfile),
    })
    if (res.ok) {
      const saved = await res.json()
      setStudentProfile(saved)
    }
  }

  if (!user) return <LoginPage onLogin={handleLogin} />

  const isStudent = user.role === 'student'
  const isModerator = user.role === 'moderator'

  const studentTabs = [
    { id: 'dashboard', label: '🏠 Dashboard' },
    { id: 'profile', label: '👤 My Profile' },
    { id: 'clubs', label: '🏛 Clubs' },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-zinc-950 font-bold text-sm">C</div>
            <span className="font-semibold text-zinc-100">ClubConnect</span>
            <span className="hidden rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-500 sm:inline">DAA-T160</span>
          </div>

          {/* Tab nav (student only) */}
          {isStudent && (
            <div className="hidden sm:flex gap-1">
              {studentTabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`rounded-lg px-3 py-1.5 text-sm transition ${
                    activeTab === t.id
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {/* User + logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <Avatar name={user.full_name} size="sm" />
              <div className="text-right">
                <p className="text-xs font-medium text-zinc-200">{user.full_name}</p>
                <p className={`text-xs ${isStudent ? 'text-emerald-400' : 'text-cyan-400'}`}>
                  {isStudent ? 'Student' : 'Moderator'}
                </p>
              </div>
            </div>
            <button onClick={handleLogout}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition">
              Sign out
            </button>
          </div>
        </div>

        {/* Mobile tab nav */}
        {isStudent && (
          <div className="flex gap-1 overflow-x-auto px-4 pb-2 sm:hidden">
            {studentTabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-sm transition ${
                  activeTab === t.id ? 'bg-emerald-500/20 text-emerald-300' : 'text-zinc-400'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Page header */}
        <div className="mb-6">
          {isStudent && activeTab === 'dashboard' && (
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">Welcome back, {user.full_name.split(' ')[0]} 👋</h1>
              <p className="mt-1 text-sm text-zinc-400">Discover events, register, and track your activity.</p>
            </div>
          )}
          {isStudent && activeTab === 'profile' && (
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">My Profile</h1>
              <p className="mt-1 text-sm text-zinc-400">Manage your skills, goals, and availability to get better recommendations.</p>
            </div>
          )}
          {isStudent && activeTab === 'clubs' && (
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">Clubs</h1>
              <p className="mt-1 text-sm text-zinc-400">Explore all registered clubs and their events.</p>
            </div>
          )}
          {isModerator && (
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">Moderator Panel</h1>
              <p className="mt-1 text-sm text-zinc-400">Manage events, clubs, and view analytics.</p>
            </div>
          )}
        </div>

        {globalFeedback && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {globalFeedback}
          </div>
        )}

        {bootstrapping ? (
          <div className="flex items-center justify-center py-20"><Spinner /></div>
        ) : (
          <>
            {isStudent && activeTab === 'dashboard' && (
              <StudentDashboard
                user={user}
                events={events}
                clubs={clubs}
                onEventsChange={loadEvents}
              />
            )}
            {isStudent && activeTab === 'profile' && studentProfile && (
              <StudentProfilePage
                profile={studentProfile}
                onSave={handleProfileSave}
                isLoading={false}
              />
            )}
            {isStudent && activeTab === 'clubs' && (
              <ClubsPage clubs={clubs} events={events} />
            )}
            {isModerator && (
              <ModeratorDashboard
                user={user}
                events={events}
                clubs={clubs}
                onEventsChange={loadEvents}
                onClubsChange={loadClubs}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-600">
        ClubConnect · DAA-T160 · Heap Top-K O(n log k) · KMP Search O(n+m) · Greedy Scheduling O(r)
      </footer>
    </div>
  )
}
