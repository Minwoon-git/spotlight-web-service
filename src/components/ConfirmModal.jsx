import './ConfirmModal.css'

export default function ConfirmModal({
  title = '확인',
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  danger = false,
  onConfirm,
  onCancel,
}) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-panel" onClick={e => e.stopPropagation()}>
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="confirm-btn confirm-cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className={`confirm-btn confirm-ok ${danger ? 'danger' : ''}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
