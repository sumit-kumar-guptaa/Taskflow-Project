const VARIANTS = {
  // Priority
  'priority-high':   'bg-red-500/15 text-red-400 border-red-500/20',
  'priority-medium': 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  'priority-low':    'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  // Status
  'todo':            'bg-slate-500/15 text-slate-400 border-slate-500/20',
  'in-progress':     'bg-blue-500/15 text-blue-400 border-blue-500/20',
  'completed':       'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  // Project status
  'active':          'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  'planning':        'bg-blue-500/15 text-blue-400 border-blue-500/20',
  'on-hold':         'bg-amber-500/15 text-amber-400 border-amber-500/20',
  'cancelled':       'bg-red-500/15 text-red-400 border-red-500/20',
  // Roles
  'admin':           'bg-red-500/15 text-red-400 border-red-500/20',
  'team-lead':       'bg-amber-500/15 text-amber-400 border-amber-500/20',
  'member':          'bg-brand-500/15 text-brand-400 border-brand-500/20',
  // Default
  'default':         'bg-[#2a2a3e] text-[#8888aa] border-[#3a3a5e]',
}

export default function Badge({ variant = 'default', children, className = '' }) {
  const cls = VARIANTS[variant] || VARIANTS.default
  return (
    <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-lg font-medium border ${cls} ${className}`}>
      {children}
    </span>
  )
}
