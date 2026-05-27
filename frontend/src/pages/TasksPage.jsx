import { useState, useEffect } from 'react'
import { CheckSquare, Clock, Flag, MessageSquare, Filter, Search, Plus, User } from 'lucide-react'
import { tasksAPI, projectsAPI } from '../services/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const PRIORITY_COLORS = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#10b981' }
const PRIORITY_BADGE = { HIGH: 'badge-priority-high', MEDIUM: 'badge-priority-medium', LOW: 'badge-priority-low' }
const STATUS_BADGE = { TODO: 'badge-todo', IN_PROGRESS: 'badge-in-progress', COMPLETED: 'badge-completed' }

function TaskDetailModal({ task, onClose, onUpdate }) {
  const [comments, setComments] = useState([])
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    if (task) {
      tasksAPI.getComments(task.id).then(r => setComments(r.data.data || [])).finally(() => setLoading(false))
    }
  }, [task?.id])

  const postComment = async () => {
    if (!comment.trim()) return
    setPosting(true)
    try {
      await tasksAPI.addComment(task.id, { content: comment })
      setComment('')
      const r = await tasksAPI.getComments(task.id)
      setComments(r.data.data || [])
      toast.success('Comment added')
    } catch {} finally { setPosting(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl w-full max-w-2xl border border-[#2a2a3e] animate-slide-up max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-[#1a1a26]">
          <div className="flex items-center gap-3">
            <span className={PRIORITY_BADGE[task.priority]}>{task.priority}</span>
            <span className={STATUS_BADGE[task.status]}>{task.status?.replace('_', ' ')}</span>
          </div>
          <button onClick={onClose} className="text-[#8888aa] hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          <h2 className="font-display text-xl font-bold text-white">{task.title}</h2>
          {task.description && <p className="text-[#8888aa] text-sm leading-relaxed">{task.description}</p>}

          <div className="grid grid-cols-2 gap-4">
            {task.assignedTo && (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-[#8888aa]" />
                <div>
                  <p className="text-xs text-[#8888aa]">Assigned to</p>
                  <p className="text-white font-medium">{task.assignedTo.name}</p>
                </div>
              </div>
            )}
            {task.dueDate && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-[#8888aa]" />
                <div>
                  <p className="text-xs text-[#8888aa]">Due date</p>
                  <p className="text-white font-medium">{format(new Date(task.dueDate), 'MMM d, yyyy')}</p>
                </div>
              </div>
            )}
          </div>

          {task.projectTitle && (
            <div className="p-3 rounded-xl bg-[#1a1a26] border border-[#2a2a3e]">
              <p className="text-xs text-[#8888aa]">Project</p>
              <p className="text-white text-sm font-medium">{task.projectTitle}</p>
            </div>
          )}

          {/* Comments */}
          <div>
            <h3 className="font-medium text-white mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Comments ({comments.length})
            </h3>
            {loading ? <div className="text-center text-[#8888aa] text-sm">Loading...</div> :
              comments.length === 0 ? <p className="text-[#8888aa] text-sm">No comments yet</p> :
              <div className="space-y-3">
                {comments.map(c => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-300 text-xs font-bold flex-shrink-0">
                      {c.user?.name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">{c.user?.name}</span>
                        <span className="text-xs text-[#5a5a7a]">{c.createdAt ? format(new Date(c.createdAt), 'MMM d, HH:mm') : ''}</span>
                      </div>
                      <p className="text-sm text-[#c0c0d8] leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>
        </div>

        {/* Comment input */}
        <div className="p-4 border-t border-[#1a1a26]">
          <div className="flex gap-2">
            <input value={comment} onChange={e => setComment(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && postComment()}
              placeholder="Add a comment..." className="input-field flex-1 py-2" />
            <button onClick={postComment} disabled={posting || !comment.trim()} className="btn-primary px-4">
              {posting ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ priority: '', status: '' })
  const [selected, setSelected] = useState(null)
  const [view, setView] = useState('list')

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await tasksAPI.getMyTasks()
      setTasks(data.data || [])
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = tasks.filter(t => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase())
    const matchPriority = !filters.priority || t.priority === filters.priority
    const matchStatus = !filters.status || t.status === filters.status
    return matchSearch && matchPriority && matchStatus
  })

  const handleStatusChange = async (task, newStatus) => {
    try {
      await tasksAPI.update(task.id, { ...task, status: newStatus, projectId: task.projectId, assignedToId: task.assignedTo?.id })
      toast.success('Status updated')
      load()
    } catch {}
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888aa]" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks..." className="input-field pl-9 w-52 py-2" />
          </div>
          <select value={filters.priority} onChange={e => setFilters({...filters, priority: e.target.value})}
            className="input-field py-2 w-36">
            <option value="">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}
            className="input-field py-2 w-40">
            <option value="">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        <p className="text-sm text-[#8888aa]">{filtered.length} tasks</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#8888aa]">
          <CheckSquare className="w-16 h-16 mb-4 opacity-20" />
          <h3 className="text-lg font-medium text-white mb-2">No tasks found</h3>
          <p className="text-sm">Tasks assigned to you will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(task => (
            <div key={task.id}
              className="glass rounded-xl p-4 hover:border-brand-500/20 transition-all cursor-pointer group"
              onClick={() => setSelected(task)}>
              <div className="flex items-center gap-4">
                {/* Priority dot */}
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PRIORITY_COLORS[task.priority] }} />
                
                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-sm font-medium text-white truncate group-hover:text-brand-400 transition-colors">{task.title}</p>
                    <span className={PRIORITY_BADGE[task.priority]}>{task.priority}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#8888aa]">
                    {task.projectTitle && <span className="truncate">{task.projectTitle}</span>}
                    {task.assignedTo && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {task.assignedTo.name}
                      </span>
                    )}
                    {task.commentCount > 0 && (
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> {task.commentCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status selector */}
                <div className="flex items-center gap-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
                  {task.dueDate && (
                    <span className="hidden sm:flex items-center gap-1 text-xs text-[#8888aa]">
                      <Clock className="w-3 h-3" /> {format(new Date(task.dueDate), 'MMM d')}
                    </span>
                  )}
                  <select value={task.status}
                    onChange={e => handleStatusChange(task, e.target.value)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium cursor-pointer focus:outline-none bg-transparent
                      ${task.status === 'TODO' ? 'border-slate-500/30 text-slate-400 hover:bg-slate-500/10' :
                        task.status === 'IN_PROGRESS' ? 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10' :
                        'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'}`}>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && <TaskDetailModal task={selected} onClose={() => setSelected(null)} onUpdate={load} />}
    </div>
  )
}
