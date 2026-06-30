import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp, increment } from 'firebase/firestore'
import { auth, googleProvider, db } from '../firebase'

const AuthContext = createContext(null)

// 이메일 인증 링크를 Firebase 기본 페이지 대신 우리 앱(/auth/action)에서 처리하도록 지정
const verificationActionCodeSettings = {
  url: `${window.location.origin}/auth/action`,
  handleCodeInApp: true,
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      setUser(u ?? null)
      if (!u) return

      try {
        const userRef = doc(db, 'users', u.uid)
        const snapshot = await getDoc(userRef)
        const isNewUser = !snapshot.exists()
        const needsStatCount = isNewUser || !snapshot.data()?.countedInStats

        // Firebase Auth의 photoURL은 2048자 제한이 있어 업로드한 사진(data URL)을
        // 담을 수 없으므로, Firestore 전용 필드(customPhotoURL)에 저장해 우선 표시한다.
        const customPhotoURL = snapshot.data()?.customPhotoURL
        if (customPhotoURL) {
          setUser(prev => prev ? { ...prev, photoURL: customPhotoURL } : prev)
        }

        await setDoc(userRef, {
          displayName: u.displayName ?? null,
          email: u.email ?? null,
          lastLoginAt: serverTimestamp(),
          loginCount: increment(1),
          countedInStats: true,
          ...(isNewUser ? { createdAt: serverTimestamp() } : {}),
        }, { merge: true })

        if (needsStatCount) {
          await setDoc(doc(db, 'stats', 'global'), { userCount: increment(1) }, { merge: true })
        }
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
    createUserWithEmailAndPassword(auth, email, password).then(async ({ user }) => {
      await updateProfile(user, { displayName })
      await setDoc(doc(db, 'users', user.uid), {
        termsAgreedAt: serverTimestamp(),
        privacyAgreedAt: serverTimestamp(),
      }, { merge: true })
      await sendEmailVerification(user, verificationActionCodeSettings)
    })

  const resendVerification = () => {
    if (!auth.currentUser) return
    return sendEmailVerification(auth.currentUser, verificationActionCodeSettings)
  }

  const refreshUser = async () => {
    if (!auth.currentUser) return
    await auth.currentUser.reload()
    // 업로드한 사진(data URL)은 Auth 객체에 없으므로 reload 후에도 유지한다.
    setUser(prev => ({
      ...auth.currentUser,
      photoURL: prev?.photoURL?.startsWith('data:') ? prev.photoURL : auth.currentUser.photoURL,
    }))
  }

  const logout = () => signOut(auth)

  const updateNickname = async (nickname) => {
    if (!auth.currentUser) return
    const name = nickname.trim()
    if (!name) return

    await updateProfile(auth.currentUser, { displayName: name })
    await setDoc(doc(db, 'users', auth.currentUser.uid), { displayName: name }, { merge: true })
    setUser(u => ({ ...u, displayName: name }))
  }

  const updatePhoto = async (photoDataUrl) => {
    if (!auth.currentUser) return
    // Auth photoURL은 2048자 제한이 있어 data URL을 담을 수 없으므로 Firestore에만 저장한다.
    await setDoc(doc(db, 'users', auth.currentUser.uid), { customPhotoURL: photoDataUrl }, { merge: true })
    setUser(u => ({ ...u, photoURL: photoDataUrl }))
  }

  return (
    <AuthContext.Provider value={{
      user, loginWithGoogle, loginWithEmail, signupWithEmail, logout, updateNickname, updatePhoto,
      resendVerification, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
