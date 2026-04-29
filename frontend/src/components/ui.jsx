import { SKILL_COLORS, GOAL_COLORS, CATEGORY_COLORS, getAvatarGradient, getInitials } from '../constants'

export function Avatar({ initials, name, size = 'md' }) {
  const gradient = getAvatarGradient(name)
  const display = initials || getInitials(name)
  const sz = size === 'lg' ? 'h-20 w-20 text-2xl' : size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} font-bold text-white shadow-lg ${sz}`}>
      {display}
    </div>
  )
}

export function SkillBadge({ skill }) {
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${SKILL_COLORS[skill] || 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}>
      {skill.replace(/_/g, ' ')}
    </span>
  )
}

export function GoalBadge({ goal }) {
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${GOAL_COLORS[goal] || 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}>
      {goal}
    </span>
  )
}

export function CategoryBadge({ category }) {
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[category] || CATEGORY_COLORS.General}`}>
      {category}
    </span>
  )
}

export function ScopeBadge({ scope }) {
  return (
    <span className={`rounded border px-2 py-0.5 text-xs ${scope === 'inter_college' ? 'border-violet-700/40 bg-violet-900/30 text-violet-300' : 'border-zinc-700 bg-zinc-800 text-zinc-400'}`}>
      {scope === 'inter_college' ? 'Inter-College' : 'Intra-College'}
    </span>
  )
}

export function CapacityBar({ registered, limit }) {
  const pct = Math.min(100, Math.round((registered / limit) * 100))
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
  return (
    <div>
      <div className="flex justify-between text-xs text-zinc-500 mb-1">
        <span>{registered}/{limit} registered</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-zinc-800">
        <div className={`h-1.5 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function Spinner() {
  return (
    <div className="flex items-center gap-2 text-sm text-zinc-400">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-emerald-400" />
      Loading…
    </div>
  )
}

export function Toast({ message, type = 'info', onClose }) {
  const styles = {
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    error: 'border-red-500/30 bg-red-500/10 text-red-300',
    info: 'border-amber-400/30 bg-amber-500/10 text-amber-200',
  }
  return (
    <div className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${styles[type]}`}>
      <span>{message}</span>
      <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100">✕</button>
    </div>
  )
}

export function StatCard({ label, value, color = 'text-zinc-100' }) {
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-4">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  )
}
