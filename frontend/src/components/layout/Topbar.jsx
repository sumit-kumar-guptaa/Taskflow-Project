import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, X } from 'lucide-react'
import { tasksAPI, notificationsAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

export default function Topbar({ title }) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const searchRef = useRef(null)
  const notificationsRef = useRef(null)
  const seenRef = useRef(new Set())
  const timerRef = useRef(null)
  const pollRef = useRef(null)

  useEffect(() => {
    if (!search.trim()) { setResults([]); return }
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const { data } = await tasksAPI.search(search)
        setResults(data.data?.slice(0, 6) || [])
      } catch {}
      setSearching(false)
    }, 400)
  }, [search])

  useEffect(() => {
    const handler = (e) => { if (!searchRef.current?.contains(e.target)) setResults([]) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const syncNotifications = useCallback(async () => {
    try {
      const unreadRes = await notificationsAPI.getUnread()
      const unread = unreadRes.data.data || []
      unread.forEach((n) => {
        if (!seenRef.current.has(n.id)) {
          seenRef.current.add(n.id)
          toast.success(n.message)
        }
      })
      await Promise.all(unread.map((n) => notificationsAPI.markRead(n.id).catch(() => {})))
      const recentRes = await notificationsAPI.getRecent()
      setNotifications(recentRes.data.data || [])
    } catch {}
  }, [])

  useEffect(() => {
    if (!user || !localStorage.getItem('token')) return
    syncNotifications()
    pollRef.current = setInterval(syncNotifications, 15000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [user, syncNotifications])

  useEffect(() => {
    const handler = (e) => {
      if (!notificationsRef.current?.contains(e.target)) setShowNotifications(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const getPriorityColor = (p) => ({ HIGH: 'text-red-400', MEDIUM: 'text-amber-400', LOW: 'text-emerald-400' }[p] || '')
  const unreadCount = notifications.filter(n => !n.read).length

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch {}
  }

  const toggleNotifications = () => {
    const next = !showNotifications
    setShowNotifications(next)
    if (next) syncNotifications()
  }

  return (
    <header className="h-16 border-b border-[#1a1a26] bg-[#0e0e16] flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="font-display text-xl font-bold text-white">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div ref={searchRef} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888aa]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="bg-[#1a1a26] border border-[#2a2a3e] rounded-xl pl-9 pr-9 py-2 text-sm text-[#e8e8f0] placeholder-[#8888aa] focus:outline-none focus:border-brand-500 w-56 transition-all focus:w-72"
            />
            {search && (
              <button onClick={() => { setSearch(''); setResults([]) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8888aa] hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {/* Results dropdown */}
          {(results.length > 0 || searching) && (
            <div className="absolute top-full mt-2 right-0 w-80 glass rounded-xl border border-[#2a2a3e] overflow-hidden z-50 shadow-2xl">
              {searching ? (
                <div className="p-4 text-center text-sm text-[#8888aa]">Searching...</div>
              ) : results.map(t => (
                <button key={t.id}
                  onClick={() => { navigate(`/tasks?id=${t.id}`); setSearch(''); setResults([]) }}
                  className="w-full px-4 py-3 text-left hover:bg-[#1a1a26] transition-colors border-b border-[#1a1a26] last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white font-medium truncate">{t.title}</span>
                    <span className={`text-xs ml-2 ${getPriorityColor(t.priority)}`}>{t.priority}</span>
                  </div>
                  <p className="text-xs text-[#8888aa] mt-0.5">{t.projectTitle}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div ref={notificationsRef} className="relative">
          <button
            onClick={toggleNotifications}
            className="relative p-2 rounded-xl text-[#8888aa] hover:text-white hover:bg-[#1a1a26] transition-all"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-brand-500 text-[10px] text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-96 glass rounded-xl border border-[#2a2a3e] overflow-hidden z-50 shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a26]">
                <span className="text-sm font-medium text-white">Notifications</span>
                <button onClick={handleMarkAllRead} className="text-xs text-brand-300 hover:text-brand-200">
                  Mark all read
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-sm text-[#8888aa]">No notifications yet.</div>
                ) : notifications.map(n => (
                  <button
                    key={n.id}
                    onClick={async () => {
                      if (!n.read) {
                        await notificationsAPI.markRead(n.id).catch(() => {})
                        setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item))
                      }
                    }}
                    className={`w-full text-left px-4 py-3 border-b border-[#1a1a26] last:border-0 hover:bg-[#1a1a26] transition-colors ${n.read ? 'opacity-70' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full mt-2 ${n.read ? 'bg-[#3a3a52]' : 'bg-brand-500'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white leading-snug">{n.message}</p>
                        <p className="text-xs text-[#8888aa] mt-1">
                          {n.actorName} · {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        {user && (
          <button onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-300 text-sm font-bold hover:border-brand-500 transition-all">
            {user.name?.charAt(0).toUpperCase()}
          </button>
        )}
      </div>
    </header>
  )
}
