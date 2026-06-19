import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './AuthModal.css'

export default function AuthModal({ onClose }) {
  const { loginWithGoogle, loginWithEmail, signupWithEmail } = useAuth()
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogle = async () => {
    setError(''); setLoading(true)
    try { await loginWithGoogle(); onClose() }
    catch (e) { setError('Google 로그인에 실패했어요.') }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      if (tab === 'login') await loginWithEmail(email, password)
      else await signupWithEmail(email, password, name)
      onClose()
    } catch (e) {
      const msgs = {
        'auth/invalid-credential': '이메일 또는 비밀번호가 틀렸어요.',
        'auth/email-already-in-use': '이미 사용 중인 이메일이에요.',
        'auth/weak-password': '비밀번호는 6자 이상이어야 해요.',
        'auth/invalid-email': '올바른 이메일 형식이 아니에요.',
      }
      setError(msgs[e.code] ?? '오류가 발생했어요. 다시 시도해주세요.')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-panel" onClick={e => e.stopPropagation()}>
        <div className="auth-handle" />

        <div className="auth-header">
          <div className="auth-logo">
            <span className="auth-logo-dot" />
            SpotLight
          </div>
          <button className="auth-close" onClick={onClose}>✕</button>
        </div>

        <div className="auth-tabs">
          <button className={tab === 'login' ? 'active' : ''} onClick={() => { setTab('login'); setError('') }}>로그인</button>
          <button className={tab === 'signup' ? 'active' : ''} onClick={() => { setTab('signup'); setError('') }}>회원가입</button>
        </div>

        <button className="auth-google-btn" onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google로 {tab === 'login' ? '로그인' : '가입'}
        </button>

        <div className="auth-divider"><span>또는</span></div>

        <form onSubmit={handleSubmit} className="auth-form">
          {tab === 'signup' && (
            <div className="auth-field">
              <label>이름</label>
              <input type="text" placeholder="이름을 입력하세요" value={name}
                onChange={e => setName(e.target.value)} required />
            </div>
          )}
          <div className="auth-field">
            <label>이메일</label>
            <input type="email" placeholder="이메일을 입력하세요" value={email}
              onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="auth-field">
            <label>비밀번호</label>
            <input type="password" placeholder={tab === 'signup' ? '6자 이상 입력하세요' : '비밀번호를 입력하세요'}
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? '처리 중...' : tab === 'login' ? '로그인' : '회원가입'}
          </button>
        </form>
      </div>
    </div>
  )
}
