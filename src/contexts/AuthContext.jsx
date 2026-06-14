import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u ?? null))
    return unsub
  }, [])

  const loginWithGoogle = () => signInWithPopup(auth, googleProvider)

  const loginWithEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

  const signupWithEmail = (email, password, displayName) =>
    createUserWithEmailAndPassword(auth, email, password).then(({ user }) =>
      updateProfile(user, { displayName })
    )

  const logout = () => signOut(auth)

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, loginWithEmail, signupWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
