import { useState, useEffect } from 'react'
import {
  collection, addDoc, onSnapshot,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { mockSpots } from '../data/mockSpots'

export function useSpots(user) {
  const [userSpots, setUserSpots] = useState([])
  const [contributions, setContributions] = useState({})

  useEffect(() => {
    const q = query(collection(db, 'spots'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setUserSpots(data)
    })
    return unsub
  }, [])

  const spots = [
    ...mockSpots,
    ...userSpots.filter(s => !mockSpots.some(m => m.id === s.id)),
  ]

  const addSpot = async (data) => {
    const newSpot = {
      name: data.name,
      address: data.address,
      lat: data.lat,
      lng: data.lng,
      tags: data.tags,
      photos: data.photos,
      description: data.description,
      bestTime: data.bestTime,
      likes: 0,
      saves: 0,
      author: user?.displayName || user?.email?.split('@')[0] || '익명',
      authorId: user?.uid || null,
      createdAt: serverTimestamp(),
      isUserAdded: true,
    }
    const docRef = await addDoc(collection(db, 'spots'), newSpot)
    return { id: docRef.id, ...newSpot }
  }

  const addContribution = (spotId, photo) => {
    const entry = {
      id: Date.now(),
      photo,
      author: user?.displayName || '익명',
      createdAt: new Date().toISOString().split('T')[0],
    }
    setContributions(prev => ({
      ...prev,
      [spotId]: [...(prev[spotId] || []), entry],
    }))
  }

  const getContributions = (spotId) => contributions[spotId] || []

  return { spots, addSpot, addContribution, getContributions }
}
