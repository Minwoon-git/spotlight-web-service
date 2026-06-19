import './SpotCard.css'

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
          <span className="spot-likes">좋아요 {(spot.likes ?? 0).toLocaleString()}</span>
          <span className="spot-besttime">{spot.bestTime}</span>
        </div>
      </div>
    </div>
  )
}
