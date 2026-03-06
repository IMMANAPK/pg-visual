import { createContext, useContext, useState, useEffect } from 'react'
import API_URL from '../config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('pgvisual-token'))
  const [loading, setLoading] = useState(true)

  // Check token and load user on mount
  useEffect(() => {
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        // Token invalid
        logout()
      }
    } catch (err) {
      console.error('Failed to fetch user:', err)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Login failed')
    }

    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('pgvisual-token', data.token)

    return data
  }

  const signup = async (email, password, name) => {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Signup failed')
    }

    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('pgvisual-token', data.token)

    return data
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('pgvisual-token')
  }

  const updateSettings = async (settings) => {
    const response = await fetch(`${API_URL}/api/auth/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(settings)
    })

    if (response.ok) {
      setUser(prev => ({
        ...prev,
        settings: { ...prev.settings, ...settings }
      }))
    }
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateSettings,
    refreshUser: fetchUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export default AuthContext
