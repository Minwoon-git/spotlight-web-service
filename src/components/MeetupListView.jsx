import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MEETUP_TYPES, TYPE_INFO, scheduleText, shortRegion } from '../hooks/useMeetups'
import './MeetupListView.css'

function MeetupCard({ m }) {
  const full = !!m.capacity && (m.participantCount ?? 0) >= m.capacity
  return (
    <li className="meetup-item">
      <Link className="meetup-item-link" to={`/meetup/${m.id}`}>
        <div className="meetup-thumb">
          {m.image
            ? <img src={m.image} alt={m.title} loading="lazy" />
            : <div className="meetup-thumb-empty">📷</div>
          }
          <span className={`meetup-badge type-${m.type}`}>{m.type}</span>
          {full && <span className="meetup-full-badge">마감</span>}
        </div>

        <p className="meetup-item-meta">
          {[shortRegion(m.place), `${TYPE_INFO[m.type]?.member ?? '참여자'} ${m.participantCount ?? 0}명`]
            .filter(Boolean).join(' · ')}
        </p>

        <h2 className="meetup-item-title">{m.title}</h2>

        {scheduleText(m) && (
          <p className="meetup-item-date">🗓 {scheduleText(m)}</p>
        )}

        {m.type === '원데이클래스' && m.fee && (
          <p className="meetup-item-fee">💰 {m.fee}</p>
        )}
      </Link>
    </li>
  )
}

export default function MeetupListView({ meetups, loading, user, joinedMeetups = [], onWrite, onAuthOpen }) {
  const [scope, setScope] = useState('browse') // browse | mine
  const [type, setType] = useState('전체')

  const hosted = user ? meetups.filter(m => m.hostId === user.uid) : []
  const joined = user ? meetups.filter(m => joinedMeetups.includes(m.id) && m.hostId !== user.uid) : []

  const browseList = type === '전체' ? meetups : meetups.filter(m => m.type === type)

  return (
    <div className="meetup-page">
      <div className="meetup-container">

        <header className="meetup-header">
          <div>
            <h1 className="meetup-title">모임</h1>
            <p className="meetup-sub">사진으로 연결되는 사람들</p>
          </div>
          <button className="meetup-write-btn" onClick={onWrite}>모임 만들기</button>
        </header>

        <div className="meetup-scope">
          <button
            className={`meetup-scope-btn ${scope === 'browse' ? 'active' : ''}`}
            onClick={() => setScope('browse')}
          >
            둘러보기
          </button>
          <button
            className={`meetup-scope-btn ${scope === 'mine' ? 'active' : ''}`}
            onClick={() => (user ? setScope('mine') : onAuthOpen())}
          >
            내 모임
            {user && (hosted.length + joined.length > 0) && (
              <span className="meetup-scope-count">{hosted.length + joined.length}</span>
            )}
          </button>
        </div>

        {scope === 'browse' ? (
          <>
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
            ) : browseList.length === 0 ? (
              <div className="meetup-empty">
                <p>아직 모임이 없어요</p>
                <small>첫 모임을 만들어보세요!</small>
              </div>
            ) : (
              <ul className="meetup-grid">
                {browseList.map(m => <MeetupCard key={m.id} m={m} />)}
              </ul>
            )}
          </>
        ) : (
          <>
            <section className="meetup-section">
              <h2 className="meetup-section-title">
                내가 만든 모임 <span className="meetup-section-count">{hosted.length}</span>
              </h2>
              {hosted.length === 0 ? (
                <p className="meetup-section-empty">아직 만든 모임이 없어요.</p>
              ) : (
                <ul className="meetup-grid">
                  {hosted.map(m => <MeetupCard key={m.id} m={m} />)}
                </ul>
              )}
            </section>

            <section className="meetup-section">
              <h2 className="meetup-section-title">
                참여한 모임 <span className="meetup-section-count">{joined.length}</span>
              </h2>
              {joined.length === 0 ? (
                <p className="meetup-section-empty">아직 참여한 모임이 없어요. 둘러보기에서 마음에 드는 모임을 찾아보세요!</p>
              ) : (
                <ul className="meetup-grid">
                  {joined.map(m => <MeetupCard key={m.id} m={m} />)}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
