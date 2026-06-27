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
import PrivacyPolicy from './components/PrivacyPolicy'
import './App.css'

function AppInner() {
  const { user } = useAuth() ?? {}
  const { spots, mySpots, totalCount, userCount, addSpot, updateSpot, deleteSpot, addContribution, getContributions } = useSpots(user)
  const { savedSpots, handleSaveToggle } = useSavedSpots(user)
  const { likedSpots, handleLikeToggle } = useLikedSpots(user)
  const [view, setView] = useState('home')
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [editingSpot, setEditingSpot] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)

  const handleEdit = (spot) => {
    setEditingSpot(spot)
    setView('register')
  }

  const handleNavigate = (v) => {
    if (v !== 'register') setEditingSpot(null)
    setView(v)
  }

  return (
    <div className="app">
      <Navbar view={view} onNavigate={handleNavigate} onAuthOpen={() => setAuthOpen(true)} />
      <BottomTabBar view={view} onNavigate={handleNavigate} />

      {view === 'home' && (
        <HeroSection
          spots={spots}
          totalCount={totalCount}
          userCount={userCount}
          onExplore={() => handleNavigate('explore')}
          onRegister={() => handleNavigate('register')}
          onNavigate={handleNavigate}
          onAuthOpen={() => setAuthOpen(true)}
          onSelectSpot={setSelectedSpot}
        />
      )}

      {view === 'explore' && (
        <MapView
          spots={spots}
          onSelectSpot={setSelectedSpot}
          savedSpots={savedSpots}
          onRegister={() => handleNavigate('register')}
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
          onDelete={deleteSpot}
          onEdit={handleEdit}
          onAuthOpen={() => setAuthOpen(true)}
          onNavigate={handleNavigate}
        />
      )}

      {view === 'mypage' && (
        <MyPage
          onAuthOpen={() => setAuthOpen(true)}
          onNavigate={handleNavigate}
        />
      )}

      {view === 'register' && (
        user
          ? <RegisterView addSpot={addSpot} updateSpot={updateSpot} editingSpot={editingSpot} onNavigate={handleNavigate} />
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

      {view === 'privacy' && <PrivacyPolicy onBack={() => setView('home')} />}

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
