import { format, isToday, isTomorrow, isPast } from 'date-fns'

export const formatDate = (date) => {
  if (!date) return null
  const d = new Date(date)
  if (isToday(d)) return 'Today'
  if (isTomorrow(d)) return 'Tomorrow'
  return format(d, 'MMM d, yyyy')
}

export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'COMPLETED') return false
  return isPast(new Date(dueDate))
}

export const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export const getPriorityWeight = (p) => ({ HIGH: 3, MEDIUM: 2, LOW: 1 }[p] || 0)

export const sortTasksByPriority = (tasks) =>
  [...tasks].sort((a, b) => getPriorityWeight(b.priority) - getPriorityWeight(a.priority))

export const groupTasksByStatus = (tasks) => ({
  TODO: tasks.filter(t => t.status === 'TODO'),
  IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS'),
  COMPLETED: tasks.filter(t => t.status === 'COMPLETED'),
})

export const truncate = (str, len = 60) =>
  str && str.length > len ? str.slice(0, len) + '...' : str
