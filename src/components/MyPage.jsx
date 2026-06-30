import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './MyPage.css'

export default function MyPage({ onAuthOpen, onNavigate }) {
  const { user, logout, updateNickname } = useAuth() ?? {}
  const [editing, setEditing] = useState(false)
  const [nicknameInput, setNicknameInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  if (!user) {
    return (
      <div className="mypage-login">
        <div className="mypage-login-icon">👤</div>
        <h2>로그인이 필요해요</h2>
        <p>로그인하면 내 정보를 확인할 수 있어요.</p>
        <button className="btn-primary" onClick={onAuthOpen}>로그인 / 회원가입</button>
      </div>
    )
  }

  const initial = (user.displayName || user.email)?.[0]?.toUpperCase()

  const startEdit = () => {
    setNicknameInput(user.displayName || '')
    setError('')
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setError('')
  }

  const saveNickname = async () => {
    const name = nicknameInput.trim()
    if (!name) { setError('닉네임을 입력해주세요'); return }
    if (name.length > 20) { setError('닉네임은 20자 이내로 입력해주세요'); return }

    setSaving(true)
    try {
      await updateNickname(name)
      setEditing(false)
    } catch (err) {
      console.error('닉네임 변경 실패:', err)
      setError('변경 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mypage">
      <div className="mypage-header">
        <div className="mypage-profile">
          {user.photoURL
            ? <img src={user.photoURL} alt="" className="mypage-avatar" onError={e => { e.target.style.display = 'none' }} />
            : <div className="mypage-avatar-placeholder">{initial}</div>
          }
          <div className="mypage-info">
            {editing ? (
              <div className="nickname-edit">
                <input
                  type="text"
                  className="nickname-input"
                  value={nicknameInput}
                  onChange={e => { setNicknameInput(e.target.value); setError('') }}
                  onKeyDown={e => { if (e.key === 'Enter') saveNickname(); if (e.key === 'Escape') cancelEdit() }}
                  placeholder="닉네임 입력"
                  maxLength={20}
                  autoFocus
                />
                <button className="nickname-btn save" onClick={saveNickname} disabled={saving}>
                  {saving ? '저장 중...' : '저장'}
                </button>
                <button className="nickname-btn cancel" onClick={cancelEdit} disabled={saving}>취소</button>
              </div>
            ) : (
              <h2 className="mypage-name">
                {user.displayName || user.email?.split('@')[0]}
                <button className="nickname-edit-btn" onClick={startEdit} aria-label="닉네임 변경">✏️</button>
              </h2>
            )}
            {error && <p className="nickname-error">⚠ {error}</p>}
            <p className="mypage-email">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="mypage-menu">
        <button className="mypage-menu-item" onClick={() => onNavigate('mymap')}>
          <span className="mypage-menu-icon">🗺️</span>
          <span className="mypage-menu-label">내 스팟 관리</span>
          <span className="mypage-menu-arrow">›</span>
        </button>
        <button className="mypage-menu-item" onClick={() => onNavigate('register')}>
          <span className="mypage-menu-icon">📍</span>
          <span className="mypage-menu-label">새 스팟 등록</span>
          <span className="mypage-menu-arrow">›</span>
        </button>
      </div>

      <div className="mypage-footer">
        <button className="btn-logout" onClick={logout}>로그아웃</button>
      </div>
    </div>
  )
}
