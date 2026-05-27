import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, FolderKanban, Clock, CheckSquare, MoreHorizontal, Trash2, Edit, Eye } from 'lucide-react'
import { projectsAPI, teamsAPI } from '../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const STATUS_COLORS = {
  ACTIVE: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  PLANNING: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  ON_HOLD: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  COMPLETED: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  CANCELLED: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
}

const PROJECT_COLORS = ['#6550f7','#3b82f6','#10b981','#f59e0b','#ec4899','#8b5cf6','#06b6d4','#ef4444']

function ProjectModal({ project, teams, onClose, onSave }) {
  const [form, setForm] = useState(project || { title:'', description:'', status:'ACTIVE', color:'#6550f7', teamId:'', deadline:'' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, deadline: form.deadline || null }
      if (project) await projectsAPI.update(project.id, payload)
      else await projectsAPI.create(payload)
      toast.success(project ? 'Project updated!' : 'Project created!')
      onSave()
    } catch {} finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl w-full max-w-lg border border-[#2a2a3e] animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-[#1a1a26]">
          <h2 className="font-display font-bold text-white text-lg">{project ? 'Edit Project' : 'New Project'}</h2>
          <button onClick={onClose} className="text-[#8888aa] hover:text-white transition-colors text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#c0c0d8] mb-2">Project Name *</label>
            <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              className="input-field" placeholder="e.g. Mobile App Redesign" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#c0c0d8] mb-2">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="input-field resize-none" rows={3} placeholder="What's this project about?" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#c0c0d8] mb-2">Team *</label>
              <select required value={form.teamId} onChange={e => setForm({...form, teamId: e.target.value})}
                className="input-field">
                <option value="">Select team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.teamName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#c0c0d8] mb-2">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                className="input-field">
                {['PLANNING','ACTIVE','ON_HOLD','COMPLETED','CANCELLED'].map(s =>
                  <option key={s} value={s}>{s.replace('_',' ')}</option>
                )}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#c0c0d8] mb-2">Deadline</label>
              <input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})}
                className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#c0c0d8] mb-2">Color</label>
              <div className="flex items-center gap-2 flex-wrap">
                {PROJECT_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm({...form, color: c})}
                    className="w-7 h-7 rounded-lg border-2 transition-all"
                    style={{ background: c, borderColor: form.color === c ? 'white' : 'transparent' }} />
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ProjectCard({ project, onEdit, onDelete, onClick }) {
  const [menu, setMenu] = useState(false)
  const progress = project.totalTasks > 0 ? Math.round((project.completedTasks / project.totalTasks) * 100) : 0
  const sc = STATUS_COLORS[project.status] || STATUS_COLORS.ACTIVE

  return (
    <div className="glass rounded-2xl p-5 hover:border-brand-500/20 transition-all duration-300 group relative">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${project.color || '#6550f7'}20`, border: `1px solid ${project.color || '#6550f7'}40` }}>
            <FolderKanban className="w-5 h-5" style={{ color: project.color || '#6550f7' }} />
          </div>
          <div>
            <h3 className="font-medium text-white group-hover:text-brand-400 transition-colors truncate max-w-36">{project.title}</h3>
            <p className="text-xs text-[#8888aa]">{project.teamName}</p>
          </div>
        </div>
        <div className="relative">
          <button onClick={(e) => { e.stopPropagation(); setMenu(!menu) }}
            className="p-1.5 rounded-lg text-[#8888aa] hover:text-white hover:bg-[#1a1a26] transition-all">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menu && (
            <div className="absolute right-0 top-8 glass rounded-xl border border-[#2a2a3e] w-40 z-10 shadow-2xl overflow-hidden">
              <button onClick={(e) => { e.stopPropagation(); onClick(project); setMenu(false) }}
                className="w-full px-4 py-2.5 text-left text-sm text-[#8888aa] hover:text-white hover:bg-[#1a1a26] flex items-center gap-2">
                <Eye className="w-4 h-4" /> View
              </button>
              <button onClick={(e) => { e.stopPropagation(); onEdit(project); setMenu(false) }}
                className="w-full px-4 py-2.5 text-left text-sm text-[#8888aa] hover:text-white hover:bg-[#1a1a26] flex items-center gap-2">
                <Edit className="w-4 h-4" /> Edit
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(project.id); setMenu(false) }}
                className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {project.description && (
        <p className="text-xs text-[#8888aa] mb-4 line-clamp-2">{project.description}</p>
      )}

      <div className="mb-4">
        <div className="flex justify-between text-xs text-[#8888aa] mb-1.5">
          <span>{project.completedTasks} of {project.totalTasks} tasks</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-[#1a1a26] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progress}%`, background: project.color || '#6550f7' }} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-xs px-2.5 py-1 rounded-lg font-medium border ${sc.bg} ${sc.text} ${sc.border}`}>
          {project.status?.replace('_', ' ')}
        </span>
        {project.deadline && (
          <span className="text-xs text-[#8888aa] flex items-center gap-1">
            <Clock className="w-3 h-3" /> {format(new Date(project.deadline), 'MMM d')}
          </span>
        )}
      </div>

      <button onClick={() => onClick(project)}
        className="mt-4 w-full btn-secondary text-sm py-2 flex items-center justify-center gap-2">
        <CheckSquare className="w-4 h-4" /> View Tasks
      </button>
    </div>
  )
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [filter, setFilter] = useState('ALL')
  const navigate = useNavigate()

  const load = async () => {
    setLoading(true)
    try {
      const [pr, tr] = await Promise.all([projectsAPI.getMyProjects(), teamsAPI.getMyTeams()])
      setProjects(pr.data.data || [])
      setTeams(tr.data.data || [])
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return
    try { await projectsAPI.delete(id); toast.success('Project deleted'); load() } catch {}
  }

  const filtered = projects.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'ALL' || p.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-[#8888aa]">{projects.length} projects total</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888aa]" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..." className="input-field pl-9 w-56 py-2" />
          </div>
          <button onClick={() => setModal({ mode: 'create' })} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL','ACTIVE','PLANNING','ON_HOLD','COMPLETED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filter === s ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 'text-[#8888aa] hover:text-white'
            }`}>
            {s.replace('_',' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#8888aa]">
          <FolderKanban className="w-16 h-16 mb-4 opacity-20" />
          <h3 className="text-lg font-medium text-white mb-2">No projects found</h3>
          <p className="text-sm mb-6">{search ? 'Try a different search' : 'Create your first project to get started'}</p>
          {!search && <button onClick={() => setModal({ mode: 'create' })} className="btn-primary">Create Project</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(p => (
            <ProjectCard key={p.id} project={p}
              onEdit={project => setModal({ mode: 'edit', project })}
              onDelete={handleDelete}
              onClick={project => navigate(`/projects/${project.id}`)} />
          ))}
        </div>
      )}

      {modal && (
        <ProjectModal
          project={modal.mode === 'edit' ? modal.project : null}
          teams={teams}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load() }} />
      )}
    </div>
  )
}
