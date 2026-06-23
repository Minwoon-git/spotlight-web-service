import { useState } from 'react'
import { useSpots } from './hooks/useSpots'
import { useSavedSpots } from './hooks/useSavedSpots'
import { useLikedSpots } from './hooks/useLikedSpots'
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
import AuthRequired from './components/AuthRequired'
import './App.css'

function AppInner() {
  const { user } = useAuth() ?? {}
  const { spots, mySpots, totalCount, userCount, addSpot, addContribution, getContributions } = useSpots(user)
  const { savedSpots, handleSaveToggle } = useSavedSpots(user)
  const { likedSpots, handleLikeToggle } = useLikedSpots(user)
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
          totalCount={totalCount}
          userCount={userCount}
          onExplore={() => setView('explore')}
          onRegister={() => setView('register')}
          onNavigate={setView}
          onAuthOpen={() => setAuthOpen(true)}
          onSelectSpot={setSelectedSpot}
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
          mySpots={mySpots}
          savedSpots={savedSpots}
          onSelectSpot={setSelectedSpot}
          onUnsave={handleSaveToggle}
          onAuthOpen={() => setAuthOpen(true)}
          onNavigate={setView}
        />
      )}

      {view === 'mypage' && (
        <MyPage
          onAuthOpen={() => setAuthOpen(true)}
          onNavigate={setView}
        />
      )}

      {view === 'register' && (
        user
          ? <RegisterView addSpot={addSpot} onNavigate={setView} />
          : <AuthRequired
              icon="📍"
              title="로그인이 필요해요"
              description="스팟을 등록하려면 로그인하세요."
              onAuthOpen={() => setAuthOpen(true)}
            />
      )}

      {selectedSpot && (
        <SpotDetailModal
          key={selectedSpot.id}
          spot={selectedSpot}
          isSaved={savedSpots.includes(selectedSpot.id)}
          onSave={() => handleSaveToggle(selectedSpot.id)}
          isLiked={likedSpots.includes(selectedSpot.id)}
          onLike={() => handleLikeToggle(selectedSpot)}
          onClose={() => setSelectedSpot(null)}
          contributions={getContributions(selectedSpot.id)}
          onAddContribution={(photo) => addContribution(selectedSpot.id, photo)}
          onAuthOpen={() => setAuthOpen(true)}
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
