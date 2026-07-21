import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MEETUP_TYPES, TYPE_INFO, scheduleText } from '../hooks/useMeetups'
import './MeetupListView.css'

export default function MeetupListView({ meetups, loading, onWrite }) {
  const [type, setType] = useState('전체')

  const filtered = type === '전체' ? meetups : meetups.filter(m => m.type === type)

  return (
    <div className="meetup-page">
      <div className="meetup-container">

        <header className="meetup-header">
          <div>
            <h1 className="meetup-title">모임</h1>
            <p className="meetup-sub">
              같이 사진 찍으러 갈 사람을 구하고, 정기 모임에 참여하고, 작가님의 클래스를 들어보세요.
            </p>
          </div>
          <button className="meetup-write-btn" onClick={onWrite}>모임 만들기</button>
        </header>

        <div className="meetup-tabs">
          {['전체', ...MEETUP_TYPES].map(t => (
            <button
              key={t}
              className={`meetup-tab ${type === t ? 'active' : ''}`}
              onClick={() => setType(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {type !== '전체' && <p className="meetup-type-desc">{TYPE_INFO[type].desc}</p>}

        {loading ? (
          <p className="meetup-empty">불러오는 중…</p>
        ) : filtered.length === 0 ? (
          <div className="meetup-empty">
            <p>아직 모임이 없어요</p>
            <small>첫 모임을 만들어보세요!</small>
          </div>
        ) : (
          <ul className="meetup-grid">
            {filtered.map(m => {
              const full = !!m.capacity && (m.participantCount ?? 0) >= m.capacity
              return (
                <li key={m.id} className="meetup-card">
                  <Link className="meetup-card-link" to={`/meetup/${m.id}`}>
                    <div className="meetup-thumb">
                      {m.image
                        ? <img src={m.image} alt={m.title} loading="lazy" />
                        : <div className="meetup-thumb-empty">📷</div>
                      }
                      <span className={`meetup-badge type-${m.type}`}>{m.type}</span>
                      {full && <span className="meetup-full-badge">모집 마감</span>}
                    </div>

                    <div className="meetup-card-body">
                      <h2 className="meetup-card-title">{m.title}</h2>

                      <div className="meetup-card-info">
                        {scheduleText(m) && <span>🗓 {scheduleText(m)}</span>}
                        {m.place && <span>📍 {m.place}</span>}
                        {m.type === '원데이클래스' && m.fee && <span>💰 {m.fee}</span>}
                      </div>

                      <div className="meetup-card-foot">
                        <span className="meetup-host">
                          {m.hostPhoto
                            ? <img src={m.hostPhoto} alt="" className="meetup-avatar" />
                            : <span className="meetup-avatar-placeholder">{m.host?.[0]?.toUpperCase()}</span>
                          }
                          {m.host}
                        </span>
                        <span className="meetup-count">
                          {m.capacity
                            ? `${m.participantCount ?? 0}/${m.capacity}명`
                            : `${TYPE_INFO[m.type]?.member ?? '참여자'} ${m.participantCount ?? 0}명`}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
