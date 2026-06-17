import { useState, useEffect } from 'react'
import {
  collection, addDoc, onSnapshot,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

export function useSpots(user) {
  const [spots, setSpots] = useState([])
  const [contributions, setContributions] = useState({})

  useEffect(() => {
    const q = query(collection(db, 'spots'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setSpots(data)
    })
    return unsub
  }, [])

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

  const mySpots = user ? spots.filter(s => s.authorId === user.uid) : []

  return { spots, mySpots, addSpot, addContribution, getContributions }
}
