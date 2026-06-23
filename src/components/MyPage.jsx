import { useAuth } from '../contexts/AuthContext'
import './MyPage.css'

export default function MyPage({ onAuthOpen, onNavigate }) {
  const { user, logout } = useAuth() ?? {}

  if (!user) {
    return (
      <div className="mypage-login">
        <div className="mypage-login-icon">👤</div>
        <h2>로그인이 필요해요</h2>
        <p>로그인하면 내 정보를 확인할 수 있어요.</p>
        <button className="btn-primary" onClick={onAuthOpen}>로그인 / 회원가입</button>
      </div>
    )
  }

  const initial = (user.displayName || user.email)?.[0]?.toUpperCase()

  return (
    <div className="mypage">
      <div className="mypage-header">
        <div className="mypage-profile">
          {user.photoURL
            ? <img src={user.photoURL} alt="" className="mypage-avatar" onError={e => { e.target.style.display = 'none' }} />
            : <div className="mypage-avatar-placeholder">{initial}</div>
          }
          <div className="mypage-info">
            <h2 className="mypage-name">{user.displayName || user.email?.split('@')[0]}</h2>
            <p className="mypage-email">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="mypage-menu">
        <button className="mypage-menu-item" onClick={() => onNavigate('mymap')}>
          <span className="mypage-menu-icon">🗺️</span>
          <span className="mypage-menu-label">내 스팟 관리</span>
          <span className="mypage-menu-arrow">›</span>
        </button>
        <button className="mypage-menu-item" onClick={() => onNavigate('register')}>
          <span className="mypage-menu-icon">📍</span>
          <span className="mypage-menu-label">새 스팟 등록</span>
          <span className="mypage-menu-arrow">›</span>
        </button>
      </div>

      <div className="mypage-footer">
        <button className="btn-logout" onClick={logout}>로그아웃</button>
      </div>
    </div>
  )
}
