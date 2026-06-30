import { useState, useRef } from 'react'

const extractTime = (str) => {
  if (!str) return ''
  const match = str.match(/\d{1,2}:\d{2}~\d{1,2}:\d{2}/)
  return match ? match[0] : str
}
import { useAuth } from '../contexts/AuthContext'
import './SpotDetailModal.css'

function compressImage(file, maxWidth = 1920, quality = 0.85) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > maxWidth) { height = Math.round(height * maxWidth / width); width = maxWidth }
      const canvas = document.createElement('canvas')
      canvas.width = width; canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => resolve(null)
    img.src = url
  })
}

export default function SpotDetailModal({ spot, isSaved, onSave, isLiked, onLike, onClose, contributions = [], onAddContribution, onAuthOpen }) {
  const { user } = useAuth() ?? {}
  const [activePhoto, setActivePhoto] = useState(0)
  const [activeSource, setActiveSource] = useState('original')
  const [uploading, setUploading] = useState(false)
  const [liked, setLiked] = useState(isLiked)
  const [likeCount, setLikeCount] = useState(() => {
    const base = spot.likes ?? 0
    if (typeof spot.id === 'string') {
      // Firestore 스팟: likes 카운트가 isLiked를 반영 못한 경우 보정
      return isLiked ? Math.max(base, 1) : base
    }
    return base + (isLiked ? 1 : 0)
  })
  const fileRef = useRef(null)

  const handleLikeClick = () => {
    if (!user) { onAuthOpen(); return }
    const next = !liked
    setLiked(next)
    setLikeCount(c => Math.max(0, c + (next ? 1 : -1)))
    onLike()
  }

  const allOriginal = spot.photos
  const allCommunity = contributions

  const currentPhotos = activeSource === 'original' ? allOriginal : allCommunity.map(c => c.photo)
  const currentMeta = activeSource === 'community' ? allCommunity : null

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const compressed = await compressImage(file)
    if (compressed) {
      onAddContribution(compressed)
      setActiveSource('community')
      setActivePhoto(allCommunity.length) // 방금 추가한 사진으로 이동
    }
    setUploading(false)
    e.target.value = ''
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>

        {/* 헤더 */}
        <div className="modal-header">
          <div>
            <div className="modal-tags">
              {spot.tags.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
            <h2 className="modal-title">{spot.name}</h2>
            <p className="modal-addr">{spot.address}</p>
          </div>
          <div className="modal-header-actions">
            <button className={`save-action ${isSaved ? 'saved' : ''}`} onClick={onSave}>
              {isSaved ? '저장됨' : '저장'}
            </button>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* 사진 소스 탭 */}
        <div className="photo-tabs">
          <button
            className={`photo-tab ${activeSource === 'original' ? 'active' : ''}`}
            onClick={() => { setActiveSource('original'); setActivePhoto(0) }}
          >
            등록 사진 <span className="tab-count">{allOriginal.length}</span>
          </button>
          <button
            className={`photo-tab ${activeSource === 'community' ? 'active' : ''}`}
            onClick={() => { setActiveSource('community'); setActivePhoto(0) }}
          >
            방문자 사진 <span className="tab-count">{allCommunity.length}</span>
          </button>
          {user ? (
            <label className={`btn-upload-photo ${uploading ? 'loading' : ''}`}>
              {uploading ? '업로드 중...' : '+ 내 사진 추가'}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} hidden />
            </label>
          ) : (
            <button className="btn-upload-photo" onClick={onAuthOpen}>+ 내 사진 추가</button>
          )}
        </div>

        {/* 갤러리 */}
        <div className="modal-gallery">
          {currentPhotos.length > 0 ? (
            <>
              <div className="gallery-main">
                <img src={currentPhotos[activePhoto]} alt={spot.name} />
                {activeSource === 'community' && currentMeta[activePhoto] && (
                  <div className="gallery-meta-badge">
                    {currentMeta[activePhoto].author} · {currentMeta[activePhoto].createdAt}
                  </div>
                )}
              </div>
              {currentPhotos.length > 1 && (
                <div className="gallery-thumbs">
                  {currentPhotos.map((p, i) => (
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
            </>
          ) : (
            <div className="gallery-empty">
              <p>아직 방문자 사진이 없어요</p>
              <p>이 장소에서 찍은 사진을 올려보세요!</p>
              {user ? (
              <label className="btn-upload-empty">
                사진 추가하기
                <input type="file" accept="image/*" onChange={handleFileChange} hidden />
              </label>
            ) : (
              <button className="btn-upload-empty" onClick={onAuthOpen}>로그인하고 사진 추가하기</button>
            )}
            </div>
          )}
        </div>

        {/* 스팟 정보 */}
        <div className="modal-info">
          <div className="info-row">
            <span className="info-label">최적 촬영 시간</span>
            <span className="info-value">{extractTime(spot.bestTime)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">등록자</span>
            <span className="info-value">{spot.author}</span>
          </div>
          <div className="info-row">
            <span className="info-label">등록일</span>
            <span className="info-value">
              {spot.createdAt?.toDate ? spot.createdAt.toDate().toLocaleDateString('ko-KR') : spot.createdAt}
            </span>
          </div>
        </div>

        <div className="modal-desc">
          <p>{spot.description}</p>
        </div>

        <div className="modal-footer">
          <div className="modal-stats">
            <button
              className={`like-btn ${liked ? 'liked' : ''}`}
              onClick={handleLikeClick}
              aria-pressed={liked}
            >
              <span className="like-icon">{liked ? '❤️' : '🤍'}</span>
              좋아요 {likeCount.toLocaleString()}
            </button>
            <span>저장 {(spot.saves ?? 0).toLocaleString()}</span>
            <span>방문자 사진 {allCommunity.length}장</span>
          </div>
        </div>

      </div>
    </div>
  )
}
