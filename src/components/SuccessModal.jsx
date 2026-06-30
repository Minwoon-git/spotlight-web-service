import './SuccessModal.css'

export default function SuccessModal({ title, message, actions }) {
  return (
    <div className="success-overlay">
      <div className="success-panel">
        <div className="success-modal-icon" />
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
