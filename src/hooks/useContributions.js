import { useState, useEffect } from 'react'
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

export function useContributions(spotId, user) {
  const [contributions, setContributions] = useState([])

  useEffect(() => {
    if (!spotId || typeof spotId !== 'string') { setContributions([]); return }

    const q = query(collection(db, 'spots', spotId, 'contributions'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snapshot => {
      setContributions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [spotId])

  const addContribution = async (photo) => {
    if (!spotId || typeof spotId !== 'string') return
    await addDoc(collection(db, 'spots', spotId, 'contributions'), {
      photo,
      author: user?.displayName || user?.email?.split('@')[0] || '익명',
      authorId: user?.uid || null,
      createdAt: serverTimestamp(),
    })
  }

  return { contributions, addContribution }
}
