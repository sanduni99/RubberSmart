// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState } from "react"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {


  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user")
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })


  const login = (token, userData) => {
    localStorage.setItem("token", token)

    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)
    } else {
      setUser(null)
    }
  }

 
  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")  
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
