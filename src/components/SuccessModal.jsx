import './SuccessModal.css'

export default function SuccessModal({ title, message, actions }) {
  return (
    <div className="success-overlay">
      <div className="success-panel">
        <div className="success-modal-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className="success-modal-title">{title}</h2>
        <p className="success-modal-message">{message}</p>
        <div className="success-modal-actions">
          {actions.map((a, i) => (
            <button
              key={i}
              className={`success-modal-btn ${a.primary ? 'primary' : 'secondary'}`}
              onClick={a.onClick}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
