import { useState } from 'react'
import { CategoryBadge } from './ui'
import EventCard from './EventCard'

export default function ClubsPage({ clubs, events }) {
  const [expandedClub, setExpandedClub] = useState(null)
  const [filter, setFilter] = useState('All')

  const categories = ['All', ...new Set(clubs.map(c => c.category))]
  const filtered = filter === 'All' ? clubs : clubs.filter(c => c.category === filter)

  return (
    <div className="mt-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">Browse Clubs</h2>
          <p className="mt-0.5 text-sm text-zinc-400">{clubs.length} club{clubs.length !== 1 ? 's' : ''} registered</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                filter === cat ? 'bg-emerald-500 text-zinc-950' : 'border border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
          <p className="text-zinc-400">No clubs in this category yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(club => {
            const clubEvents = events.filter(e => e.club_id === club.club_id)
            const isOpen = expandedClub === club.club_id
            return (
              <div key={club.club_id} className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                <button onClick={() => setExpandedClub(isOpen ? null : club.club_id)}
                  className="w-full p-5 text-left hover:bg-zinc-800/40 transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-zinc-100">{club.name}</h3>
                        <CategoryBadge category={club.category} />
                      </div>
                      <p className="text-sm text-zinc-400 line-clamp-2">{club.description}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-zinc-500">{clubEvents.length} event{clubEvents.length !== 1 ? 's' : ''}</p>
                      <p className="text-zinc-500 mt-1">{isOpen ? '▲' : '▼'}</p>
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-zinc-800 px-5 pb-5 pt-4">
                    {clubEvents.length === 0 ? (
                      <p className="text-sm text-zinc-500">No events under this club yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {clubEvents.map(ev => (
                          <EventCard key={ev.event_id} event={ev} clubs={[club]} showActions={false} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
