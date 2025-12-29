import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api'

const AuthContext = createContext()

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })


  const login = async (email, password) => {
    try {
   
      const res = await api.post('/login', { email, password })

     
      const { user, token } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

  
      setUser(user)
      return true
    } catch (error) {
      console.error("Login hatası:", error)
      throw error
    }
  }


  const register = async (name, email, password) => {
    try {
      const res = await api.post('/register', { name, email, password })
      const { user, token } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      return true
    } catch (error) {
      console.error("Register hatası:", error)
      throw error
    }
  }


  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  
  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData }
    localStorage.setItem('user', JSON.stringify(newUser))
    setUser(newUser)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)