import { useState } from 'react'
import { SKILLS, GOALS, YEARS, TIME_SLOTS } from '../constants'
import { Avatar, SkillBadge, GoalBadge, Toast } from './ui'

export default function StudentProfilePage({ profile, onSave, isLoading }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ ...profile })
  const [toast, setToast] = useState(null)

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))
  const toggleList = (field, value) => setForm(prev => ({
    ...prev,
    [field]: prev[field].includes(value)
      ? prev[field].filter(v => v !== value)
      : [...prev[field], value],
  }))

  const handleSave = async () => {
    await onSave(form)
    setEditing(false)
    setToast({ message: 'Profile updated!', type: 'success' })
    setTimeout(() => setToast(null), 3000)
  }

  const inputCls = 'rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-zinc-100 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 w-full'
  const labelCls = 'block text-xs text-zinc-400 mb-1'

  if (editing) {
    return (
      <div className="mt-6 space-y-6">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Edit Profile</h2>
            <div className="flex gap-2">
              <button onClick={() => { setForm({ ...profile }); setEditing(false) }}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500 transition">
                Cancel
              </button>
              <button onClick={handleSave} disabled={isLoading}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400 disabled:opacity-50 transition">
                {isLoading ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['full_name', 'Full Name'],
              ['college', 'College'],
              ['contact', 'Email / Contact'],
              ['department', 'Department'],
            ].map(([field, label]) => (
              <div key={field}>
                <label className={labelCls}>{label}</label>
                <input value={form[field]} onChange={e => update(field, e.target.value)} className={inputCls} />
              </div>
            ))}
            <div>
              <label className={labelCls}>Year</label>
              <select value={form.year} onChange={e => update('year', e.target.value)} className={inputCls}>
                <option value="">Select year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Avatar Initials (2 chars)</label>
              <input maxLength={2} value={form.avatar_initials}
                onChange={e => update('avatar_initials', e.target.value.toUpperCase())}
                placeholder="e.g. AM" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Bio</label>
              <textarea rows={3} value={form.bio} onChange={e => update('bio', e.target.value)} className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Interests (comma-separated)</label>
              <input value={form.interests.join(', ')}
                onChange={e => update('interests', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                className={inputCls} />
            </div>
          </div>

          <div className="mt-5">
            <p className={labelCls}>Skills</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {SKILLS.map(skill => (
                <button key={skill} type="button" onClick={() => toggleList('skills', skill)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    form.skills.includes(skill)
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-500'
                  }`}>
                  {skill.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className={labelCls}>Goals</p>
            <div className="flex flex-wrap gap-2 mt-1">
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
            <p className={labelCls}>Available Time Slots</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {TIME_SLOTS.map(slot => (
                <button key={slot} type="button" onClick={() => toggleList('available_slots', slot)}
                  className={`rounded border px-2.5 py-1 text-xs transition ${
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
    <div className="mt-6 space-y-5">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Hero card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <Avatar initials={profile.avatar_initials} name={profile.full_name} size="lg" />
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-zinc-100">{profile.full_name}</h2>
                <p className="mt-0.5 text-sm text-zinc-400">
                  {[profile.department, profile.year, profile.college].filter(Boolean).join(' · ')}
                </p>
              </div>
              <button onClick={() => setEditing(true)}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-emerald-500 hover:text-emerald-300 transition">
                ✏️ Edit Profile
              </button>
            </div>
            {profile.bio && <p className="mt-3 text-sm text-zinc-300 leading-relaxed">{profile.bio}</p>}
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-zinc-500">
              <span>📧 {profile.contact}</span>
              <span>🆔 {profile.student_id}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Skills</h3>
          {profile.skills.length > 0
            ? <div className="flex flex-wrap gap-2">{profile.skills.map(s => <SkillBadge key={s} skill={s} />)}</div>
            : <p className="text-sm text-zinc-600">None added yet.</p>}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Goals</h3>
          {profile.goals.length > 0
            ? <div className="flex flex-wrap gap-2">{profile.goals.map(g => <GoalBadge key={g} goal={g} />)}</div>
            : <p className="text-sm text-zinc-600">None set yet.</p>}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Interests</h3>
          {profile.interests.length > 0
            ? <div className="flex flex-wrap gap-2">
                {profile.interests.map(i => (
                  <span key={i} className="rounded-full border border-violet-700/40 bg-violet-900/30 px-2.5 py-0.5 text-xs text-violet-300">{i}</span>
                ))}
              </div>
            : <p className="text-sm text-zinc-600">None added yet.</p>}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:col-span-2 lg:col-span-3">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Available Time Slots</h3>
          {profile.available_slots.length > 0
            ? <div className="flex flex-wrap gap-2">
                {profile.available_slots.map(slot => (
                  <span key={slot} className="rounded border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300">{slot}</span>
                ))}
              </div>
            : <p className="text-sm text-zinc-600">No slots set.</p>}
        </div>
      </div>
    </div>
  )
}
