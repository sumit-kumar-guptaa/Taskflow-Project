import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await login(form)
    if (ok) navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 border-r border-[#1a1a26] relative overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(ellipse at 30% 50%, rgba(101,80,247,0.12) 0%, transparent 60%)',
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(101,80,247,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(101,80,247,0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
        
        <div className="relative flex items-center gap-2">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold text-white">TaskFlow</span>
        </div>
        
        <div className="relative">
          <h2 className="font-display text-4xl font-bold text-white mb-4 leading-tight">
            Manage tasks.<br />
            <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
              Ship faster.
            </span>
          </h2>
          <p className="text-[#8888aa]">Join 10,000+ teams managing their projects with TaskFlow.</p>
          
          <div className="mt-12 space-y-4">
            {[
              { text: 'Drag-and-drop Kanban boards', done: true },
              { text: 'Real-time team collaboration', done: true },
              { text: 'Advanced analytics & reports', done: true },
              { text: 'Role-based access control', done: true },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-[#8888aa]">
                <div className="w-5 h-5 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center">
                  <span className="text-brand-400 text-xs">✓</span>
                </div>
                {f.text}
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative text-[#8888aa] text-xs">© 2024 TaskFlow</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-[#8888aa]">Sign in to your TaskFlow account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[#c0c0d8]">Password</label>
                <a href="#" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888aa]" />
                <input type={showPwd ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="input-field pl-11 pr-11" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8888aa] hover:text-white">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>Sign in</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-[#8888aa]">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Sign up for free
            </Link>
          </p>

          {/* Demo hint */}
          <div className="mt-6 p-4 rounded-xl border border-[#2a2a3e] bg-[#12121a]">
            <p className="text-xs text-[#8888aa] text-center">
              <span className="text-brand-400 font-medium">Demo:</span> Register a new account to explore all features
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
