import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client/dist/sockjs'
import {
  MessageCircle, Send, Users, Search, Hash,
  Wifi, WifiOff, Loader, ChevronDown, Circle
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { projectsAPI, chatAPI } from '../services/api'
import { getInitials } from '../utils/helpers'
import { format, isToday, isYesterday } from 'date-fns'
import toast from 'react-hot-toast'

/* ───── inline keyframes (injected once) ───── */
const styleId = 'chat-page-animations'
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
  const style = document.createElement('style')
  style.id = styleId
  style.textContent = `
    @keyframes chat-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-4px); }
    }
    @keyframes chat-pulse-ring {
      0% { transform: scale(0.9); opacity: 1; }
      100% { transform: scale(1.8); opacity: 0; }
    }
    @keyframes chat-slide-up {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes chat-fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    .chat-msg-enter { animation: chat-slide-up .25s ease-out both; }
    .chat-fade { animation: chat-fade-in .3s ease-out both; }
  `
  document.head.appendChild(style)
}

/* ───── helpers ───── */
const AVATAR_COLORS = [
  '#6550f7', '#e64980', '#15b886', '#f59f00',
  '#339af0', '#ff6b6b', '#845ef7', '#20c997',
]
function avatarColor(name) {
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function formatMsgTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return format(d, 'h:mm a')
}

function dateSeparator(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMMM d, yyyy')
}

/* ═══════════════════════════════════════════════
   ChatPage
   ═══════════════════════════════════════════════ */
export default function ChatPage() {
  const { user } = useAuth()
  const token = localStorage.getItem('token')

  /* ── state ── */
  const [projects, setProjects] = useState([])
  const [search, setSearch] = useState('')
  const [activeProject, setActiveProject] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [connected, setConnected] = useState('disconnected') // 'connected' | 'connecting' | 'disconnected'
  const [onlineUsers, setOnlineUsers] = useState([])
  const [typingUser, setTypingUser] = useState(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [showOnline, setShowOnline] = useState(false)

  /* ── refs ── */
  const stompRef = useRef(null)
  const subsRef = useRef([])
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const typingTimeout = useRef(null)
  const lastTypingSent = useRef(0)

  /* ── fetch projects ── */
  useEffect(() => {
    projectsAPI.getMyProjects()
      .then(r => setProjects(r.data?.data || []))
      .catch(() => {})
  }, [])

  const filteredProjects = useMemo(
    () => projects.filter(p => p.title?.toLowerCase().includes(search.toLowerCase())),
    [projects, search]
  )

  /* ── STOMP connection lifecycle ── */
  const connectStomp = useCallback((project) => {
    if (stompRef.current) {
      // leave previous room
      try {
        if (activeProject) {
          stompRef.current.publish({
            destination: `/app/chat.leave/${activeProject.id}`,
            body: '{}'
          })
        }
      } catch {}
      subsRef.current.forEach(s => { try { s.unsubscribe() } catch {} })
      subsRef.current = []
      stompRef.current.deactivate()
      stompRef.current = null
    }

    setMessages([])
    setOnlineUsers([])
    setTypingUser(null)
    setConnected('connecting')

    const client = new Client({
      webSocketFactory: () => {
        const apiUrl = import.meta.env.VITE_API_URL || ''
        // Derive the WS base from the API URL (strip '/api' suffix)
        const wsBase = apiUrl.replace(/\/api\/?$/, '')
        return new SockJS(`${wsBase}/ws`)
      },
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setConnected('connected')

        // subscribe to messages
        const sub1 = client.subscribe(`/topic/chat/${project.id}`, (msg) => {
          const data = JSON.parse(msg.body)
          setMessages(prev => [...prev, data])
        })

        // subscribe to online users
        const sub2 = client.subscribe(`/topic/chat/${project.id}/online`, (msg) => {
          const data = JSON.parse(msg.body)
          setOnlineUsers(Array.isArray(data) ? data : [])
        })

        // subscribe to typing
        const sub3 = client.subscribe(`/topic/chat/${project.id}/typing`, (msg) => {
          const data = JSON.parse(msg.body)
          if (data.email !== user?.email) {
            setTypingUser(data.email)
            clearTimeout(typingTimeout.current)
            typingTimeout.current = setTimeout(() => setTypingUser(null), 3000)
          }
        })

        subsRef.current = [sub1, sub2, sub3]

        // send join
        client.publish({ destination: `/app/chat.join/${project.id}`, body: '{}' })
      },
      onStompError: () => setConnected('disconnected'),
      onWebSocketClose: () => setConnected('disconnected'),
      onDisconnect: () => setConnected('disconnected'),
    })

    client.activate()
    stompRef.current = client
  }, [token, user, activeProject])

  /* ── join a project room ── */
  const joinRoom = useCallback((project) => {
    if (activeProject?.id === project.id) return
    setActiveProject(project)

    // load history
    setLoadingHistory(true)
    chatAPI.getHistory(project.id)
      .then(r => setMessages(r.data?.data || []))
      .catch(() => toast.error('Failed to load chat history'))
      .finally(() => setLoadingHistory(false))

    connectStomp(project)
  }, [activeProject, connectStomp])

  /* ── cleanup on unmount ── */
  useEffect(() => {
    return () => {
      if (stompRef.current) {
        try {
          if (activeProject) {
            stompRef.current.publish({
              destination: `/app/chat.leave/${activeProject.id}`,
              body: '{}'
            })
          }
        } catch {}
        stompRef.current.deactivate()
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── auto-scroll ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUser])

  /* ── send message ── */
  const send = useCallback(() => {
    const text = input.trim()
    if (!text || !stompRef.current || connected !== 'connected' || !activeProject) return
    stompRef.current.publish({
      destination: `/app/chat.send/${activeProject.id}`,
      body: JSON.stringify({ content: text })
    })
    setInput('')
    inputRef.current?.focus()
  }, [input, connected, activeProject])

  /* ── typing indicator (debounced) ── */
  const emitTyping = useCallback(() => {
    if (!stompRef.current || connected !== 'connected' || !activeProject) return
    const now = Date.now()
    if (now - lastTypingSent.current < 2000) return
    lastTypingSent.current = now
    stompRef.current.publish({ destination: `/app/chat.typing/${activeProject.id}`, body: '{}' })
  }, [connected, activeProject])

  /* ── key handler ── */
  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  /* ── connection status badge ── */
  const statusDot = {
    connected:    'bg-emerald-400',
    connecting:   'bg-amber-400',
    disconnected: 'bg-red-400',
  }
  const statusLabel = {
    connected:    'Connected',
    connecting:   'Connecting…',
    disconnected: 'Disconnected',
  }

  /* ── message grouping logic ── */
  function shouldGroup(msgs, idx) {
    if (idx === 0) return false
    const cur = msgs[idx], prev = msgs[idx - 1]
    if (cur.type !== 'CHAT' || prev.type !== 'CHAT') return false
    if (cur.senderId !== prev.senderId) return false
    const dt = new Date(cur.createdAt) - new Date(prev.createdAt)
    return dt < 120_000 // 2 min
  }

  function dayChanged(msgs, idx) {
    if (idx === 0) return true
    const cur = new Date(msgs[idx].createdAt).toDateString()
    const prev = new Date(msgs[idx - 1].createdAt).toDateString()
    return cur !== prev
  }

  /* ═══════════════════════════════════
     RENDER
     ═══════════════════════════════════ */
  return (
    <div className="flex gap-4 h-[calc(100vh-130px)]">

      {/* ──────── LEFT PANEL: project list ──────── */}
      <div className="w-80 flex-shrink-0 glass rounded-2xl flex flex-col overflow-hidden">
        {/* header */}
        <div className="p-4 border-b border-[#2a2a3e]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-brand-400" />
            </div>
            <h2 className="text-base font-semibold text-white">Chatrooms</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888aa]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects…"
              className="input-field pl-9 py-2 text-sm"
            />
          </div>
        </div>

        {/* list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredProjects.length === 0 && (
            <p className="text-center text-[#8888aa] text-sm py-8">No projects found</p>
          )}
          {filteredProjects.map(p => (
            <button
              key={p.id}
              onClick={() => joinRoom(p)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-left group ${
                activeProject?.id === p.id
                  ? 'bg-brand-500/10 border border-brand-500/20'
                  : 'hover:bg-[#1a1a26] border border-transparent'
              }`}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                style={{ backgroundColor: p.color || '#6550f7' }}
              >
                <Hash className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium truncate ${
                  activeProject?.id === p.id ? 'text-brand-400' : 'text-[#e8e8f0] group-hover:text-white'
                }`}>
                  {p.title}
                </p>
                <p className="text-xs text-[#8888aa] truncate">
                  {p.status || 'Active'}
                </p>
              </div>
              {activeProject?.id === p.id && (
                <div className="w-2 h-2 rounded-full bg-brand-400 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ──────── RIGHT PANEL: chat ──────── */}
      <div className="flex-1 glass rounded-2xl flex flex-col overflow-hidden">
        {!activeProject ? (
          /* ── empty state ── */
          <div className="flex-1 flex flex-col items-center justify-center gap-4 chat-fade">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500/20 to-brand-600/10 flex items-center justify-center border border-brand-500/20">
              <MessageCircle className="w-9 h-9 text-brand-400" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-1">Select a chatroom</h3>
              <p className="text-sm text-[#8888aa] max-w-xs">
                Choose a project from the left panel to start a real-time conversation with your team
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ── chat header ── */}
            <div className="px-5 py-3 border-b border-[#2a2a3e] flex items-center justify-between bg-gradient-to-r from-[#12121a] to-[#16162a]">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: activeProject.color || '#6550f7' }}
                >
                  <Hash className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{activeProject.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {/* connection status */}
                    <span className="relative flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${statusDot[connected]}`} />
                      {connected === 'connected' && (
                        <span
                          className={`absolute w-2 h-2 rounded-full ${statusDot[connected]}`}
                          style={{ animation: 'chat-pulse-ring 1.5s ease-out infinite' }}
                        />
                      )}
                    </span>
                    <span className="text-xs text-[#8888aa]">{statusLabel[connected]}</span>
                  </div>
                </div>
              </div>

              {/* online users toggle */}
              <button
                onClick={() => setShowOnline(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#8888aa] hover:text-[#e8e8f0] hover:bg-[#1a1a26] transition-all"
              >
                <Users className="w-3.5 h-3.5" />
                <span>{onlineUsers.length} online</span>
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* ── messages area ── */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-0.5">
                  {loadingHistory && (
                    <div className="flex justify-center py-8">
                      <Loader className="w-6 h-6 text-brand-400 animate-spin" />
                    </div>
                  )}

                  {!loadingHistory && messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 chat-fade">
                      <div className="w-14 h-14 rounded-2xl bg-[#1a1a26] border border-[#2a2a3e] flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-[#8888aa]" />
                      </div>
                      <p className="text-sm text-[#8888aa]">No messages yet — say hello! 👋</p>
                    </div>
                  )}

                  {messages.map((msg, idx) => {
                    const isMe = msg.senderId === user?.id
                    const grouped = shouldGroup(messages, idx)
                    const newDay = dayChanged(messages, idx)
                    const isSystem = msg.type === 'JOIN' || msg.type === 'LEAVE'

                    return (
                      <div key={msg.id || idx}>
                        {/* date separator */}
                        {newDay && (
                          <div className="flex items-center gap-3 py-3 my-2">
                            <div className="flex-1 h-px bg-[#2a2a3e]" />
                            <span className="text-xs text-[#8888aa] font-medium px-2">
                              {dateSeparator(msg.createdAt)}
                            </span>
                            <div className="flex-1 h-px bg-[#2a2a3e]" />
                          </div>
                        )}

                        {/* system message */}
                        {isSystem ? (
                          <div className="flex justify-center py-1.5 chat-msg-enter">
                            <span className="text-xs text-[#8888aa] italic bg-[#1a1a26] px-3 py-1 rounded-full border border-[#2a2a3e]">
                              {msg.senderName} {msg.type === 'JOIN' ? 'joined' : 'left'} the chat
                            </span>
                          </div>
                        ) : (
                          /* regular message */
                          <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${grouped ? 'mt-0.5' : 'mt-3'} chat-msg-enter`}>
                            {/* avatar (other user, not grouped) */}
                            {!isMe && !grouped && (
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mr-2.5 mt-0.5"
                                style={{ backgroundColor: avatarColor(msg.senderName) }}
                              >
                                {getInitials(msg.senderName)}
                              </div>
                            )}
                            {!isMe && grouped && <div className="w-8 mr-2.5 flex-shrink-0" />}

                            <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                              {/* name + time (not grouped) */}
                              {!grouped && (
                                <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                                  <span className="text-xs font-semibold text-[#e8e8f0]">
                                    {isMe ? 'You' : msg.senderName}
                                  </span>
                                  <span className="text-[10px] text-[#8888aa]">
                                    {formatMsgTime(msg.createdAt)}
                                  </span>
                                </div>
                              )}

                              {/* bubble */}
                              <div className={`px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                                isMe
                                  ? 'bg-brand-500/15 border border-brand-500/25 text-[#e8e8f0] rounded-2xl rounded-tr-md'
                                  : 'bg-[#1a1a26] border border-[#2a2a3e] text-[#e8e8f0] rounded-2xl rounded-tl-md'
                              }`}>
                                {msg.content}
                              </div>

                              {/* time for grouped messages */}
                              {grouped && (
                                <span className={`text-[10px] text-[#8888aa] mt-0.5 ${isMe ? 'self-end' : 'self-start'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                  {formatMsgTime(msg.createdAt)}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* typing indicator */}
                  {typingUser && (
                    <div className="flex items-center gap-2 mt-2 chat-msg-enter">
                      <div className="bg-[#1a1a26] border border-[#2a2a3e] rounded-2xl rounded-tl-md px-4 py-2.5 flex items-center gap-1.5">
                        <span className="text-xs text-[#8888aa] mr-1">
                          {typingUser.split('@')[0]}
                        </span>
                        {[0, 1, 2].map(i => (
                          <span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-[#8888aa]"
                            style={{ animation: `chat-bounce 1.2s ease-in-out ${i * 0.15}s infinite` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div ref={bottomRef} />
                </div>

                {/* ── input area ── */}
                <div className="px-4 py-3 border-t border-[#2a2a3e] bg-[#0e0e16]/50">
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={e => { setInput(e.target.value); emitTyping() }}
                      onKeyDown={handleKey}
                      placeholder={connected === 'connected' ? 'Type a message…' : 'Connecting…'}
                      disabled={connected !== 'connected'}
                      rows={1}
                      className="flex-1 input-field py-2.5 px-4 resize-none text-sm min-h-[42px] max-h-[120px] disabled:opacity-40"
                      style={{
                        height: 'auto',
                        overflow: 'auto',
                      }}
                      onInput={e => {
                        e.target.style.height = 'auto'
                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                      }}
                    />
                    <button
                      onClick={send}
                      disabled={!input.trim() || connected !== 'connected'}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-brand-500 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/30 active:scale-95 transition-all duration-200 flex-shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-[#8888aa] mt-1.5 ml-1">
                    Press <kbd className="px-1 py-0.5 rounded bg-[#1a1a26] border border-[#2a2a3e] text-[#e8e8f0] text-[9px]">Enter</kbd> to send · <kbd className="px-1 py-0.5 rounded bg-[#1a1a26] border border-[#2a2a3e] text-[#e8e8f0] text-[9px]">Shift + Enter</kbd> new line
                  </p>
                </div>
              </div>

              {/* ── online panel (slide-out) ── */}
              {showOnline && (
                <div className="w-56 border-l border-[#2a2a3e] bg-[#0e0e16]/60 flex flex-col chat-fade">
                  <div className="px-4 py-3 border-b border-[#2a2a3e]">
                    <h4 className="text-xs font-semibold text-[#8888aa] uppercase tracking-wider">
                      Online — {onlineUsers.length}
                    </h4>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    {onlineUsers.length === 0 && (
                      <p className="text-xs text-[#8888aa] text-center py-4">No one else online</p>
                    )}
                    {onlineUsers.map(email => (
                      <div key={email} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[#1a1a26] transition-colors">
                        <div className="relative">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                            style={{ backgroundColor: avatarColor(email) }}
                          >
                            {email.charAt(0).toUpperCase()}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0e0e16]" />
                        </div>
                        <span className="text-xs text-[#e8e8f0] truncate">
                          {email.split('@')[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
