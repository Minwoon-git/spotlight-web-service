import './SpotCard.css'

const extractTime = (str) => {
  if (!str) return ''
  const match = str.match(/\d{1,2}:\d{2}~\d{1,2}:\d{2}/)
  return match ? match[0] : str
}

export default function SpotCard({ spot, onClick, isSaved, onSave, compact }) {
  return (
    <div className={`spot-card ${compact ? 'compact' : ''}`} onClick={onClick}>
      <div className="spot-card-img-wrap">
        <img
          src={spot.photos[0]}
          alt={spot.name}
          className="spot-card-img"
          loading="lazy"
        />
        {onSave && (
          <button
            className={`save-btn ${isSaved ? 'saved' : ''}`}
            onClick={e => { e.stopPropagation(); onSave(spot.id) }}
          >
            {isSaved ? '저장됨' : '저장'}
          </button>
        )}
      </div>
      <div className="spot-card-body">
        <div className="spot-tags">
          {spot.tags.slice(0, 3).map(t => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
        <h3 className="spot-name">{spot.name}</h3>
        <p className="spot-addr">{spot.address}</p>
        <div className="spot-meta">
          <span className="spot-likes">좋아요 {Math.max(0, spot.likes ?? 0).toLocaleString()}</span>
          {extractTime(spot.bestTime) && <span className="spot-besttime">{extractTime(spot.bestTime)}</span>}
        </div>
      </div>
    </div>
  )
}
