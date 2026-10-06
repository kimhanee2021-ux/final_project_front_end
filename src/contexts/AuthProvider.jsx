import { useState } from 'react'
import { AuthContext } from './AuthContext'
import { clearDemoSession, readDemoSession, saveDemoSession } from '../features/auth/authSession'

function browserStores() {
  return ['sessionStorage', 'localStorage'].map(name => {
    try { return window[name] } catch { return null }
  })
}

export default function AuthProvider({ children }) {
  const [isDemoSignedIn, setIsDemoSignedIn] = useState(() => readDemoSession(browserStores()))
  function startDemo(remember = false) {
    saveDemoSession(browserStores(), remember)
    setIsDemoSignedIn(true)
  }
  function signOut() {
    clearDemoSession(browserStores())
    setIsDemoSignedIn(false)
  }
  return <AuthContext.Provider value={{ isDemoSignedIn, startDemo, signOut }}>{children}</AuthContext.Provider>
}
