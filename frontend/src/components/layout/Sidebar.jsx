import { NavLink, useNavigate } from 'react-router-dom'
import { 
  Zap, LayoutDashboard, FolderKanban, CheckSquare, 
  Users, BarChart3, Settings, LogOut, User, ChevronLeft
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import clsx from 'clsx'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/tasks', icon: CheckSquare, label: 'My Tasks' },
  { to: '/teams', icon: Users, label: 'Teams' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <aside className={clsx(
      'h-screen flex flex-col border-r border-[#1a1a26] bg-[#0e0e16] transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className={clsx('flex items-center p-4 border-b border-[#1a1a26] min-h-[65px]',
        collapsed ? 'justify-center' : 'justify-between')}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold text-white">TaskFlow</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
        )}
        <button onClick={onToggle}
          className={clsx('text-[#8888aa] hover:text-white transition-colors p-1 rounded-lg hover:bg-[#1a1a26]',
            collapsed && 'absolute -right-3 top-5 bg-[#1a1a26] border border-[#2a2a3e] rounded-full p-0.5 z-10')}>
          <ChevronLeft className={clsx('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => clsx(
              'flex items-center rounded-xl transition-all duration-200 font-medium',
              collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3',
              isActive
                ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                : 'text-[#8888aa] hover:text-[#e8e8f0] hover:bg-[#1a1a26]'
            )}
            title={collapsed ? label : undefined}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="p-3 border-t border-[#1a1a26]">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-300 text-sm font-bold flex-shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-medium truncate">{user.name}</p>
              <p className="text-[#8888aa] text-xs truncate">{user.role}</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout}
          className={clsx('w-full flex items-center rounded-xl text-[#8888aa] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200',
            collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3')}>
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  )
}
