import { useAuth } from '../contexts/AuthContext'
import SpotCard from './SpotCard'
import './MyMapView.css'

export default function MyMapView({ spots, savedSpots, onSelectSpot, onUnsave, onAuthOpen }) {
  const { user } = useAuth() ?? {}
  const saved = spots.filter(s => savedSpots.includes(s.id))

  if (!user) {
    return (
      <div className="mymap-page">
        <div className="mymap-empty">
          <div className="empty-circle" />
          <h3>로그인이 필요해요</h3>
          <p>로그인하면 저장한 스팟을 한눈에 볼 수 있어요.</p>
          <button className="btn-auth" onClick={onAuthOpen}>로그인 / 회원가입</button>
        </div>
      </div>
    )
  }

  return (
    <div className="mymap-page">
      <div className="mymap-header">
        <div className="mymap-profile">
          <div className="avatar">나</div>
          <div>
            <h2 className="profile-name">나의 스팟 지도</h2>
            <p className="profile-sub">저장한 촬영 명소를 한눈에 확인하세요</p>
          </div>
        </div>
        <div className="mymap-stats">
          <div className="mymap-stat">
            <span className="mymap-stat-num">{saved.length}</span>
            <span className="mymap-stat-label">저장된 스팟</span>
          </div>
          <div className="mymap-stat">
            <span className="mymap-stat-num">
              {saved.reduce((s, sp) => s + sp.likes, 0).toLocaleString()}
            </span>
            <span className="mymap-stat-label">총 좋아요</span>
          </div>
        </div>
      </div>

      <div className="mymap-content">
        {saved.length === 0 ? (
          <div className="mymap-empty">
            <div className="empty-circle" />
            <h3>아직 저장된 스팟이 없어요</h3>
            <p>마음에 드는 스팟을 저장해 나만의 지도를 채워보세요.</p>
          </div>
        ) : (
          <div className="mymap-grid">
            {saved.map(spot => (
              <SpotCard
                key={spot.id}
                spot={spot}
                onClick={() => onSelectSpot(spot)}
                isSaved
                onSave={() => onUnsave(spot.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
