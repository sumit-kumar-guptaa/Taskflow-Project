import { useState, useRef } from 'react'
import { User, Mail, Briefcase, Lock, Camera, Save, Shield } from 'lucide-react'
import { usersAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [profile, setProfile] = useState({ name: user?.name || '', bio: user?.bio || '', jobTitle: user?.jobTitle || '' })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [changingPwd, setChangingPwd] = useState(false)
  const fileRef = useRef()

  const saveProfile = async (e) => {
    e.preventDefault(); setSaving(true)
    try { await usersAPI.updateProfile(profile); await refreshUser(); toast.success('Profile updated!') }
    catch {} finally { setSaving(false) }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirm) { toast.error('Passwords do not match'); return }
    setChangingPwd(true)
    try { await usersAPI.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }); setPasswords({ currentPassword: '', newPassword: '', confirm: '' }); toast.success('Password changed!') }
    catch {} finally { setChangingPwd(false) }
  }

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    try { await usersAPI.uploadAvatar(file); await refreshUser(); toast.success('Avatar updated!') }
    catch {}
  }

  const ROLE_COLORS = { ADMIN: '#ef4444', TEAM_LEAD: '#f59e0b', MEMBER: '#6550f7' }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Avatar + basic info */}
      <div className="glass-card">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-300 text-2xl font-bold overflow-hidden">
              {user?.profileImage ? <img src={user.profileImage} alt="" className="w-full h-full object-cover" /> : user?.name?.charAt(0).toUpperCase()}
            </div>
            <button onClick={() => fileRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center hover:bg-brand-600 transition-colors">
              <Camera className="w-4 h-4 text-white" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-[#8888aa]">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-3 py-1 rounded-lg font-medium border flex items-center gap-1.5"
                style={{ background: `${ROLE_COLORS[user?.role]}15`, color: ROLE_COLORS[user?.role], borderColor: `${ROLE_COLORS[user?.role]}30` }}>
                <Shield className="w-3 h-3" /> {user?.role}
              </span>
              {user?.jobTitle && <span className="text-xs text-[#8888aa]">{user.jobTitle}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile */}
      <div className="glass-card">
        <h3 className="font-display font-bold text-white mb-5">Edit Profile</h3>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#c0c0d8] mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888aa]" />
              <input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})}
                className="input-field pl-11" placeholder="Your full name" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#c0c0d8] mb-2">Email (read-only)</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888aa]" />
              <input value={user?.email || ''} disabled className="input-field pl-11 opacity-50 cursor-not-allowed" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#c0c0d8] mb-2">Job Title</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888aa]" />
              <input value={profile.jobTitle} onChange={e => setProfile({...profile, jobTitle: e.target.value})}
                className="input-field pl-11" placeholder="e.g. Senior Engineer" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#c0c0d8] mb-2">Bio</label>
            <textarea value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})}
              className="input-field resize-none" rows={3} placeholder="Tell us about yourself..." />
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="glass-card">
        <h3 className="font-display font-bold text-white mb-5">Change Password</h3>
        <form onSubmit={changePassword} className="space-y-4">
          {[
            { label: 'Current Password', key: 'currentPassword', placeholder: '••••••••' },
            { label: 'New Password', key: 'newPassword', placeholder: 'Min. 6 characters' },
            { label: 'Confirm New Password', key: 'confirm', placeholder: 'Repeat new password' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-[#c0c0d8] mb-2">{f.label}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888aa]" />
                <input type="password" value={passwords[f.key]} placeholder={f.placeholder}
                  onChange={e => setPasswords({...passwords, [f.key]: e.target.value})}
                  className="input-field pl-11" />
              </div>
            </div>
          ))}
          <button type="submit" disabled={changingPwd} className="btn-primary flex items-center gap-2">
            <Lock className="w-4 h-4" /> {changingPwd ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
