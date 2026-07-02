import { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useSpots } from './hooks/useSpots'
import { useSavedSpots } from './hooks/useSavedSpots'
import { useLikedSpots } from './hooks/useLikedSpots'
import { useContributions } from './hooks/useContributions'
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
import EmailVerifyRequired from './components/EmailVerifyRequired'
import EmailActionHandler from './components/EmailActionHandler'
import PrivacyPolicy from './components/PrivacyPolicy'
import TermsOfService from './components/TermsOfService'
import { isAdmin } from './utils/admin'
import { isEmailVerified } from './utils/auth'
import { trackSpotRegister, reinitSitemap } from './utils/personalization'
import './App.css'

// URL → view 이름 매핑 (Navbar/BottomTabBar 호환)
const PATH_TO_VIEW = {
  '/main': 'home',
  '/explore': 'explore',
  '/mymap': 'mymap',
  '/register': 'register',
  '/mypage': 'mypage',
  '/privacy': 'privacy',
  '/terms': 'terms',
}

function AppInner() {
  const { user } = useAuth() ?? {}
  const { spots, mySpots, totalCount, userCount, addSpot, updateSpot, deleteSpot } = useSpots(user)
  const { savedSpots, handleSaveToggle } = useSavedSpots(user)
  const { likedSpots, handleLikeToggle } = useLikedSpots(user)
  const [selectedSpot, setSelectedSpot] = useState(null)
  const { contributions, addContribution, deleteContribution } = useContributions(selectedSpot?.id, user)
  const admin = isAdmin(user)
  const [editingSpot, setEditingSpot] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  const view = PATH_TO_VIEW[location.pathname] ?? 'home'

  // 최초 로드는 콘솔에 등록된 sitemap이 이미 매칭했으므로, 이후 라우트 변경 시에만
  // reinit()을 호출해 새 경로의 pageType을 다시 매칭시킨다.
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    reinitSitemap()
  }, [location.pathname])

  const handleNavigate = (v) => {
    setEditingSpot(null)
    const pathMap = {
      home: '/main', explore: '/explore', mymap: '/mymap',
      register: '/register', mypage: '/mypage', privacy: '/privacy', terms: '/terms',
    }
    navigate(pathMap[v] ?? '/main')
  }

  const handleEdit = (spot) => {
    setEditingSpot(spot)
    navigate('/register')
  }

  const handleAddSpot = async (data) => {
    const newSpot = await addSpot(data)
    trackSpotRegister(newSpot)
    return newSpot
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
          !user
            ? <AuthRequired
                icon="📍"
                title="로그인이 필요해요"
                description="스팟을 등록하려면 로그인하세요."
                onAuthOpen={() => setAuthOpen(true)}
              />
            : isEmailVerified(user)
              ? <RegisterView addSpot={handleAddSpot} updateSpot={updateSpot} editingSpot={editingSpot} onNavigate={handleNavigate} />
              : <EmailVerifyRequired />
        } />

        <Route path="/privacy" element={<PrivacyPolicy onBack={() => handleNavigate('home')} />} />
        <Route path="/terms" element={<TermsOfService onBack={() => handleNavigate('home')} />} />
        <Route path="/auth/action" element={<EmailActionHandler onBack={() => handleNavigate('home')} />} />

        {/* 루트 및 미매칭 → /main 리다이렉트 */}
        <Route path="/" element={<Navigate to="/main" replace />} />
        <Route path="*" element={<Navigate to="/main" replace />} />
      </Routes>

      {selectedSpot && (
        <SpotDetailModal
          key={selectedSpot.id}
          spot={spots.find(s => s.id === selectedSpot.id) ?? selectedSpot}
          isSaved={savedSpots.includes(selectedSpot.id)}
          onSave={() => handleSaveToggle(selectedSpot.id)}
          isLiked={likedSpots.includes(selectedSpot.id)}
          onLike={() => handleLikeToggle(selectedSpot)}
          onClose={() => setSelectedSpot(null)}
          contributions={contributions}
          onAddContribution={addContribution}
          onAuthOpen={() => setAuthOpen(true)}
          isAdmin={admin}
          onDeleteSpot={async () => { await deleteSpot(selectedSpot.id); setSelectedSpot(null) }}
          onDeleteContribution={deleteContribution}
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
