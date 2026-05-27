import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  CheckCircle2, Zap, Users, BarChart3, ArrowRight, 
  Star, Shield, Layers, Clock, Target, Sparkles,
  Github, Twitter, ChevronRight, Play
} from 'lucide-react'

const FEATURES = [
  { icon: Layers, title: 'Kanban Boards', desc: 'Visualize your workflow with drag-and-drop task cards across customizable columns.', color: '#6550f7' },
  { icon: Users, title: 'Team Collaboration', desc: 'Invite team members, assign roles, and collaborate in real-time on projects.', color: '#06b6d4' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track team productivity, project progress, and key metrics with beautiful charts.', color: '#10b981' },
  { icon: Clock, title: 'Deadline Tracking', desc: 'Never miss a deadline with smart due date alerts and overdue task highlights.', color: '#f59e0b' },
  { icon: Shield, title: 'Role-Based Access', desc: 'Admin, Team Lead, and Member roles with granular permission controls.', color: '#ec4899' },
  { icon: Target, title: 'Priority Management', desc: 'Mark tasks as High, Medium, or Low priority to focus on what matters most.', color: '#8b5cf6' },
]

const STATS = [
  { value: '10K+', label: 'Teams Using TaskFlow' },
  { value: '99.9%', label: 'Uptime Guarantee' },
  { value: '2M+', label: 'Tasks Completed' },
  { value: '4.9★', label: 'Average Rating' },
]

const TESTIMONIALS = [
  { name: 'Sarah Chen', role: 'Engineering Lead @ Stripe', text: 'TaskFlow transformed how our team operates. The Kanban board and analytics are incredibly powerful.', avatar: 'SC' },
  { name: 'Marcus Williams', role: 'CTO @ TechStartup', text: 'We shipped 40% faster after switching to TaskFlow. The team visibility features are unmatched.', avatar: 'MW' },
  { name: 'Priya Sharma', role: 'Product Manager @ Notion', text: 'Clean UI, powerful features, zero learning curve. TaskFlow is exactly what our team needed.', avatar: 'PS' },
]

function FloatingCard({ style, children }) {
  return (
    <div className="absolute glass rounded-2xl p-4 shadow-2xl animate-float" style={style}>
      {children}
    </div>
  )
}

function Particle({ style }) {
  return (
    <div className="absolute rounded-full opacity-20 animate-float" style={style} />
  )
}

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0)
  const heroRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/8 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-cyan-500/6 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-purple-500/6 rounded-full blur-3xl" />
        {/* Grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(101,80,247,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(101,80,247,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Nav */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold text-white">TaskFlow</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm text-[#8888aa]">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#" className="hover:text-white transition-colors">Docs</a>
        </div>
        
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
          <Link to="/register" className="btn-primary text-sm flex items-center gap-2">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-brand-400 border border-brand-500/30 mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Now with AI-powered task prioritization</span>
            <ChevronRight className="w-4 h-4" />
          </div>

          {/* Headline */}
          <h1 className="font-display text-6xl md:text-8xl font-bold leading-none mb-6">
            <span className="text-white">Ship faster.</span>
            <br />
            <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Work smarter.
            </span>
          </h1>
          
          <p className="text-lg text-[#8888aa] max-w-2xl mx-auto mb-10 leading-relaxed">
            The modern task and team management platform that helps engineering teams 
            move faster, stay aligned, and deliver remarkable products.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/register" className="btn-primary text-base px-8 py-3.5 flex items-center gap-2 text-lg">
              Start for free <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="flex items-center gap-3 text-[#8888aa] hover:text-white transition-colors group">
              <div className="w-12 h-12 rounded-full border border-[#2a2a3e] flex items-center justify-center group-hover:border-brand-500 transition-colors">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
              <span className="font-medium">Watch demo</span>
            </button>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-2 mt-10 text-sm text-[#8888aa]">
            <div className="flex -space-x-2">
              {['A','B','C','D','E'].map((l, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0a0a0f] flex items-center justify-center text-xs font-bold"
                  style={{ background: `hsl(${i*50+200},60%,40%)` }}>
                  {l}
                </div>
              ))}
            </div>
            <span>Join <strong className="text-white">10,000+</strong> teams already using TaskFlow</span>
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="relative mt-20 max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent z-10 pointer-events-none" style={{top: '60%'}} />
          <div className="glass rounded-3xl border border-[#2a2a3e] overflow-hidden shadow-2xl shadow-brand-500/10">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#2a2a3e] bg-[#12121a]">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-amber-500/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
              <div className="flex-1 ml-4 bg-[#0a0a0f] rounded-lg px-4 py-1.5 text-xs text-[#8888aa] text-center font-mono">
                app.taskflow.io/dashboard
              </div>
            </div>
            
            {/* Mock Dashboard */}
            <div className="p-6 bg-[#0e0e16]">
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Tasks', value: '248', color: '#6550f7', change: '+12%' },
                  { label: 'Completed', value: '182', color: '#10b981', change: '+8%' },
                  { label: 'In Progress', value: '41', color: '#3b82f6', change: '+3%' },
                  { label: 'Overdue', value: '7', color: '#ef4444', change: '-2%' },
                ].map((s, i) => (
                  <div key={i} className="glass rounded-xl p-4">
                    <p className="text-xs text-[#8888aa] mb-1">{s.label}</p>
                    <p className="text-2xl font-display font-bold text-white">{s.value}</p>
                    <p className="text-xs mt-1" style={{color: s.color}}>{s.change}</p>
                  </div>
                ))}
              </div>
              
              {/* Kanban preview */}
              <div className="grid grid-cols-3 gap-4">
                {['To Do', 'In Progress', 'Done'].map((col, ci) => (
                  <div key={ci} className="glass rounded-xl p-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-[#8888aa]">{col}</span>
                      <span className="text-xs bg-[#2a2a3e] px-2 py-0.5 rounded-full">{[3,2,4][ci]}</span>
                    </div>
                    {Array.from({length: [2,1,2][ci]}).map((_, i) => (
                      <div key={i} className="bg-[#1a1a26] rounded-lg p-3 mb-2">
                        <div className="h-2 bg-[#2a2a3e] rounded-full mb-2" style={{width: `${60+i*20}%`}} />
                        <div className="h-2 bg-[#2a2a3e] rounded-full w-2/3" />
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-5 h-5 rounded-full bg-brand-500/40" />
                          <div className="h-1.5 bg-[#2a2a3e] rounded-full flex-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 border-y border-[#1a1a26] py-14">
        <div className="max-w-5xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <div className="font-display text-4xl font-bold bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
                {s.value}
              </div>
              <div className="text-[#8888aa] text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-8 py-28">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs text-[#8888aa] border border-[#2a2a3e] mb-5">
            FEATURES
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Everything your team needs
          </h2>
          <p className="text-[#8888aa] max-w-xl mx-auto">
            Powerful tools designed to help teams collaborate, ship faster, and achieve more together.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="glass rounded-2xl p-6 hover:border-brand-500/30 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300"
                style={{ background: `${f.color}20`, border: `1px solid ${f.color}30` }}>
                <f.icon className="w-6 h-6" style={{ color: f.color }} />
              </div>
              <h3 className="font-display font-bold text-white text-lg mb-2">{f.title}</h3>
              <p className="text-[#8888aa] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative z-10 max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="font-display text-4xl font-bold text-white mb-4">Loved by teams worldwide</h2>
          <div className="flex justify-center gap-1">
            {Array.from({length: 5}).map((_,i) => (
              <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
            ))}
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="glass rounded-2xl p-6">
              <div className="flex items-start gap-1 mb-4">
                {Array.from({length: 5}).map((_,i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-[#c0c0d8] text-sm leading-relaxed mb-5">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-500/30 border border-brand-500/40 flex items-center justify-center text-brand-300 text-sm font-bold">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-white text-sm font-medium">{t.name}</div>
                  <div className="text-[#8888aa] text-xs">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 py-20 text-center">
        <div className="glass rounded-3xl p-12 border border-brand-500/20"
          style={{background: 'radial-gradient(ellipse at center, rgba(101,80,247,0.08) 0%, transparent 70%)'}}>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to ship faster?
          </h2>
          <p className="text-[#8888aa] mb-8 max-w-lg mx-auto">
            Join thousands of teams who trust TaskFlow to manage their projects, tasks, and collaboration.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-base px-8 py-3.5 flex items-center gap-2">
              Start for free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-6 py-3.5">
              Sign in
            </Link>
          </div>
          <p className="text-xs text-[#8888aa] mt-4">No credit card required · Free forever plan available</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1a1a26] py-10">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-white">TaskFlow</span>
          </div>
          <div className="text-[#8888aa] text-sm">© 2024 TaskFlow. All rights reserved.</div>
          <div className="flex items-center gap-4 text-[#8888aa]">
            <a href="#" className="hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
            <a href="#" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
    </div>
  )
}
