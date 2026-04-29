export const API_BASE = 'http://127.0.0.1:8000'

export const SKILLS = [
  'python', 'javascript', 'ui_ux', 'data_analysis',
  'public_speaking', 'cloud', 'machine_learning',
]

export const GOALS = ['learn', 'network', 'build', 'compete']

export const SKILL_COLORS = {
  python: 'bg-blue-900/50 text-blue-300 border-blue-700/50',
  javascript: 'bg-yellow-900/50 text-yellow-300 border-yellow-700/50',
  ui_ux: 'bg-pink-900/50 text-pink-300 border-pink-700/50',
  data_analysis: 'bg-purple-900/50 text-purple-300 border-purple-700/50',
  public_speaking: 'bg-orange-900/50 text-orange-300 border-orange-700/50',
  cloud: 'bg-sky-900/50 text-sky-300 border-sky-700/50',
  machine_learning: 'bg-emerald-900/50 text-emerald-300 border-emerald-700/50',
}

export const GOAL_COLORS = {
  learn: 'bg-teal-900/50 text-teal-300 border-teal-700/50',
  network: 'bg-indigo-900/50 text-indigo-300 border-indigo-700/50',
  build: 'bg-amber-900/50 text-amber-300 border-amber-700/50',
  compete: 'bg-rose-900/50 text-rose-300 border-rose-700/50',
}

export const CATEGORY_COLORS = {
  Technical: 'bg-blue-900/40 text-blue-300 border-blue-700/40',
  Cultural: 'bg-pink-900/40 text-pink-300 border-pink-700/40',
  Sports: 'bg-orange-900/40 text-orange-300 border-orange-700/40',
  Literary: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/40',
  Social: 'bg-green-900/40 text-green-300 border-green-700/40',
  Research: 'bg-purple-900/40 text-purple-300 border-purple-700/40',
  General: 'bg-zinc-800 text-zinc-300 border-zinc-700',
}

export const CATEGORIES = ['Technical', 'Cultural', 'Sports', 'Literary', 'Social', 'Research', 'General']

export const TIME_SLOTS = [
  'mon-09:00', 'mon-14:00', 'tue-09:00', 'tue-14:00',
  'wed-09:00', 'wed-14:00', 'thu-09:00', 'thu-14:00',
  'fri-09:00', 'fri-14:00', 'fri-18:00',
  'sat-10:00', 'sat-14:00', 'sun-10:00', 'sun-14:00',
]

export const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate']

export const AVATAR_GRADIENTS = [
  'from-emerald-500 to-teal-600',
  'from-cyan-500 to-blue-600',
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-indigo-500 to-blue-700',
]

export function getAvatarGradient(name) {
  return AVATAR_GRADIENTS[(name?.charCodeAt(0) || 0) % AVATAR_GRADIENTS.length]
}

export function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export function fmtDate(iso) {
  try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return iso }
}

export function isFull(event) {
  return event.registered_count >= event.capacity_limit
}

export function spotsLeft(event) {
  return Math.max(0, event.capacity_limit - event.registered_count)
}
