import { useState } from 'react'
import { mockSpots } from '../data/mockSpots'

const STORAGE_KEY = 'spotlight_user_spots'

function loadUserSpots() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveUserSpots(userSpots) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userSpots))
  } catch {
    // localStorage 용량 초과 등 무시
  }
}

export function useSpots() {
  const [userSpots, setUserSpots] = useState(loadUserSpots)

  const spots = [...mockSpots, ...userSpots]

  const addSpot = (data) => {
    const newSpot = {
      id: Date.now(),
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
      author: '나',
      createdAt: new Date().toISOString().split('T')[0],
      isUserAdded: true,
    }
    setUserSpots(prev => {
      const updated = [...prev, newSpot]
      saveUserSpots(updated)
      return updated
    })
    return newSpot
  }

  return { spots, addSpot }
}
