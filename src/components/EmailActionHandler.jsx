import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { applyActionCode, checkActionCode } from 'firebase/auth'
import { auth } from '../firebase'
import './AuthRequired.css'

export default function EmailActionHandler({ onBack }) {
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode')
  const oobCode = searchParams.get('oobCode')
  const [status, setStatus] = useState('loading')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (mode !== 'verifyEmail' || !oobCode) { setStatus('invalid'); return }

    checkActionCode(auth, oobCode)
      .then(info => setEmail(info.data.email ?? ''))
      .catch(() => {})

    applyActionCode(auth, oobCode)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [mode, oobCode])

  if (status === 'loading') {
    return (
      <div className="auth-required-page">
        <div className="auth-required-icon">📧</div>
        <h2 className="auth-required-title">인증 처리 중...</h2>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="auth-required-page">
        <div className="auth-required-icon">✅</div>
        <h2 className="auth-required-title">이메일 인증이 완료됐어요</h2>
        <p className="auth-required-desc">
          {email && `${email} 계정이 인증됐습니다.`}<br />
          이제 SpotLight의 모든 기능을 이용하실 수 있어요.
        </p>
        <button className="auth-required-btn" onClick={onBack}>SpotLight로 이동</button>
      </div>
    )
  }

  if (status === 'invalid') {
    return (
      <div className="auth-required-page">
        <div className="auth-required-icon">⚠️</div>
        <h2 className="auth-required-title">잘못된 접근이에요</h2>
        <p className="auth-required-desc">인증 링크 정보를 찾을 수 없어요.</p>
        <button className="auth-required-btn" onClick={onBack}>SpotLight로 이동</button>
      </div>
    )
  }

  return (
    <div className="auth-required-page">
      <div className="auth-required-icon">⚠️</div>
      <h2 className="auth-required-title">인증에 실패했어요</h2>
      <p className="auth-required-desc">
        링크가 만료됐거나 이미 사용된 링크예요.<br />
        마이페이지에서 인증 메일을 다시 받아보세요.
      </p>
      <button className="auth-required-btn" onClick={onBack}>SpotLight로 이동</button>
    </div>
  )
}
