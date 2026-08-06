import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { formatMeetupDate } from '../hooks/useMeetups'
import './Navbar.css'

export default function Navbar({
  view, onNavigate, onAuthOpen,
  pendingMeetups = [], requestOutcomes = [], onOpenMeetup, onDismissOutcome,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const { user, logout } = useAuth() ?? {}

  const navigate = (v) => { onNavigate(v); setMenuOpen(false) }

  const pendingTotal = pendingMeetups.reduce((sum, m) => sum + (m.count ?? 0), 0)
  const notifTotal = pendingTotal + requestOutcomes.length
  const notifEmpty = pendingMeetups.length === 0 && requestOutcomes.length === 0

  const openMeetup = (id) => { setNotifOpen(false); onOpenMeetup?.(id) }

  // 신청 결과를 확인하면 목록에서 제거하고 해당 모임으로 이동
  const openOutcome = (id) => { onDismissOutcome?.(id); openMeetup(id) }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <button className="navbar-logo" onClick={() => navigate('home')}>
          <span className="logo-dot" />
          SpotLight
        </button>

        <div className="navbar-links">
          <button className={`nav-link ${view === 'explore' ? 'active' : ''}`} onClick={() => navigate('explore')}>탐색</button>
          <button className={`nav-link ${view === 'meetup' ? 'active' : ''}`} onClick={() => navigate('meetup')}>모임</button>
          <button className={`nav-link ${view === 'mymap' ? 'active' : ''}`} onClick={() => navigate('mymap')}>내 지도</button>
          <button className={`nav-link ${view === 'register' ? 'active' : ''}`} onClick={() => navigate('register')}>스팟 등록</button>
        </div>

        <div className="navbar-actions">
          {user ? (
            <div className="navbar-user">
              <div className="navbar-notif">
                <button
                  className="navbar-notif-btn"
                  onClick={() => setNotifOpen(o => !o)}
                  aria-label="가입 신청 알림"
                  aria-expanded={notifOpen}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {notifTotal > 0 && (
                    <span className="navbar-notif-count">{notifTotal > 99 ? '99+' : notifTotal}</span>
                  )}
                </button>

                {notifOpen && (
                  <>
                    <div className="navbar-notif-backdrop" onClick={() => setNotifOpen(false)} />
                    <div className="navbar-notif-panel">
                      {notifEmpty && <p className="navbar-notif-empty">새로운 알림이 없어요.</p>}

                      {pendingMeetups.length > 0 && (
                        <>
                          <p className="navbar-notif-title">받은 가입 신청</p>
                          <ul className="navbar-notif-list">
                            {pendingMeetups.map(m => (
                              <li key={m.id}>
                                <button className="navbar-notif-item" onClick={() => openMeetup(m.id)}>
                                  <span className="navbar-notif-item-main">
                                    <span className="navbar-notif-item-title">{m.title}</span>
                                    {m.time && <span className="navbar-notif-item-time">{formatMeetupDate(m.time)}</span>}
                                  </span>
                                  <span className="navbar-notif-item-count">{m.count}건</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}

                      {requestOutcomes.length > 0 && (
                        <>
                          <p className="navbar-notif-title">내 신청 결과</p>
                          <ul className="navbar-notif-list">
                            {requestOutcomes.map(m => (
                              <li key={m.id}>
                                <button className="navbar-notif-item" onClick={() => openOutcome(m.id)}>
                                  <span className="navbar-notif-item-main">
                                    <span className="navbar-notif-item-title">{m.title}</span>
                                    {m.time && <span className="navbar-notif-item-time">{formatMeetupDate(m.time)}</span>}
                                  </span>
                                  <span className={`navbar-notif-outcome ${m.outcome}`}>
                                    {m.outcome === 'approved' ? '승인됨' : '거절됨'}
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
              <button className="navbar-user-btn" onClick={() => navigate('mypage')}>
                {user.photoURL
                  ? <img src={user.photoURL} alt="" className="user-avatar" />
                  : <div className="user-avatar-placeholder">{(user.displayName || user.email)?.[0]?.toUpperCase()}</div>
                }
                <span className="user-name">{user.displayName || user.email?.split('@')[0]}</span>
              </button>
            </div>
          ) : (
            <>
              <button className="btn-login" onClick={onAuthOpen}>로그인</button>
              <button className="btn-start" onClick={() => navigate('explore')}>시작하기</button>
            </>
          )}
        </div>

        <button className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="메뉴">
          <span /><span /><span />
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <button className={`mobile-nav-link ${view === 'explore' ? 'active' : ''}`} onClick={() => navigate('explore')}>탐색</button>
          <button className={`mobile-nav-link ${view === 'meetup' ? 'active' : ''}`} onClick={() => navigate('meetup')}>모임</button>
          <button className={`mobile-nav-link ${view === 'mymap' ? 'active' : ''}`} onClick={() => navigate('mymap')}>내 지도</button>
          <button className={`mobile-nav-link ${view === 'register' ? 'active' : ''}`} onClick={() => navigate('register')}>스팟 등록</button>
          <button className={`mobile-nav-link ${view === 'mypage' ? 'active' : ''}`} onClick={() => navigate('mypage')}>마이페이지</button>
          <div className="mobile-menu-actions">
            {user
              ? <button className="btn-login" onClick={logout}>로그아웃</button>
              : <button className="btn-login" onClick={() => { setMenuOpen(false); onAuthOpen() }}>로그인</button>
            }
          </div>
        </div>
      )}
    </nav>
  )
}
