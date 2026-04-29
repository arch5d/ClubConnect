import { SkillBadge, GoalBadge, ScopeBadge, CapacityBar } from './ui'
import { fmtDate, isFull, spotsLeft } from '../constants'

export default function EventCard({ event, clubs = [], isRegistered = false, onRegister, onUnregister, onDelete, showActions = true, compact = false }) {
  const club = clubs.find(c => c.club_id === event.club_id)
  const full = isFull(event)
  const left = spotsLeft(event)
  const registrationClosed = new Date(event.registration_open_till) < new Date()

  if (compact) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-zinc-100 leading-snug">{event.title}</h4>
          <ScopeBadge scope={event.scope} />
        </div>
        <p className="mt-1 text-xs text-zinc-500">🕐 {event.time_slot} · 📅 {fmtDate(event.registration_open_till)}</p>
        <CapacityBar registered={event.registered_count} limit={event.capacity_limit} />
      </div>
    )
  }

  return (
    <article className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-zinc-600">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {club && (
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                {club.name}
              </span>
            )}
            <ScopeBadge scope={event.scope} />
            {registrationClosed && (
              <span className="rounded border border-red-700/40 bg-red-900/30 px-2 py-0.5 text-xs text-red-300">
                Registration Closed
              </span>
            )}
            {full && (
              <span className="rounded border border-red-700/40 bg-red-900/30 px-2 py-0.5 text-xs text-red-300">
                Full
              </span>
            )}
          </div>
          <h3 className="text-base font-semibold text-zinc-100 leading-snug">{event.title}</h3>
        </div>
        {event.prize && (
          <span className="shrink-0 rounded-lg border border-amber-700/40 bg-amber-900/20 px-2 py-1 text-xs text-amber-300">
            🏆 {event.prize.length > 20 ? event.prize.slice(0, 20) + '…' : event.prize}
          </span>
        )}
      </div>

      <p className="mt-2 text-sm text-zinc-400 leading-relaxed line-clamp-2">{event.description}</p>

      {/* Meta */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
        <span>🕐 {event.time_slot}</span>
        {event.venue && <span>📍 {event.venue}</span>}
        <span>📅 Open till {fmtDate(event.registration_open_till)}</span>
      </div>

      {/* Capacity */}
      <div className="mt-3">
        <CapacityBar registered={event.registered_count} limit={event.capacity_limit} />
      </div>

      {/* Skills + Goals */}
      {(event.skills_required.length > 0 || event.goal_tags.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {event.skills_required.map(s => <SkillBadge key={s} skill={s} />)}
          {event.goal_tags.map(g => <GoalBadge key={g} goal={g} />)}
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="mt-4 flex flex-wrap gap-2">
          {onRegister && !isRegistered && (
            <button
              onClick={() => onRegister(event.event_id)}
              disabled={full || registrationClosed}
              className="rounded-lg bg-emerald-500 px-4 py-1.5 text-sm font-medium text-zinc-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40 transition"
            >
              {registrationClosed ? 'Registration Closed' : full ? 'Event Full' : `Register · ${left} spot${left !== 1 ? 's' : ''} left`}
            </button>
          )}
          {onUnregister && isRegistered && (
            <button
              onClick={() => onUnregister(event.event_id)}
              className="rounded-lg border border-zinc-600 px-4 py-1.5 text-sm text-zinc-300 hover:border-red-500 hover:text-red-300 transition"
            >
              ✓ Registered · Withdraw
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(event.event_id)}
              className="ml-auto rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-500 hover:border-red-500 hover:text-red-400 transition"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </article>
  )
}
