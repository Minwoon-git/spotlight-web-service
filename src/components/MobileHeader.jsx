import { useAuth } from '../contexts/AuthContext'
import './MobileHeader.css'

export default function MobileHeader({ onNavigate, onAuthOpen }) {
  const { user, logout } = useAuth() ?? {}

  return (
    <header className="mobile-header">
      <button className="mobile-header-logo" onClick={() => onNavigate('home')}>
        <span className="logo-dot" />
        SpotLight
      </button>

      {user ? (
        <button className="mobile-header-user" onClick={logout} aria-label="로그아웃">
          {user.photoURL
            ? <img src={user.photoURL} alt="" className="mobile-user-avatar" />
            : <span className="mobile-user-initial">{(user.displayName || user.email)?.[0]?.toUpperCase()}</span>
          }
        </button>
      ) : (
        <button className="mobile-header-login" aria-label="로그인" onClick={onAuthOpen}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </button>
      )}
    </header>
  )
}
