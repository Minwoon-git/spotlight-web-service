import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './AuthRequired.css'

export default function EmailVerifyRequired() {
  const { user, resendVerification, refreshUser } = useAuth() ?? {}
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const handleResend = async () => {
    setLoading(true); setStatus('')
    try {
      await resendVerification()
      setStatus('인증 메일을 다시 보냈어요. 받은편지함을 확인해주세요.')
    } catch {
      setStatus('전송에 실패했어요. 잠시 후 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const handleCheck = async () => {
    setLoading(true); setStatus('')
    try {
      await refreshUser()
    } catch {
      setStatus('확인에 실패했어요. 잠시 후 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-required-page">
      <div className="auth-required-icon">📧</div>
      <h2 className="auth-required-title">이메일 인증이 필요해요</h2>
      <p className="auth-required-desc">
        {user?.email}로 인증 메일을 보냈어요.<br />
        메일의 링크를 클릭한 뒤 아래 버튼을 눌러주세요.
      </p>
      {status && <p className="auth-required-desc">{status}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="auth-required-btn" onClick={handleCheck} disabled={loading}>
          인증 완료했어요
        </button>
        <button className="auth-required-btn" onClick={handleResend} disabled={loading} style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: '1.5px solid var(--border)' }}>
          인증 메일 재전송
        </button>
      </div>
    </div>
  )
}
