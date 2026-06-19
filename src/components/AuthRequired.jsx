import './AuthRequired.css'

export default function AuthRequired({ icon, title, description, onAuthOpen }) {
  return (
    <div className="auth-required-page">
      <div className="auth-required-icon">{icon}</div>
      <h2 className="auth-required-title">{title}</h2>
      <p className="auth-required-desc">{description}</p>
      <button className="auth-required-btn" onClick={onAuthOpen}>로그인 / 회원가입</button>
    </div>
  )
}
