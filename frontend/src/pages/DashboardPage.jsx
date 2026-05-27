import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FolderKanban, CheckSquare, Clock, AlertTriangle,
  TrendingUp, Users, ArrowRight, Activity, Layers
} from 'lucide-react'
import { dashboardAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { format, formatDistanceToNow } from 'date-fns'

const PRIORITY_COLORS = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#10b981' }
const STATUS_COLOR = { TODO: '#64748b', IN_PROGRESS: '#3b82f6', COMPLETED: '#10b981' }

const MOCK_CHART = [
  { day: 'Mon', completed: 4, created: 6 },
  { day: 'Tue', completed: 7, created: 5 },
  { day: 'Wed', completed: 3, created: 8 },
  { day: 'Thu', completed: 9, created: 7 },
  { day: 'Fri', completed: 6, created: 4 },
  { day: 'Sat', completed: 5, created: 3 },
  { day: 'Sun', completed: 8, created: 6 },
]

function StatCard({ icon: Icon, label, value, color, change, onClick }) {
  return (
    <div onClick={onClick} className={`stat-card ${onClick ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {change !== undefined && (
          <span className={`text-xs px-2 py-1 rounded-lg font-medium ${change >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div className="text-3xl font-display font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-[#8888aa]">{label}</div>
    </div>
  )
}

function TaskCard({ task, onClick }) {
  const priorityClass = { HIGH: 'badge-priority-high', MEDIUM: 'badge-priority-medium', LOW: 'badge-priority-low' }
  const statusClass = { TODO: 'badge-todo', IN_PROGRESS: 'badge-in-progress', COMPLETED: 'badge-completed' }

  return (
    <div onClick={onClick} className="flex items-center gap-4 p-4 rounded-xl hover:bg-[#1a1a26] transition-all cursor-pointer group border border-transparent hover:border-[#2a2a3e]">
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PRIORITY_COLORS[task.priority] }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#e8e8f0] truncate group-hover:text-white">{task.title}</p>
        <p className="text-xs text-[#8888aa] truncate mt-0.5">{task.projectTitle}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={statusClass[task.status]}>{task.status?.replace('_', ' ')}</span>
        {task.dueDate && (
          <span className="text-xs text-[#8888aa]">{format(new Date(task.dueDate), 'MMM d')}</span>
        )}
      </div>
    </div>
  )
}

function ActivityItem({ log }) {
  const actionColor = {
    CREATED: '#6550f7', UPDATED: '#3b82f6', ASSIGNED: '#10b981',
    COMMENTED: '#f59e0b', DELETED: '#ef4444'
  }
  const color = actionColor[log.action] || '#8888aa'

  return (
    <div className="flex gap-3 py-3 border-b border-[#1a1a26] last:border-0">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
        style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}>
        {log.user?.name?.charAt(0) || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#e8e8f0]">
          <span className="font-medium">{log.user?.name}</span>{' '}
          <span className="text-[#8888aa]">{log.action?.toLowerCase()}</span>{' '}
          {log.taskTitle && <span className="font-medium text-brand-400">{log.taskTitle}</span>}
        </p>
        {log.details && <p className="text-xs text-[#8888aa] truncate mt-0.5">{log.details}</p>}
        <p className="text-xs text-[#5a5a7a] mt-1">
          {log.timestamp ? formatDistanceToNow(new Date(log.timestamp), { addSuffix: true }) : ''}
        </p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    dashboardAPI.get().then(r => setData(r.data.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
    </div>
  )

  const pieData = data?.tasksByPriority ? Object.entries(data.tasksByPriority).map(([k, v]) => ({ name: k, value: Number(v) })) : []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-[#8888aa] mt-1">Here's what's happening with your projects</p>
        </div>
        <button onClick={() => navigate('/projects')}
          className="btn-primary flex items-center gap-2 text-sm">
          <Layers className="w-4 h-4" /> New Project
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FolderKanban} label="Active Projects" value={data?.activeProjects ?? 0} color="#6550f7" change={12} onClick={() => navigate('/projects')} />
        <StatCard icon={CheckSquare} label="Total Tasks" value={data?.totalTasks ?? 0} color="#3b82f6" change={8} />
        <StatCard icon={Activity} label="Completed" value={data?.completedTasks ?? 0} color="#10b981" change={15} />
        <StatCard icon={AlertTriangle} label="Overdue" value={data?.overdueTasks ?? 0} color="#ef4444" change={-5} />
      </div>

      {/* Task Progress */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Todo', value: data?.todoTasks ?? 0, total: data?.totalTasks || 1, color: '#64748b' },
          { label: 'In Progress', value: data?.inProgressTasks ?? 0, total: data?.totalTasks || 1, color: '#3b82f6' },
          { label: 'Completed', value: data?.completedTasks ?? 0, total: data?.totalTasks || 1, color: '#10b981' },
        ].map(s => (
          <div key={s.label} className="glass-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#8888aa]">{s.label}</span>
              <span className="text-white font-bold text-lg">{s.value}</span>
            </div>
            <div className="w-full h-2 bg-[#1a1a26] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (s.value/s.total)*100)}%`, background: s.color }} />
            </div>
            <p className="text-xs text-[#5a5a7a] mt-2">{Math.round((s.value/s.total)*100)}% of total</p>
          </div>
        ))}
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <div className="glass-card lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-white">Task Activity</h3>
            <span className="text-xs text-[#8888aa] bg-[#1a1a26] px-3 py-1 rounded-lg">Last 7 days</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MOCK_CHART}>
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6550f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6550f7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#8888aa', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8888aa', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#12121a', border: '1px solid #2a2a3e', borderRadius: '12px', color: '#e8e8f0' }} />
              <Area type="monotone" dataKey="created" stroke="#6550f7" fill="url(#cg)" strokeWidth={2} />
              <Area type="monotone" dataKey="completed" stroke="#10b981" fill="url(#tg)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 mt-2">
            <div className="flex items-center gap-2 text-xs text-[#8888aa]">
              <div className="w-3 h-3 rounded-full bg-brand-500" /> Created
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8888aa]">
              <div className="w-3 h-3 rounded-full bg-emerald-500" /> Completed
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="glass-card">
          <h3 className="font-display font-bold text-white mb-4">By Priority</h3>
          {pieData.length > 0 && pieData.some(d => d.value > 0) ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={PRIORITY_COLORS[entry.name] || '#8888aa'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#12121a', border: '1px solid #2a2a3e', borderRadius: '12px', color: '#e8e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: PRIORITY_COLORS[d.name] }} />
                      <span className="text-[#8888aa]">{d.name}</span>
                    </div>
                    <span className="text-white font-medium">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-[#8888aa]">
              <CheckSquare className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">No tasks yet</p>
            </div>
          )}
        </div>
      </div>

      {/* My Tasks + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Tasks */}
        <div className="glass-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-white">My Tasks</h3>
            <button onClick={() => navigate('/tasks')} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {data?.myTasks?.length > 0 ? (
            <div className="space-y-1">
              {data.myTasks.map(task => (
                <TaskCard key={task.id} task={task} onClick={() => navigate(`/tasks?id=${task.id}`)} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-[#8888aa]">
              <CheckSquare className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">No tasks assigned to you</p>
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="glass-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-white">Recent Activity</h3>
          </div>
          {data?.recentActivity?.length > 0 ? (
            <div className="overflow-y-auto max-h-80">
              {data.recentActivity.map(log => <ActivityItem key={log.id} log={log} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-[#8888aa]">
              <Activity className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Projects */}
      {data?.recentProjects?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-white">Recent Projects</h3>
            <button onClick={() => navigate('/projects')} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.recentProjects.map(p => {
              const progress = p.totalTasks > 0 ? Math.round((p.completedTasks / p.totalTasks) * 100) : 0
              return (
                <div key={p.id} onClick={() => navigate(`/projects/${p.id}`)}
                  className="glass-card hover:border-brand-500/30 transition-all cursor-pointer group">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: p.color || '#6550f7' }} />
                    <span className="text-xs text-[#8888aa]">{p.teamName}</span>
                  </div>
                  <h4 className="font-medium text-white mb-3 group-hover:text-brand-400 transition-colors truncate">{p.title}</h4>
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-[#8888aa] mb-1.5">
                      <span>{p.completedTasks}/{p.totalTasks} tasks</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-[#1a1a26] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${progress}%`, background: p.color || '#6550f7' }} />
                    </div>
                  </div>
                  {p.deadline && (
                    <p className="text-xs text-[#8888aa] flex items-center gap-1 mt-2">
                      <Clock className="w-3 h-3" /> {format(new Date(p.deadline), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
