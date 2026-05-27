import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, User, Mail, Lock, ArrowRight, Eye, EyeOff, Briefcase } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', jobTitle: '', role: 'MEMBER' })
  const [showPwd, setShowPwd] = useState(false)
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await register(form)
    if (ok) navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-white">TaskFlow</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-[#8888aa]">Start managing tasks like a pro</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#c0c0d8] mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888aa]" />
                <input type="text" required value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="input-field pl-11" placeholder="John Doe" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#c0c0d8] mb-2">Job Title</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888aa]" />
                <input type="text" value={form.jobTitle}
                  onChange={e => setForm({...form, jobTitle: e.target.value})}
                  className="input-field pl-11" placeholder="Engineer" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#c0c0d8] mb-2">Email address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888aa]" />
              <input type="email" required value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="input-field pl-11" placeholder="you@example.com" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#c0c0d8] mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888aa]" />
              <input type={showPwd ? 'text' : 'password'} required minLength={6} value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                className="input-field pl-11 pr-11" placeholder="Min. 6 characters" />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8888aa] hover:text-white">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#c0c0d8] mb-2">Role</label>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
              className="input-field">
              <option value="MEMBER">Member</option>
              <option value="TEAM_LEAD">Team Lead</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base mt-2">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><span>Create account</span><ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-[#8888aa]">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
