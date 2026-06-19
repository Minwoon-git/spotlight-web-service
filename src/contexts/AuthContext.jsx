import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp, increment } from 'firebase/firestore'
import { auth, googleProvider, db } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      setUser(u ?? null)
      if (!u) return

      try {
        const userRef = doc(db, 'users', u.uid)
        const snapshot = await getDoc(userRef)

        await setDoc(userRef, {
          displayName: u.displayName ?? null,
          email: u.email ?? null,
          lastLoginAt: serverTimestamp(),
          loginCount: increment(1),
          ...(snapshot.exists() ? {} : { createdAt: serverTimestamp() }),
        }, { merge: true })
      } catch (e) {
        console.error('[AuthContext] 접속 기록 저장 실패:', e)
      }
    })
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
