import { MEETUP_TYPES, TYPE_INFO } from '../hooks/useMeetups'
import './MeetupTypeModal.css'

const TYPE_EMOJI = {
  소셜링: '📸',
  클럽: '👥',
  원데이클래스: '🎓',
}

export default function MeetupTypeModal({ onSelect, onClose }) {
  return (
    <div className="mt-overlay" onClick={onClose}>
      <div className="mt-panel" onClick={e => e.stopPropagation()}>
        <div className="mt-head">
          <div>
            <h2 className="mt-title">어떤 모임을 만들까요?</h2>
            <p className="mt-sub">유형에 따라 입력하는 정보가 달라져요.</p>
          </div>
          <button className="mt-close" onClick={onClose} aria-label="닫기">✕</button>
        </div>

        <ul className="mt-list">
          {MEETUP_TYPES.map(type => (
            <li key={type}>
              <button className="mt-option" onClick={() => onSelect(type)}>
                <span className="mt-emoji">{TYPE_EMOJI[type]}</span>
                <span className="mt-option-text">
                  <span className="mt-option-title">{type}</span>
                  <span className="mt-option-desc">{TYPE_INFO[type].desc}</span>
                </span>
                <span className="mt-arrow">›</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
