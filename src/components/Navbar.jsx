import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './Navbar.css'

export default function Navbar({ view, onNavigate, onAuthOpen }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuth() ?? {}

  const navigate = (v) => { onNavigate(v); setMenuOpen(false) }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <button className="navbar-logo" onClick={() => navigate('home')}>
          <span className="logo-dot" />
          SpotLight
        </button>

        <div className="navbar-links">
          <button className={`nav-link ${view === 'explore' ? 'active' : ''}`} onClick={() => navigate('explore')}>탐색</button>
          <button className={`nav-link ${view === 'community' ? 'active' : ''}`} onClick={() => navigate('community')}>커뮤니티</button>
          <button className={`nav-link ${view === 'mymap' ? 'active' : ''}`} onClick={() => navigate('mymap')}>내 지도</button>
          <button className={`nav-link ${view === 'register' ? 'active' : ''}`} onClick={() => navigate('register')}>스팟 등록</button>
        </div>

        <div className="navbar-actions">
          {user ? (
            <div className="navbar-user">
              <button className="navbar-user-btn" onClick={() => navigate('mypage')}>
                {user.photoURL
                  ? <img src={user.photoURL} alt="" className="user-avatar" />
                  : <div className="user-avatar-placeholder">{(user.displayName || user.email)?.[0]?.toUpperCase()}</div>
                }
                <span className="user-name">{user.displayName || user.email?.split('@')[0]}</span>
              </button>
            </div>
          ) : (
            <>
              <button className="btn-login" onClick={onAuthOpen}>로그인</button>
              <button className="btn-start" onClick={() => navigate('explore')}>시작하기</button>
            </>
          )}
        </div>

        <button className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="메뉴">
          <span /><span /><span />
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <button className={`mobile-nav-link ${view === 'explore' ? 'active' : ''}`} onClick={() => navigate('explore')}>탐색</button>
          <button className={`mobile-nav-link ${view === 'community' ? 'active' : ''}`} onClick={() => navigate('community')}>커뮤니티</button>
          <button className={`mobile-nav-link ${view === 'mymap' ? 'active' : ''}`} onClick={() => navigate('mymap')}>내 지도</button>
          <button className={`mobile-nav-link ${view === 'register' ? 'active' : ''}`} onClick={() => navigate('register')}>스팟 등록</button>
          <button className={`mobile-nav-link ${view === 'mypage' ? 'active' : ''}`} onClick={() => navigate('mypage')}>마이페이지</button>
          <div className="mobile-menu-actions">
            {user
              ? <button className="btn-login" onClick={logout}>로그아웃</button>
              : <button className="btn-login" onClick={() => { setMenuOpen(false); onAuthOpen() }}>로그인</button>
            }
          </div>
        </div>
      )}
    </nav>
  )
}
