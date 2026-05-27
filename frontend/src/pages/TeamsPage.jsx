import { useState, useEffect } from 'react'
import { Users, Plus, Search, UserPlus, UserMinus, Trash2, Crown, Settings } from 'lucide-react'
import { teamsAPI, usersAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

function TeamModal({ team, onClose, onSave }) {
  const [form, setForm] = useState(team || { teamName: '', description: '' })
  const [saving, setSaving] = useState(false)
  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (team) await teamsAPI.update(team.id, form)
      else await teamsAPI.create(form)
      toast.success(team ? 'Team updated!' : 'Team created!')
      onSave()
    } catch {} finally { setSaving(false) }
  }
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl w-full max-w-md border border-[#2a2a3e] animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-[#1a1a26]">
          <h2 className="font-display font-bold text-white text-lg">{team ? 'Edit Team' : 'New Team'}</h2>
          <button onClick={onClose} className="text-[#8888aa] hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#c0c0d8] mb-2">Team Name *</label>
            <input required value={form.teamName} onChange={e => setForm({...form, teamName: e.target.value})}
              className="input-field" placeholder="e.g. Frontend Team" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#c0c0d8] mb-2">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="input-field resize-none" rows={3} placeholder="What does this team work on?" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : team ? 'Update' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AddMemberModal({ team, onClose, onSave }) {
  const [allUsers, setAllUsers] = useState([])
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState(null)
  const memberIds = new Set(team.members?.map(m => m.id))

  useEffect(() => { usersAPI.getAll().then(r => setAllUsers(r.data.data || [])) }, [])

  const filtered = allUsers.filter(u => 
    !memberIds.has(u.id) && (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  )

  const addMember = async (userId) => {
    setAdding(userId)
    try { await teamsAPI.addMember(team.id, userId); toast.success('Member added!'); onSave() }
    catch {} finally { setAdding(null) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl w-full max-w-md border border-[#2a2a3e] animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-[#1a1a26]">
          <h2 className="font-display font-bold text-white text-lg">Add Members</h2>
          <button onClick={onClose} className="text-[#8888aa] hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <div className="p-4">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users..." className="input-field mb-4" />
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-center text-[#8888aa] text-sm py-8">
                {search ? 'No users found' : 'All users are already members'}
              </p>
            ) : filtered.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#1a1a26] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-300 font-bold">
                    {u.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{u.name}</p>
                    <p className="text-xs text-[#8888aa]">{u.jobTitle || u.role}</p>
                  </div>
                </div>
                <button onClick={() => addMember(u.id)} disabled={adding === u.id}
                  className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                  <UserPlus className="w-3 h-3" /> {adding === u.id ? '...' : 'Add'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TeamCard({ team, currentUserId, onEdit, onDelete, onAddMember, onRemoveMember }) {
  const [expanded, setExpanded] = useState(false)
  const isCreator = team.createdBy?.id === currentUserId

  return (
    <div className="glass rounded-2xl overflow-hidden hover:border-brand-500/20 transition-all">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">{team.teamName}</h3>
              <p className="text-xs text-[#8888aa]">{team.members?.length || 0} members · {team.projectCount} projects</p>
            </div>
          </div>
          {isCreator && (
            <div className="flex items-center gap-2">
              <button onClick={() => onAddMember(team)} className="p-2 rounded-lg text-[#8888aa] hover:text-brand-400 hover:bg-brand-500/10 transition-all" title="Add member">
                <UserPlus className="w-4 h-4" />
              </button>
              <button onClick={() => onEdit(team)} className="p-2 rounded-lg text-[#8888aa] hover:text-white hover:bg-[#1a1a26] transition-all" title="Edit">
                <Settings className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(team.id)} className="p-2 rounded-lg text-[#8888aa] hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {team.description && <p className="text-sm text-[#8888aa] mb-4">{team.description}</p>}

        {/* Member avatars */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {(team.members || []).slice(0, 5).map(m => (
              <div key={m.id} className="w-8 h-8 rounded-full border-2 border-[#0e0e16] bg-brand-500/20 border-brand-500/40 flex items-center justify-center text-brand-300 text-xs font-bold"
                title={m.name}>
                {m.name?.charAt(0)}
              </div>
            ))}
            {(team.members?.length || 0) > 5 && (
              <div className="w-8 h-8 rounded-full border-2 border-[#0e0e16] bg-[#2a2a3e] flex items-center justify-center text-[#8888aa] text-xs">
                +{team.members.length - 5}
              </div>
            )}
          </div>
          <button onClick={() => setExpanded(!expanded)} className="text-xs text-brand-400 hover:text-brand-300 ml-2 transition-colors">
            {expanded ? 'Hide' : 'View all'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#1a1a26] p-4 space-y-2">
          {(team.members || []).map(m => (
            <div key={m.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-300 text-sm font-bold">
                  {m.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm text-white flex items-center gap-2">
                    {m.name}
                    {m.id === team.createdBy?.id && <Crown className="w-3 h-3 text-amber-400" title="Team creator" />}
                  </p>
                  <p className="text-xs text-[#8888aa]">{m.jobTitle || m.role}</p>
                </div>
              </div>
              {isCreator && m.id !== team.createdBy?.id && (
                <button onClick={() => onRemoveMember(team.id, m.id)} 
                  className="p-1.5 rounded-lg text-[#8888aa] hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <UserMinus className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TeamsPage() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const { user } = useAuth()

  const load = async () => {
    setLoading(true)
    try { const { data } = await teamsAPI.getMyTeams(); setTeams(data.data || []) }
    catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this team? This will also delete all projects.')) return
    try { await teamsAPI.delete(id); toast.success('Team deleted'); load() } catch {}
  }

  const handleRemoveMember = async (teamId, userId) => {
    try { await teamsAPI.removeMember(teamId, userId); toast.success('Member removed'); load() } catch {}
  }

  const filtered = teams.filter(t => t.teamName.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888aa]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search teams..." className="input-field pl-9 w-56 py-2" />
        </div>
        <button onClick={() => setModal({ mode: 'create' })} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Team
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#8888aa]">
          <Users className="w-16 h-16 mb-4 opacity-20" />
          <h3 className="text-lg font-medium text-white mb-2">No teams yet</h3>
          <p className="text-sm mb-6">Create a team and invite your colleagues</p>
          <button onClick={() => setModal({ mode: 'create' })} className="btn-primary">Create Team</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(team => (
            <TeamCard key={team.id} team={team} currentUserId={user?.id}
              onEdit={t => setModal({ mode: 'edit', team: t })}
              onDelete={handleDelete}
              onAddMember={t => setModal({ mode: 'addMember', team: t })}
              onRemoveMember={handleRemoveMember} />
          ))}
        </div>
      )}

      {modal?.mode !== 'addMember' && modal && (
        <TeamModal team={modal.mode === 'edit' ? modal.team : null}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load() }} />
      )}
      {modal?.mode === 'addMember' && (
        <AddMemberModal team={modal.team}
          onClose={() => setModal(null)}
          onSave={() => { load() }} />
      )}
    </div>
  )
}
