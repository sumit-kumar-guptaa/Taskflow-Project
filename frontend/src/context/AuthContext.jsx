import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI, usersAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)

  const login = async (credentials) => {
    setLoading(true)
    try {
      const { data } = await authAPI.login(credentials)
      const { token, user: userData } = data.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      toast.success(`Welcome back, ${userData.name}!`)
      return true
    } catch (err) {
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (formData) => {
    setLoading(true)
    try {
      const { data } = await authAPI.register(formData)
      const { token, user: userData } = data.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      toast.success(`Welcome to TaskFlow, ${userData.name}!`)
      return true
    } catch (err) {
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    toast.success('Logged out successfully')
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await usersAPI.getMe()
      const userData = data.data
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
    } catch (err) {}
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
