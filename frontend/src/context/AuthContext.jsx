import React, { createContext, useState, useContext, useEffect } from 'react'
import { login as loginService, register as registerService } from '../services/auth'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    const response = await loginService(credentials)
    localStorage.setItem('token', response.accessToken)
    localStorage.setItem('user', JSON.stringify(response.user))
    setUser(response.user)
    return response
  }

  const register = async (userData) => {
    const response = await registerService(userData)
    localStorage.setItem('token', response.accessToken)
    localStorage.setItem('user', JSON.stringify(response.user))
    setUser(response.user)
    return response
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
