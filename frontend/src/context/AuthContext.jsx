import { createContext, useContext, useState, useEffect } from 'react'
import { authService, profileService } from '../services/api.js'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('aurum_token')
    if (token) fetchProfile()
    else setLoading(false)
  }, [])

  const fetchProfile = async () => {
    try {
      const { data } = await profileService.getMe()
      setProfile(data.data)
    } catch { logout() }
    finally  { setLoading(false) }
  }

  const login = async (credentials) => {
    const { data } = await authService.login(credentials)
    const token = data.data.session.access_token
    localStorage.setItem('aurum_token', token)
    setUser(data.data.user)
    await fetchProfile()
    return data
  }

  const register = async (credentials) => {
    const { data } = await authService.register(credentials)
    const token = data.data.session?.access_token
    if (token) {
      localStorage.setItem('aurum_token', token)
      setUser(data.data.user)
      await fetchProfile()
    }
    return data
  }

  const logout = () => {
    localStorage.removeItem('aurum_token')
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
