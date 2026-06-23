import { useState, useEffect } from 'react'
import {
  collection, addDoc, onSnapshot,
  query, orderBy, serverTimestamp, getCountFromServer,
} from 'firebase/firestore'
import { db } from '../firebase'
import { mockSpots } from '../data/mockSpots'

export function useSpots(user) {
  const [firestoreSpots, setFirestoreSpots] = useState([])
  const [totalCount, setTotalCount] = useState(mockSpots.length)
  const [userCount, setUserCount] = useState(0)
  const [contributions, setContributions] = useState({})

  useEffect(() => {
    getCountFromServer(collection(db, 'spots')).then(snap => {
      setTotalCount(mockSpots.length + snap.data().count)
    })
    getCountFromServer(collection(db, 'users')).then(snap => {
      setUserCount(snap.data().count)
    })
  }, [])

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'spots'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setFirestoreSpots(data)
    })
    return unsub
  }, [user])

  const spots = user
    ? [...mockSpots, ...firestoreSpots]
    : mockSpots

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

  return { spots, mySpots, totalCount, userCount, addSpot, addContribution, getContributions }
}
