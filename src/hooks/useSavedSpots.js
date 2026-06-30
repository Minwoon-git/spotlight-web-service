import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, runTransaction } from 'firebase/firestore'
import { db } from '../firebase'

export function useSavedSpots(user) {
  const [savedSpots, setSavedSpots] = useState([])

  useEffect(() => {
    if (!user) { setSavedSpots([]); return }

    const ref = doc(db, 'users', user.uid)
    getDoc(ref).then(snap => {
      if (snap.exists()) setSavedSpots(snap.data().savedSpots ?? [])
      else setSavedSpots([])
    })
  }, [user])

  const handleSaveToggle = async (spotId) => {
    if (!user) return

    const alreadySaved = savedSpots.includes(spotId)
    const next = alreadySaved
      ? savedSpots.filter(id => id !== spotId)
      : [...savedSpots, spotId]

    setSavedSpots(next)
    await setDoc(doc(db, 'users', user.uid), { savedSpots: next }, { merge: true })

    // Firestore 스팟(문자열 id)만 실제 저장 수를 갱신 (mock 스팟은 숫자 id라 제외)
    if (typeof spotId === 'string') {
      const spotRef = doc(db, 'spots', spotId)
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(spotRef)
        const current = snap.data()?.saves ?? 0
        const updated = alreadySaved ? Math.max(0, current - 1) : current + 1
        tx.update(spotRef, { saves: updated })
      })
    }
  }

  return { savedSpots, handleSaveToggle }
}
