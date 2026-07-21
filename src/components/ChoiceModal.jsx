import './ChoiceModal.css'

// 무엇을 만들지 / 어떤 유형인지 고르는 공용 선택 팝업
export default function ChoiceModal({ title, subtitle, options, onClose }) {
  return (
    <div className="choice-overlay" onClick={onClose}>
      <div className="choice-panel" onClick={e => e.stopPropagation()}>
        <div className="choice-head">
          <div>
            <h2 className="choice-title">{title}</h2>
            {subtitle && <p className="choice-sub">{subtitle}</p>}
          </div>
          <button className="choice-close" onClick={onClose} aria-label="닫기">✕</button>
        </div>

        <ul className="choice-list">
          {options.map(opt => (
            <li key={opt.label}>
              <button className="choice-option" onClick={opt.onSelect}>
                <span className="choice-emoji">{opt.emoji}</span>
                <span className="choice-option-text">
                  <span className="choice-option-title">{opt.label}</span>
                  <span className="choice-option-desc">{opt.desc}</span>
                </span>
                <span className="choice-arrow">›</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
