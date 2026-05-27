import { useState, useEffect } from 'react'
import { dashboardAPI, projectsAPI, tasksAPI } from '../services/api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
  RadialBarChart, RadialBar
} from 'recharts'
import { TrendingUp, Target, Award, Zap } from 'lucide-react'

const COLORS = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#10b981' }
const STATUS_COLORS = { TODO: '#64748b', IN_PROGRESS: '#3b82f6', COMPLETED: '#10b981' }

const TOOLTIP_STYLE = {
  contentStyle: { background: '#12121a', border: '1px solid #2a2a3e', borderRadius: '12px', color: '#e8e8f0' },
  cursor: { fill: 'rgba(101,80,247,0.05)' }
}

const MOCK_WEEKLY = [
  { week: 'W1', created: 12, completed: 8, inProgress: 4 },
  { week: 'W2', created: 18, completed: 15, inProgress: 6 },
  { week: 'W3', created: 9, completed: 12, inProgress: 3 },
  { week: 'W4', created: 22, completed: 19, inProgress: 8 },
  { week: 'W5', created: 15, completed: 13, inProgress: 5 },
  { week: 'W6', created: 28, completed: 24, inProgress: 10 },
]

export default function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([dashboardAPI.get(), projectsAPI.getMyProjects()])
      .then(([dr, pr]) => {
        setData(dr.data.data)
        setProjects(pr.data.data || [])
      }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>

  const priorityData = data?.tasksByPriority ? Object.entries(data.tasksByPriority).map(([k, v]) => ({ name: k, value: Number(v), color: COLORS[k] })) : []
  const statusData = [
    { name: 'Todo', value: Number(data?.todoTasks || 0), color: STATUS_COLORS.TODO },
    { name: 'In Progress', value: Number(data?.inProgressTasks || 0), color: STATUS_COLORS.IN_PROGRESS },
    { name: 'Completed', value: Number(data?.completedTasks || 0), color: STATUS_COLORS.COMPLETED },
  ]
  const completionRate = data?.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0

  const projectHealthData = projects.slice(0, 6).map(p => ({
    name: p.title.length > 15 ? p.title.slice(0, 15) + '...' : p.title,
    progress: p.totalTasks > 0 ? Math.round((p.completedTasks / p.totalTasks) * 100) : 0,
    tasks: p.totalTasks,
  }))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Target, label: 'Completion Rate', value: `${completionRate}%`, color: '#10b981', sub: 'of all tasks done' },
          { icon: TrendingUp, label: 'Active Projects', value: data?.activeProjects || 0, color: '#6550f7', sub: 'currently running' },
          { icon: Zap, label: 'In Progress', value: data?.inProgressTasks || 0, color: '#3b82f6', sub: 'tasks being worked on' },
          { icon: Award, label: 'Completed', value: data?.completedTasks || 0, color: '#f59e0b', sub: 'tasks finished' },
        ].map((kpi, i) => (
          <div key={i} className="glass-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${kpi.color}20`, border: `1px solid ${kpi.color}30` }}>
                <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
              </div>
              <span className="text-sm text-[#8888aa]">{kpi.label}</span>
            </div>
            <div className="text-3xl font-display font-bold text-white mb-1">{kpi.value}</div>
            <div className="text-xs text-[#5a5a7a]">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Weekly Trend */}
      <div className="glass-card">
        <h3 className="font-display font-bold text-white mb-6">Weekly Task Trend</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={MOCK_WEEKLY}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a26" />
            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#8888aa', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8888aa', fontSize: 12 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ color: '#8888aa', fontSize: 12 }} />
            <Line type="monotone" dataKey="created" stroke="#6550f7" strokeWidth={2.5} dot={{ fill: '#6550f7', strokeWidth: 0, r: 4 }} />
            <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }} />
            <Line type="monotone" dataKey="inProgress" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', strokeWidth: 0, r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <div className="glass-card">
          <h3 className="font-display font-bold text-white mb-4">Task Status</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} cursor={false} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {statusData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} /><span className="text-[#8888aa]">{d.name}</span></span>
                <span className="text-white font-medium">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="glass-card">
          <h3 className="font-display font-bold text-white mb-4">Priority Breakdown</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={priorityData} barSize={40}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8888aa', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8888aa', fontSize: 12 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {priorityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Project Health */}
        <div className="glass-card">
          <h3 className="font-display font-bold text-white mb-4">Project Health</h3>
          <div className="space-y-3">
            {projectHealthData.length > 0 ? projectHealthData.map((p, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-[#c0c0d8] truncate">{p.name}</span>
                  <span className="text-[#8888aa] text-xs ml-2">{p.progress}%</span>
                </div>
                <div className="h-1.5 bg-[#1a1a26] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${p.progress}%`, background: `hsl(${p.progress * 1.2},70%,50%)` }} />
                </div>
              </div>
            )) : (
              <p className="text-[#8888aa] text-sm text-center py-8">No projects to show</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
