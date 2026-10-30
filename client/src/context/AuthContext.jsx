import { createContext, useContext, useState, useCallback } from 'react'
import { authApi } from '../api/apiClient'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vortex_user')) } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('vortex_token'))

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password })
    const { token: t, user: u } = res.data
    localStorage.setItem('vortex_token', t)
    localStorage.setItem('vortex_user', JSON.stringify(u))
    setToken(t)
    setUser(u)
    toast.success(`Welcome back, ${u.name}!`)
    return u
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('vortex_token')
    localStorage.removeItem('vortex_user')
    setToken(null)
    setUser(null)
    toast.success('Logged out successfully')
  }, [])

  const hasRole = useCallback((...roles) => {
    return user && roles.includes(user.role)
  }, [user])

  return (
    <AuthContext.Provider value={{ user, token, login, logout, hasRole, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

