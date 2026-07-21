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
import AboutView from './components/AboutView'
import SpotDetailPage from './components/SpotDetailPage'
import MeetupListView from './components/MeetupListView'
import MeetupDetailView from './components/MeetupDetailView'
import MeetupWriteView from './components/MeetupWriteView'
import ChoiceModal from './components/ChoiceModal'
import { MEETUP_TYPES, TYPE_INFO } from './hooks/useMeetups'
import { useMeetups } from './hooks/useMeetups'
import { isAdmin } from './utils/admin'
import { isEmailVerified } from './utils/auth'
import { trackSpotRegister, reinitSitemap } from './utils/personalization'
import { useAdSense } from './hooks/useAdSense'
import './App.css'

const MEETUP_EMOJI = { 소셜링: '📸', 클럽: '👥', 원데이클래스: '🎓' }

// URL → view 이름 매핑 (Navbar/BottomTabBar 호환)
const PATH_TO_VIEW = {
  '/main': 'home',
  '/explore': 'explore',
  '/mymap': 'mymap',
  '/register': 'register',
  '/mypage': 'mypage',
  '/privacy': 'privacy',
  '/terms': 'terms',
  '/about': 'about',
  '/meetup': 'meetup',
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
  const { meetups, loading: meetupsLoading, addMeetup, updateMeetup, deleteMeetup } = useMeetups()
  const [editingMeetup, setEditingMeetup] = useState(null)
  // null | 'create'(무엇을 만들지) | 'meetupType'(모임 유형)
  const [choiceModal, setChoiceModal] = useState(null)
  const [newMeetupType, setNewMeetupType] = useState('소셜링')

  const navigate = useNavigate()
  const location = useLocation()

  const view = PATH_TO_VIEW[location.pathname] ?? 'home'

  // 콘텐츠가 있는 화면(지도/명소 목록/글 등)에서만 애드센스를 로드한다.
  // 로그인 안내, 이메일 인증 안내, 인증 액션 처리 같은 화면은 제외 —
  // 애드센스 "게시자 콘텐츠가 없는 화면에 광고 게재" 정책 위반을 피하기 위함.
  const isContentRoute = (() => {
    const path = location.pathname
    if (['/', '/main', '/explore', '/privacy', '/terms', '/about'].includes(path)) return true
    // 모임 목록·상세는 콘텐츠 화면 (모임 만들기 폼은 제외)
    if (path === '/meetup' || (path.startsWith('/meetup/') && path !== '/meetup/write')) return true
    if (path.startsWith('/spot/')) return true
    if (path === '/mymap' || path === '/mypage') return !!user
    if (path === '/register') return !!user && isEmailVerified(user)
    return false
  })()
  useAdSense(isContentRoute)

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
      register: '/register', mypage: '/mypage', privacy: '/privacy', terms: '/terms', about: '/about',
      meetup: '/meetup',
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
      <BottomTabBar
        view={view}
        onNavigate={handleNavigate}
        onCreate={() => {
          if (!user) { setAuthOpen(true); return }
          setChoiceModal('create')
        }}
      />

      <Routes>
        <Route path="/" element={
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

        <Route path="/about" element={
          <AboutView
            onBack={() => handleNavigate('home')}
            onExplore={() => handleNavigate('explore')}
            onRegister={() => handleNavigate('register')}
          />
        } />
        <Route path="/spot/:id" element={
          <SpotDetailPage
            spots={spots}
            onBack={() => handleNavigate('explore')}
            onOpenMap={(spot) => { setSelectedSpot(spot); handleNavigate('explore') }}
          />
        } />
        <Route path="/meetup" element={
          <MeetupListView
            meetups={meetups}
            loading={meetupsLoading}
            onWrite={() => {
              if (!user) { setAuthOpen(true); return }
              setEditingMeetup(null)
              setChoiceModal('meetupType')
            }}
          />
        } />

        <Route path="/meetup/write" element={
          !user
            ? <AuthRequired
                icon="🤝"
                title="로그인이 필요해요"
                description="모임을 만들려면 로그인하세요."
                onAuthOpen={() => setAuthOpen(true)}
              />
            : <MeetupWriteView
                editingMeetup={editingMeetup}
                initialType={newMeetupType}
                addMeetup={addMeetup}
                updateMeetup={updateMeetup}
                user={user}
                onDone={(meetupId) => { setEditingMeetup(null); navigate(`/meetup/${meetupId}`) }}
                onCancel={() => { setEditingMeetup(null); navigate('/meetup') }}
              />
        } />

        <Route path="/meetup/:id" element={
          <MeetupDetailView
            user={user}
            isAdmin={admin}
            onBack={() => navigate('/meetup')}
            onEdit={(m) => { setEditingMeetup(m); navigate('/meetup/write') }}
            onDeleted={async (meetupId) => { await deleteMeetup(meetupId); navigate('/meetup') }}
            onAuthOpen={() => setAuthOpen(true)}
          />
        } />

        <Route path="/privacy" element={<PrivacyPolicy onBack={() => handleNavigate('home')} />} />
        <Route path="/terms" element={<TermsOfService onBack={() => handleNavigate('home')} />} />
        <Route path="/auth/action" element={<EmailActionHandler onBack={() => handleNavigate('home')} />} />

        {/* 미매칭 경로만 /main 리다이렉트 (루트는 위에서 직접 콘텐츠를 렌더링) */}
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

      {choiceModal === 'create' && (
        <ChoiceModal
          title="무엇을 만들까요?"
          onClose={() => setChoiceModal(null)}
          options={[
            {
              emoji: '📍', label: '스팟 등록', desc: '나만 알던 촬영 명소를 지도에 추가해요',
              onSelect: () => { setChoiceModal(null); handleNavigate('register') },
            },
            {
              emoji: '🤝', label: '모임 만들기', desc: '함께 사진 찍을 사람을 모아요',
              onSelect: () => { setEditingMeetup(null); setChoiceModal('meetupType') },
            },
          ]}
        />
      )}

      {choiceModal === 'meetupType' && (
        <ChoiceModal
          title="어떤 모임을 만들까요?"
          subtitle="유형에 따라 입력하는 정보가 달라져요."
          onClose={() => setChoiceModal(null)}
          options={MEETUP_TYPES.map(type => ({
            emoji: MEETUP_EMOJI[type], label: type, desc: TYPE_INFO[type].desc,
            onSelect: () => {
              setNewMeetupType(type)
              setChoiceModal(null)
              navigate('/meetup/write')
            },
          }))}
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
