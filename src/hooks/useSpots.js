import { useState } from 'react'
import { mockSpots } from '../data/mockSpots'

const STORAGE_KEY = 'spotlight_user_spots'
const CONTRIB_KEY = 'spotlight_contributions'

function loadUserSpots() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveUserSpots(userSpots) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(userSpots)) } catch {}
}

function loadContributions() {
  try {
    const raw = localStorage.getItem(CONTRIB_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveContributions(contribs) {
  try { localStorage.setItem(CONTRIB_KEY, JSON.stringify(contribs)) } catch {}
}

export function useSpots() {
  const [userSpots, setUserSpots] = useState(loadUserSpots)
  const [contributions, setContributions] = useState(loadContributions)

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

  const addContribution = (spotId, photo) => {
    const entry = {
      id: Date.now(),
      photo,
      author: '나',
      createdAt: new Date().toISOString().split('T')[0],
    }
    setContributions(prev => {
      const updated = {
        ...prev,
        [spotId]: [...(prev[spotId] || []), entry],
      }
      saveContributions(updated)
      return updated
    })
  }

  const getContributions = (spotId) => contributions[spotId] || []

  return { spots, addSpot, addContribution, getContributions }
}
