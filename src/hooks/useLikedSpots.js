import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore'
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
      await updateDoc(doc(db, 'spots', spotId), {
        likes: increment(alreadyLiked ? -1 : 1),
      })
    }
  }

  return { likedSpots, handleLikeToggle }
}
