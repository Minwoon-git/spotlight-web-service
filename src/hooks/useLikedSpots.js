import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, updateDoc, increment, runTransaction } from 'firebase/firestore'
import { db } from '../firebase'

export function useLikedSpots(user) {
  const [likedSpots, setLikedSpots] = useState([])

  useEffect(() => {
    if (!user) { setLikedSpots([]); return }

    const ref = doc(db, 'users', user.uid)
    getDoc(ref).then(snap => {
      if (snap.exists()) setLikedSpots(snap.data().likedSpots ?? [])
      else setLikedSpots([])
    })
  }, [user])

  const handleLikeToggle = async (spot) => {
    if (!user) return

    const spotId = spot.id
    const alreadyLiked = likedSpots.includes(spotId)
    const next = alreadyLiked
      ? likedSpots.filter(id => id !== spotId)
      : [...likedSpots, spotId]

    setLikedSpots(next)
    await setDoc(doc(db, 'users', user.uid), { likedSpots: next }, { merge: true })

    // Firestore 스팟(문자열 id)만 실제 좋아요 수를 갱신 (mock 스팟은 숫자 id라 제외)
    if (typeof spotId === 'string') {
      const spotRef = doc(db, 'spots', spotId)
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(spotRef)
        const current = snap.data()?.likes ?? 0
        const next = alreadyLiked ? Math.max(0, current - 1) : current + 1
        tx.update(spotRef, { likes: next })
      })
    }
  }

  return { likedSpots, handleLikeToggle }
}
