import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
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

// URL → view 이름 매핑 (Navbar/BottomTabBar 호환)
const PATH_TO_VIEW = {
  '/main': 'home',
  '/explore': 'explore',
  '/mymap': 'mymap',
  '/register': 'register',
  '/mypage': 'mypage',
  '/privacy': 'privacy',
}

function AppInner() {
  const { user } = useAuth() ?? {}
  const { spots, mySpots, totalCount, userCount, addSpot, updateSpot, deleteSpot, addContribution, getContributions } = useSpots(user)
  const { savedSpots, handleSaveToggle } = useSavedSpots(user)
  const { likedSpots, handleLikeToggle } = useLikedSpots(user)
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [editingSpot, setEditingSpot] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  const view = PATH_TO_VIEW[location.pathname] ?? 'home'

  const handleNavigate = (v) => {
    if (v !== 'register') setEditingSpot(null)
    const pathMap = {
      home: '/main', explore: '/explore', mymap: '/mymap',
      register: '/register', mypage: '/mypage', privacy: '/privacy',
    }
    navigate(pathMap[v] ?? '/main')
  }

  const handleEdit = (spot) => {
    setEditingSpot(spot)
    navigate('/register')
  }

  return (
    <div className="app">
      <Navbar view={view} onNavigate={handleNavigate} onAuthOpen={() => setAuthOpen(true)} />
      <BottomTabBar view={view} onNavigate={handleNavigate} />

      <Routes>
        <Route path="/main" element={
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
        } />

        <Route path="/explore" element={
          <MapView
            spots={spots}
            onSelectSpot={setSelectedSpot}
            savedSpots={savedSpots}
            onRegister={() => handleNavigate('register')}
            user={user}
            onAuthOpen={() => setAuthOpen(true)}
          />
        } />

        <Route path="/mymap" element={
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
        } />

        <Route path="/mypage" element={
          <MyPage
            onAuthOpen={() => setAuthOpen(true)}
            onNavigate={handleNavigate}
          />
        } />

        <Route path="/register" element={
          user
            ? <RegisterView addSpot={addSpot} updateSpot={updateSpot} editingSpot={editingSpot} onNavigate={handleNavigate} />
            : <AuthRequired
                icon="📍"
                title="로그인이 필요해요"
                description="스팟을 등록하려면 로그인하세요."
                onAuthOpen={() => setAuthOpen(true)}
              />
        } />

        <Route path="/privacy" element={<PrivacyPolicy onBack={() => handleNavigate('home')} />} />

        {/* 루트 및 미매칭 → /main 리다이렉트 */}
        <Route path="/" element={<Navigate to="/main" replace />} />
        <Route path="*" element={<Navigate to="/main" replace />} />
      </Routes>

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
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </AuthProvider>
  )
}
