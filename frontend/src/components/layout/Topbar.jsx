import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, Sun, Moon, X } from 'lucide-react'
import { tasksAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { formatDistanceToNow } from 'date-fns'

export default function Topbar({ title }) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [dark, setDark] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()
  const searchRef = useRef(null)
  const timerRef = useRef(null)

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

  const getPriorityColor = (p) => ({ HIGH: 'text-red-400', MEDIUM: 'text-amber-400', LOW: 'text-emerald-400' }[p] || '')

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

        {/* Notifications (placeholder) */}
        <button className="relative p-2 rounded-xl text-[#8888aa] hover:text-white hover:bg-[#1a1a26] transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
        </button>

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
