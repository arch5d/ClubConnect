import { useState } from 'react'
import { SKILLS, GOALS } from '../App'

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate']
const TIME_SLOTS = [
  'mon-09:00', 'mon-14:00', 'tue-09:00', 'tue-14:00',
  'wed-09:00', 'wed-14:00', 'thu-09:00', 'thu-14:00',
  'fri-09:00', 'fri-14:00', 'fri-18:00',
  'sat-10:00', 'sat-14:00', 'sun-10:00', 'sun-14:00',
]

function Avatar({ initials, name }) {
  const colors = [
    'from-emerald-500 to-teal-600',
    'from-cyan-500 to-blue-600',
    'from-violet-500 to-purple-600',
    'from-rose-500 to-pink-600',
  ]
  const idx = (name?.charCodeAt(0) || 0) % colors.length
  const display = initials || (name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?')
  return (
    <div className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${colors[idx]} text-2xl font-bold text-white shadow-lg`}>
      {display}
    </div>
  )
}

function SkillBadge({ skill }) {
  const colorMap = {
    python: 'bg-blue-900/40 text-blue-300 border-blue-700/40',
    javascript: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/40',
    ui_ux: 'bg-pink-900/40 text-pink-300 border-pink-700/40',
    data_analysis: 'bg-purple-900/40 text-purple-300 border-purple-700/40',
    public_speaking: 'bg-orange-900/40 text-orange-300 border-orange-700/40',
    cloud: 'bg-sky-900/40 text-sky-300 border-sky-700/40',
    machine_learning: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/40',
  }
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${colorMap[skill] || 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}>
      {skill.replace('_', ' ')}
    </span>
  )
}

export default function StudentProfilePage({ profile, onSave, isLoading }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ ...profile })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const toggleList = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }))
  }

  const handleSave = async () => {
    await onSave(form)
    setEditing(false)
  }

  const handleCancel = () => {
    setForm({ ...profile })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="mt-6 space-y-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Edit Profile</h2>
            <div className="flex gap-2">
              <button onClick={handleCancel} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500">
                Cancel
              </button>
              <button onClick={handleSave} disabled={isLoading} className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400 disabled:opacity-50">
                Save Changes
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400">Full Name</label>
              <input value={form.full_name} onChange={e => update('full_name', e.target.value)}
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:ring focus:ring-emerald-500" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400">College</label>
              <input value={form.college} onChange={e => update('college', e.target.value)}
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:ring focus:ring-emerald-500" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400">Contact / Email</label>
              <input value={form.contact} onChange={e => update('contact', e.target.value)}
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:ring focus:ring-emerald-500" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400">Department</label>
              <input value={form.department} onChange={e => update('department', e.target.value)}
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:ring focus:ring-emerald-500" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400">Year</label>
              <select value={form.year} onChange={e => update('year', e.target.value)}
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:ring focus:ring-emerald-500">
                <option value="">Select year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400">Avatar Initials (optional)</label>
              <input maxLength={2} value={form.avatar_initials} onChange={e => update('avatar_initials', e.target.value.toUpperCase())}
                placeholder="e.g. AM"
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:ring focus:ring-emerald-500" />
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs text-zinc-400">Bio</label>
              <textarea value={form.bio} onChange={e => update('bio', e.target.value)} rows={3}
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:ring focus:ring-emerald-500" />
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs text-zinc-400">Interests (comma-separated)</label>
              <input value={form.interests.join(', ')}
                onChange={e => update('interests', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:ring focus:ring-emerald-500" />
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm text-zinc-400">Skills</p>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map(skill => (
                <button key={skill} type="button" onClick={() => toggleList('skills', skill)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    form.skills.includes(skill)
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-500'
                  }`}>
                  {skill.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm text-zinc-400">Goals</p>
            <div className="flex flex-wrap gap-2">
              {GOALS.map(goal => (
                <button key={goal} type="button" onClick={() => toggleList('goals', goal)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    form.goals.includes(goal)
                      ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300'
                      : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-500'
                  }`}>
                  {goal}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm text-zinc-400">Available Time Slots</p>
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map(slot => (
                <button key={slot} type="button" onClick={() => toggleList('available_slots', slot)}
                  className={`rounded border px-2 py-1 text-xs transition ${
                    form.available_slots.includes(slot)
                      ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                      : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-500'
                  }`}>
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // View mode
  return (
    <div className="mt-6 space-y-6">
      {/* Profile Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <Avatar initials={profile.avatar_initials} name={profile.full_name} />
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-zinc-100">{profile.full_name}</h2>
                <p className="mt-0.5 text-sm text-zinc-400">
                  {[profile.department, profile.year, profile.college].filter(Boolean).join(' · ')}
                </p>
              </div>
              <button onClick={() => setEditing(true)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-emerald-500 hover:text-emerald-300 transition">
                Edit Profile
              </button>
            </div>
            {profile.bio && (
              <p className="mt-3 text-sm text-zinc-300 leading-relaxed">{profile.bio}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-zinc-400">
              <span>📧 {profile.contact}</span>
              <span>🆔 {profile.student_id}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Skills */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">Skills</h3>
          {profile.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map(s => <SkillBadge key={s} skill={s} />)}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No skills added yet.</p>
          )}
        </div>

        {/* Goals */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">Goals</h3>
          {profile.goals.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.goals.map(g => (
                <span key={g} className="rounded-full border border-cyan-700/40 bg-cyan-900/30 px-3 py-1 text-xs font-medium text-cyan-300">
                  {g}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No goals set yet.</p>
          )}
        </div>

        {/* Interests */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">Interests</h3>
          {profile.interests.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.interests.map(i => (
                <span key={i} className="rounded-full border border-violet-700/40 bg-violet-900/30 px-3 py-1 text-xs font-medium text-violet-300">
                  {i}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No interests added yet.</p>
          )}
        </div>

        {/* Available Slots */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:col-span-2 lg:col-span-3">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">Available Time Slots</h3>
          {profile.available_slots.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.available_slots.map(slot => (
                <span key={slot} className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                  {slot}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No time slots set.</p>
          )}
        </div>
      </div>
    </div>
  )
}
