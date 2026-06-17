import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
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

    const next = savedSpots.includes(spotId)
      ? savedSpots.filter(id => id !== spotId)
      : [...savedSpots, spotId]

    setSavedSpots(next)
    await setDoc(doc(db, 'users', user.uid), { savedSpots: next }, { merge: true })
  }

  return { savedSpots, handleSaveToggle }
}
