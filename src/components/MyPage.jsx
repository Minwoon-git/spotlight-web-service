import { useAuth } from '../contexts/AuthContext'
import SpotCard from './SpotCard'
import './MyPage.css'

export default function MyPage({ spots, onSelectSpot, onAuthOpen, onNavigate }) {
  const { user, logout } = useAuth() ?? {}

  const mySpots = spots.filter(s => s.isUserAdded)

  if (!user) {
    return (
      <div className="mypage-login">
        <div className="mypage-login-icon">👤</div>
        <h2>로그인이 필요해요</h2>
        <p>로그인하면 내가 등록한 스팟을 관리할 수 있어요.</p>
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
        <div className="mypage-stats">
          <div className="mypage-stat">
            <span className="mypage-stat-num">{mySpots.length}</span>
            <span className="mypage-stat-label">등록한 스팟</span>
          </div>
        </div>
      </div>

      <div className="mypage-section">
        <div className="mypage-section-header">
          <h3>내가 등록한 스팟</h3>
          <button className="btn-register" onClick={() => onNavigate('register')}>+ 새 스팟 등록</button>
        </div>

        {mySpots.length === 0 ? (
          <div className="mypage-empty">
            <div className="empty-circle" />
            <h3>아직 등록한 스팟이 없어요</h3>
            <p>나만 아는 촬영 명소를 공유해보세요.</p>
            <button className="btn-primary" onClick={() => onNavigate('register')}>첫 스팟 등록하기</button>
          </div>
        ) : (
          <div className="mypage-grid">
            {mySpots.map(spot => (
              <SpotCard
                key={spot.id}
                spot={spot}
                onClick={() => onSelectSpot(spot)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mypage-footer">
        <button className="btn-logout" onClick={logout}>로그아웃</button>
      </div>
    </div>
  )
}
