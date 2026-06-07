import { useState } from 'react'
import './SpotDetailModal.css'

export default function SpotDetailModal({ spot, isSaved, onSave, onClose }) {
  const [activePhoto, setActivePhoto] = useState(0)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <div>
            <div className="modal-tags">
              {spot.tags.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
            <h2 className="modal-title">{spot.name}</h2>
            <p className="modal-addr">{spot.address}</p>
          </div>
          <div className="modal-header-actions">
            <button
              className={`save-action ${isSaved ? 'saved' : ''}`}
              onClick={onSave}
            >
              {isSaved ? '저장됨' : '저장'}
            </button>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="modal-gallery">
          <div className="gallery-main">
            <img src={spot.photos[activePhoto]} alt={spot.name} />
          </div>
          {spot.photos.length > 1 && (
            <div className="gallery-thumbs">
              {spot.photos.map((p, i) => (
                <button
                  key={i}
                  className={`gallery-thumb ${activePhoto === i ? 'active' : ''}`}
                  onClick={() => setActivePhoto(i)}
                >
                  <img src={p} alt={`photo-${i}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="modal-info">
          <div className="info-row">
            <span className="info-label">최적 촬영 시간</span>
            <span className="info-value">{spot.bestTime}</span>
          </div>
          <div className="info-row">
            <span className="info-label">등록자</span>
            <span className="info-value">{spot.author}</span>
          </div>
          <div className="info-row">
            <span className="info-label">등록일</span>
            <span className="info-value">{spot.createdAt}</span>
          </div>
        </div>

        <div className="modal-desc">
          <p>{spot.description}</p>
        </div>

        <div className="modal-footer">
          <div className="modal-stats">
            <span>좋아요 {spot.likes.toLocaleString()}</span>
            <span>저장 {spot.saves.toLocaleString()}</span>
          </div>
        </div>

      </div>
    </div>
  )
}
