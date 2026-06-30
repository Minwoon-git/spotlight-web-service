import { useState, useEffect } from 'react'
import {
  collection, addDoc, onSnapshot,
  query, orderBy, serverTimestamp, getCountFromServer, doc, getDoc, deleteDoc, updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase'
import { mockSpots } from '../data/mockSpots'

export function useSpots(user) {
  const [firestoreSpots, setFirestoreSpots] = useState([])
  const [totalCount, setTotalCount] = useState(mockSpots.length)
  const [userCount, setUserCount] = useState(0)

  useEffect(() => {
    getCountFromServer(collection(db, 'spots')).then(snap => {
      setTotalCount(mockSpots.length + snap.data().count)
    })
    getDoc(doc(db, 'stats', 'global')).then(snap => {
      if (snap.exists()) setUserCount(snap.data().userCount ?? 0)
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

  const deleteSpot = async (spotId) => {
    if (typeof spotId !== 'string') return
    await deleteDoc(doc(db, 'spots', spotId))
  }

  const updateSpot = async (spotId, data) => {
    if (typeof spotId !== 'string') return
    await updateDoc(doc(db, 'spots', spotId), {
      name: data.name,
      address: data.address,
      lat: data.lat,
      lng: data.lng,
      tags: data.tags,
      photos: data.photos,
      description: data.description,
      bestTime: data.bestTime,
    })
  }

  const mySpots = user ? spots.filter(s => s.authorId === user.uid) : []

  return { spots, mySpots, totalCount, userCount, addSpot, updateSpot, deleteSpot }
}
