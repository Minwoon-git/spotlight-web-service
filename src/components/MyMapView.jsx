import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import SpotCard from './SpotCard'
import AuthRequired from './AuthRequired'
import ConfirmModal from './ConfirmModal'
import './MyMapView.css'

export default function MyMapView({ spots, mySpots, savedSpots, onSelectSpot, onUnsave, onDelete, onEdit, onAuthOpen, onNavigate }) {
  const { user } = useAuth() ?? {}
  const [tab, setTab] = useState('saved')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const saved = spots.filter(s => savedSpots.includes(s.id))

  if (!user) {
    return (
      <AuthRequired
        icon="🗺️"
        title="로그인이 필요해요"
        description="로그인하면 저장한 스팟과 내가 등록한 스팟을 볼 수 있어요."
        onAuthOpen={onAuthOpen}
      />
    )
  }

  return (
    <div className="mymap-page">
      <div className="mymap-header">
        <div className="mymap-profile">
          <div className="avatar">나</div>
          <div>
            <h2 className="profile-name">내 스팟</h2>
            <p className="profile-sub">저장하거나 직접 등록한 명소를 관리하세요</p>
          </div>
        </div>
        <div className="mymap-stats">
          <div className="mymap-stat">
            <span className="mymap-stat-num">{saved.length}</span>
            <span className="mymap-stat-label">저장한 스팟</span>
          </div>
          <div className="mymap-stat">
            <span className="mymap-stat-num">{mySpots.length}</span>
            <span className="mymap-stat-label">등록한 스팟</span>
          </div>
        </div>
      </div>

      <div className="mymap-tabs">
        <button
          className={`mymap-tab ${tab === 'saved' ? 'active' : ''}`}
          onClick={() => setTab('saved')}
        >
          저장한 스팟
          <span className="mymap-tab-count">{saved.length}</span>
        </button>
        <button
          className={`mymap-tab ${tab === 'registered' ? 'active' : ''}`}
          onClick={() => setTab('registered')}
        >
          내가 등록한 스팟
          <span className="mymap-tab-count">{mySpots.length}</span>
        </button>
      </div>

      <div className="mymap-content">
        {tab === 'saved' && (
          saved.length === 0 ? (
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
          )
        )}

        {tab === 'registered' && (
          mySpots.length === 0 ? (
            <div className="mymap-empty">
              <div className="empty-circle" />
              <h3>아직 등록한 스팟이 없어요</h3>
              <p>나만 아는 촬영 명소를 공유해보세요.</p>
              <button className="btn-auth" onClick={() => onNavigate('register')}>첫 스팟 등록하기</button>
            </div>
          ) : (
            <div className="mymap-grid">
              {mySpots.map(spot => (
                <div key={spot.id} className="myspot-item">
                  <SpotCard
                    spot={spot}
                    onClick={() => onSelectSpot(spot)}
                  />
                  <div className="myspot-actions">
                    <button
                      className="btn-edit-spot"
                      onClick={e => { e.stopPropagation(); onEdit(spot) }}
                    >수정</button>
                    <button
                      className="btn-delete-spot"
                      onClick={e => {
                        e.stopPropagation()
                        setDeleteTarget(spot)
                      }}
                    >삭제</button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="스팟 삭제"
          message={`"${deleteTarget.name}"을(를) 삭제할까요?\n삭제하면 되돌릴 수 없어요.`}
          confirmLabel="삭제"
          danger
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            onDelete(deleteTarget.id)
            setDeleteTarget(null)
          }}
        />
      )}
    </div>
  )
}
