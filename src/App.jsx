import { useState } from 'react'
import { useSpots } from './hooks/useSpots'
import { useSavedSpots } from './hooks/useSavedSpots'
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
  const { spots, mySpots, addSpot, addContribution, getContributions } = useSpots(user)
  const { savedSpots, handleSaveToggle } = useSavedSpots(user)
  const [view, setView] = useState('home')
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)

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
          user={user}
          onAuthOpen={() => setAuthOpen(true)}
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
          mySpots={mySpots}
          onSelectSpot={setSelectedSpot}
          onAuthOpen={() => setAuthOpen(true)}
          onNavigate={setView}
        />
      )}

      {view === 'register' && (
        user
          ? <RegisterView addSpot={addSpot} onNavigate={setView} />
          : <div className="auth-required">
              <h2>로그인이 필요해요</h2>
              <p>스팟을 등록하려면 로그인하세요.</p>
              <button className="btn-primary-center" onClick={() => setAuthOpen(true)}>로그인 / 회원가입</button>
            </div>
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
