import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, MessageSquare, Trash2, User, Calendar, Flag } from 'lucide-react'
import { projectsAPI, tasksAPI, usersAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const COLUMNS = [
  { key: 'TODO', label: 'To Do', color: '#64748b' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: '#3b82f6' },
  { key: 'COMPLETED', label: 'Done', color: '#10b981' },
]
const PRIORITY_COLORS = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#10b981' }
const PRIORITY_LABELS = { HIGH: 'badge-priority-high', MEDIUM: 'badge-priority-medium', LOW: 'badge-priority-low' }

function TaskModal({ task, projectId, members, onClose, onSave }) {
  const [form, setForm] = useState(task || { title:'', description:'', priority:'MEDIUM', status:'TODO', dueDate:'', assignedToId:'', estimatedHours:'', projectId })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { ...form, projectId, estimatedHours: form.estimatedHours || null, dueDate: form.dueDate || null, assignedToId: form.assignedToId || null }
      if (task) await tasksAPI.update(task.id, payload)
      else await tasksAPI.create(payload)
      toast.success(task ? 'Task updated!' : 'Task created!')
      onSave()
    } catch {} finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl w-full max-w-lg border border-[#2a2a3e] animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-[#1a1a26]">
          <h2 className="font-display font-bold text-white text-lg">{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="text-[#8888aa] hover:text-white transition-colors text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#c0c0d8] mb-2">Task Title *</label>
            <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              className="input-field" placeholder="e.g. Design login screen" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#c0c0d8] mb-2">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="input-field resize-none" rows={3} placeholder="Task details..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#c0c0d8] mb-2">Priority</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="input-field">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#c0c0d8] mb-2">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input-field">
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#c0c0d8] mb-2">Assignee</label>
              <select value={form.assignedToId} onChange={e => setForm({...form, assignedToId: e.target.value})} className="input-field">
                <option value="">Unassigned</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#c0c0d8] mb-2">Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="input-field" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : task ? 'Update' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function KanbanCard({ task, onEdit, onDelete, onStatusChange }) {
  const [dragging, setDragging] = useState(false)

  return (
    <div draggable
      onDragStart={e => { setDragging(true); e.dataTransfer.setData('taskId', task.id) }}
      onDragEnd={() => setDragging(false)}
      className={`bg-[#1a1a26] border border-[#2a2a3e] rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-brand-500/30 transition-all ${dragging ? 'opacity-50' : ''} group`}>
      <div className="flex items-start justify-between mb-2">
        <span className={PRIORITY_LABELS[task.priority]}>{task.priority}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(task)} className="p-1 rounded text-[#8888aa] hover:text-white hover:bg-[#2a2a3e] transition-all">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button onClick={() => onDelete(task.id)} className="p-1 rounded text-[#8888aa] hover:text-red-400 hover:bg-red-500/10 transition-all">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      <p className="text-sm font-medium text-white mb-2 leading-snug">{task.title}</p>
      {task.description && <p className="text-xs text-[#8888aa] mb-3 line-clamp-2">{task.description}</p>}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          {task.assignedTo && (
            <div className="w-6 h-6 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-300 text-xs font-bold"
              title={task.assignedTo.name}>
              {task.assignedTo.name?.charAt(0)}
            </div>
          )}
          {task.commentCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-[#8888aa]">
              <MessageSquare className="w-3 h-3" /> {task.commentCount}
            </span>
          )}
        </div>
        {task.dueDate && (
          <span className="text-xs text-[#8888aa] flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {format(new Date(task.dueDate), 'MMM d')}
          </span>
        )}
      </div>
    </div>
  )
}

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [dragOver, setDragOver] = useState(null)

  const load = useCallback(async () => {
    try {
      const [pr, tr] = await Promise.all([projectsAPI.getById(id), tasksAPI.getByProject(id)])
      setProject(pr.data.data)
      setTasks(tr.data.data || [])
      if (pr.data.data?.teamId) {
        // Get team members for assignment
        const { teamsAPI: ta } = await import('../services/api')
        // use usersAPI.getAll as fallback
        const ur = await usersAPI.getAll()
        setMembers(ur.data.data || [])
      }
    } catch {} finally { setLoading(false) }
  }, [id])

  useEffect(() => { load() }, [load])

  const handleDelete = async (taskId) => {
    if (!confirm('Delete this task?')) return
    try { await tasksAPI.delete(taskId); toast.success('Task deleted'); load() } catch {}
  }

  const handleDrop = async (e, newStatus) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    const task = tasks.find(t => t.id === taskId)
    if (!task || task.status === newStatus) { setDragOver(null); return }
    try {
      await tasksAPI.update(taskId, { ...task, status: newStatus, projectId: id, assignedToId: task.assignedTo?.id })
      toast.success(`Moved to ${newStatus.replace('_', ' ')}`)
      load()
    } catch {} finally { setDragOver(null) }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>
  if (!project) return <div className="text-center py-20 text-[#8888aa]">Project not found</div>

  const progress = project.totalTasks > 0 ? Math.round((project.completedTasks / project.totalTasks) * 100) : 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <button onClick={() => navigate('/projects')} className="flex items-center gap-2 text-[#8888aa] hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </button>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: `${project.color}20`, border: `1px solid ${project.color}40` }}>
              <span className="text-xl">📁</span>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-white">{project.title}</h2>
              <p className="text-[#8888aa] text-sm">{project.teamName} · {project.totalTasks} tasks</p>
            </div>
          </div>
          <button onClick={() => setModal({ mode: 'create' })} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-4 glass-card">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-[#8888aa]">Project Progress</span>
            <span className="font-medium text-white">{progress}%</span>
          </div>
          <div className="h-2 bg-[#1a1a26] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progress}%`, background: project.color || '#6550f7' }} />
          </div>
          <div className="flex gap-6 mt-3 text-xs text-[#8888aa]">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-500" />{project.todoTasks} Todo</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" />{project.inProgressTasks} In Progress</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />{project.completedTasks} Done</span>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key)
          return (
            <div key={col.key}
              onDragOver={e => { e.preventDefault(); setDragOver(col.key) }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => handleDrop(e, col.key)}
              className={`rounded-2xl p-4 transition-all duration-200 ${dragOver === col.key ? 'bg-brand-500/5 border-2 border-brand-500/30' : 'bg-[#0e0e16] border-2 border-transparent'}`}>
              {/* Column header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                  <span className="font-medium text-white">{col.label}</span>
                  <span className="text-xs bg-[#1a1a26] text-[#8888aa] px-2 py-0.5 rounded-full">{colTasks.length}</span>
                </div>
                <button onClick={() => setModal({ mode: 'create', defaultStatus: col.key })}
                  className="w-7 h-7 rounded-lg bg-[#1a1a26] hover:bg-[#2a2a3e] text-[#8888aa] hover:text-white flex items-center justify-center transition-all">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Cards */}
              <div className="space-y-3 min-h-[100px]">
                {colTasks.map(task => (
                  <KanbanCard key={task.id} task={task}
                    onEdit={t => setModal({ mode: 'edit', task: t })}
                    onDelete={handleDelete}
                    onStatusChange={() => {}} />
                ))}
                {colTasks.length === 0 && !dragOver && (
                  <div className="flex items-center justify-center h-20 rounded-xl border-2 border-dashed border-[#2a2a3e] text-[#5a5a7a] text-sm">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {modal && (
        <TaskModal
          task={modal.mode === 'edit' ? modal.task : null}
          projectId={id}
          members={members}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load() }} />
      )}
    </div>
  )
}
