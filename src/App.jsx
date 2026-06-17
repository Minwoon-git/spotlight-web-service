import { useState } from 'react'
import { useSpots } from './hooks/useSpots'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import BottomTabBar from './components/BottomTabBar'
import HeroSection from './components/HeroSection'
import MapView from './components/MapView'
import MyMapView from './components/MyMapView'
import MyPage from './components/MyPage'
import RegisterView from './components/RegisterView'
import SpotDetailModal from './components/SpotDetailModal'
import AuthModal from './components/AuthModal'
import './App.css'

function AppInner() {
  const { user } = useAuth() ?? {}
  const { spots, addSpot, addContribution, getContributions } = useSpots(user)
  const [view, setView] = useState('home')
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [savedSpots, setSavedSpots] = useState([1, 3, 5])
  const [authOpen, setAuthOpen] = useState(false)

  const handleSaveToggle = (spotId) => {
    setSavedSpots(prev =>
      prev.includes(spotId) ? prev.filter(id => id !== spotId) : [...prev, spotId]
    )
  }

  return (
    <div className="app">
      <Navbar view={view} onNavigate={setView} onAuthOpen={() => setAuthOpen(true)} />
      <BottomTabBar view={view} onNavigate={setView} />

      {view === 'home' && (
        <HeroSection
          spots={spots}
          onExplore={() => setView('explore')}
          onRegister={() => setView('register')}
          onNavigate={setView}
          onAuthOpen={() => setAuthOpen(true)}
        />
      )}

      {view === 'explore' && (
        <MapView
          spots={spots}
          onSelectSpot={setSelectedSpot}
          savedSpots={savedSpots}
          onRegister={() => setView('register')}
        />
      )}

      {view === 'mymap' && (
        <MyMapView
          spots={spots}
          savedSpots={savedSpots}
          onSelectSpot={setSelectedSpot}
          onUnsave={handleSaveToggle}
          onAuthOpen={() => setAuthOpen(true)}
        />
      )}

      {view === 'mypage' && (
        <MyPage
          spots={spots}
          onSelectSpot={setSelectedSpot}
          onAuthOpen={() => setAuthOpen(true)}
          onNavigate={setView}
        />
      )}

      {view === 'register' && (
        <RegisterView addSpot={addSpot} onNavigate={setView} />
      )}

      {selectedSpot && (
        <SpotDetailModal
          spot={selectedSpot}
          isSaved={savedSpots.includes(selectedSpot.id)}
          onSave={() => handleSaveToggle(selectedSpot.id)}
          onClose={() => setSelectedSpot(null)}
          contributions={getContributions(selectedSpot.id)}
          onAddContribution={(photo) => addContribution(selectedSpot.id, photo)}
        />
      )}

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
