import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useMeetup, formatMeetupDate, scheduleText, TYPE_INFO } from '../hooks/useMeetups'
import ConfirmModal from './ConfirmModal'
import './MeetupDetailView.css'

export default function MeetupDetailView({
  user, isAdmin, savedMeetups = [], onToggleSave, onSyncJoined, onBack, onEdit, onDeleted, onAuthOpen,
}) {
  const { id } = useParams()
  const {
    meetup, loading, participants, requests, comments,
    requiresApproval, isJoined, isPending, isFull,
    join, leave, approveRequest, rejectRequest, addComment, deleteComment,
  } = useMeetup(id, user)

  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)
  const [joining, setJoining] = useState(false)
  const [confirm, setConfirm] = useState(null) // 'delete' | 'leave' | commentId

  const isHost = !!user && meetup?.hostId === user.uid
  const canDelete = isHost || isAdmin
  const words = TYPE_INFO[meetup?.type] ?? TYPE_INFO.소셜링
  const isSaved = !!meetup && savedMeetups.includes(meetup.id)

  // 승인은 모임장이 하므로, 신청자가 상세를 열 때 본인 '참여한 모임' 목록을 실제 참여 여부와 맞춘다
  useEffect(() => {
    if (!user || !meetup || isHost) return
    onSyncJoined?.(meetup.id, isJoined)
  }, [user, meetup, isHost, isJoined, onSyncJoined])

  const handleJoin = async () => {
    if (!user) { onAuthOpen(); return }
    setJoining(true)
    try {
      if (isJoined) await leave()
      else await join()
    } catch (err) {
      console.error('참가 처리 실패:', err)
    } finally {
      setJoining(false)
      setConfirm(null)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!user) { onAuthOpen(); return }
    if (!comment.trim()) return
    setSending(true)
    try {
      await addComment(comment)
      setComment('')
    } catch (err) {
      console.error('댓글 작성 실패:', err)
    } finally {
      setSending(false)
    }
  }

  const handleConfirm = async () => {
    if (confirm === 'delete') { await onDeleted(meetup.id); return }
    if (confirm === 'leave') { await handleJoin(); return }
    await deleteComment(confirm)
    setConfirm(null)
  }

  if (loading) {
    return <div className="md-page"><div className="md-container"><p className="md-loading">불러오는 중…</p></div></div>
  }

  if (!meetup) {
    return (
      <div className="md-page">
        <div className="md-container">
          <button className="md-back" onClick={onBack}>← 모임</button>
          <h1 className="md-title">모임을 찾을 수 없어요</h1>
          <p className="md-sub">삭제되었거나 잘못된 주소일 수 있어요.</p>
        </div>
      </div>
    )
  }

  // 대기 중이면 취소만 가능, 정원이 차면 신규 참여 불가
  const joinDisabled = joining || (isFull && !isJoined && !isPending)

  return (
    <div className="md-page">
      <div className="md-container">
        <button className="md-back" onClick={onBack}>← 모임</button>

        {meetup.image && (
          <img src={meetup.image} alt={meetup.title} className="md-cover" />
        )}

        <div className="md-head">
          <span className={`meetup-badge type-${meetup.type}`}>{meetup.type}</span>
          <div className="md-owner-actions">
            <button
              className={`md-save-btn ${isSaved ? 'saved' : ''}`}
              onClick={() => (user ? onToggleSave(meetup.id) : onAuthOpen())}
              aria-pressed={isSaved}
            >
              <svg viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z"/>
              </svg>
              {isSaved ? '찜' : '찜하기'}
            </button>
            {isHost && <button className="md-act" onClick={() => onEdit(meetup)}>수정</button>}
            {canDelete && <button className="md-act danger" onClick={() => setConfirm('delete')}>삭제</button>}
          </div>
        </div>

        <h1 className="md-title">{meetup.title}</h1>

        <div className="md-host-line">
          <span className="md-person">
            {meetup.hostPhoto
              ? <img src={meetup.hostPhoto} alt="" className="md-avatar" />
              : <span className="md-avatar-placeholder">{meetup.host?.[0]?.toUpperCase()}</span>
            }
            {meetup.host}
          </span>
          <span>{formatMeetupDate(meetup.createdAt)}</span>
        </div>

        <dl className="md-info">
          {scheduleText(meetup) && (
            <div><dt>{meetup.type === '클럽' ? '활동 주기' : '일시'}</dt><dd>{scheduleText(meetup)}</dd></div>
          )}
          {meetup.place && (
            <div><dt>{meetup.type === '클럽' ? '활동 지역' : '장소'}</dt><dd>{meetup.place}</dd></div>
          )}
          {meetup.instructor && <div><dt>강사</dt><dd>{meetup.instructor}</dd></div>}
          {meetup.fee && <div><dt>수강료</dt><dd>{meetup.fee}</dd></div>}
          <div>
            <dt>{words.member}</dt>
            <dd>
              {participants.length}명
              {meetup.capacity ? ` / 정원 ${meetup.capacity}명` : ' (제한 없음)'}
              {isFull && <span className="md-full">{words.closed}</span>}
            </dd>
          </div>
        </dl>

        <div className="md-desc">{meetup.description}</div>

        {!isHost && (
          <div className="md-join-bar">
            <button
              className={`md-join-btn ${isJoined ? 'joined' : ''} ${isPending ? 'pending' : ''}`}
              onClick={() => ((isJoined || isPending) ? setConfirm('leave') : handleJoin())}
              disabled={joinDisabled}
            >
              {joining ? '처리 중…'
                : isPending ? '승인 대기 중 · 신청 취소'
                : isJoined ? words.leave
                : isFull ? words.closed
                : requiresApproval ? '가입 신청하기'
                : words.join}
            </button>
            {requiresApproval && !isJoined && !isPending && !isFull && (
              <p className="md-join-note">모임장이 신청을 수락하면 가입돼요.</p>
            )}
          </div>
        )}

        {isHost && requiresApproval && (
          <section className="md-section">
            <h2 className="md-section-title">가입 신청 {requests.length}</h2>
            {requests.length === 0 ? (
              <p className="md-empty-line">대기 중인 신청이 없어요.</p>
            ) : (
              <ul className="md-requests">
                {requests.map(r => (
                  <li key={r.id} className="md-request">
                    <span className="md-person">
                      {r.photo
                        ? <img src={r.photo} alt="" className="md-avatar" />
                        : <span className="md-avatar-placeholder">{r.name?.[0]?.toUpperCase()}</span>
                      }
                      {r.name}
                    </span>
                    <div className="md-request-actions">
                      <button className="md-req-approve" onClick={() => approveRequest(r)}>수락</button>
                      <button className="md-req-reject" onClick={() => rejectRequest(r.id)}>거절</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <section className="md-section">
          <h2 className="md-section-title">{words.member} {participants.length}</h2>
          {participants.length === 0 ? (
            <p className="md-empty-line">아직 {words.member}가 없어요.</p>
          ) : (
            <ul className="md-participants">
              {participants.map(p => (
                <li key={p.id} className="md-person">
                  {p.photo
                    ? <img src={p.photo} alt="" className="md-avatar" />
                    : <span className="md-avatar-placeholder">{p.name?.[0]?.toUpperCase()}</span>
                  }
                  {p.name}
                  {p.id === meetup.hostId && <span className="md-host-tag">{words.hostRole}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="md-section">
          <h2 className="md-section-title">문의 {comments.length}</h2>

          {comments.length === 0 && <p className="md-empty-line">궁금한 점을 물어보세요.</p>}

          <ul className="md-comments">
            {comments.map(c => (
              <li key={c.id} className="md-comment">
                <div className="md-comment-head">
                  <span className="md-person">
                    {c.authorPhoto
                      ? <img src={c.authorPhoto} alt="" className="md-avatar" />
                      : <span className="md-avatar-placeholder">{c.author?.[0]?.toUpperCase()}</span>
                    }
                    {c.author}
                  </span>
                  <span className="md-comment-date">{formatMeetupDate(c.createdAt)}</span>
                  {(isAdmin || (user && c.authorId === user.uid)) && (
                    <button className="md-comment-del" onClick={() => setConfirm(c.id)}>삭제</button>
                  )}
                </div>
                <p className="md-comment-body">{c.content}</p>
              </li>
            ))}
          </ul>

          <form className="md-comment-form" onSubmit={handleAddComment}>
            <textarea
              className="md-comment-input"
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder={user ? '궁금한 점을 남겨보세요' : '로그인하고 문의를 남겨보세요'}
              rows={3}
            />
            <button className="md-comment-submit" type="submit" disabled={sending}>
              {sending ? '등록 중…' : '문의 남기기'}
            </button>
          </form>
        </section>
      </div>

      {confirm && (
        <ConfirmModal
          title={confirm === 'delete' ? '모임 삭제' : confirm === 'leave' ? (isPending ? '신청 취소' : words.leave) : '문의 삭제'}
          message={
            confirm === 'delete' ? `이 모임을 삭제할까요? ${words.member}와 문의도 함께 사라지며 되돌릴 수 없어요.`
              : confirm === 'leave' ? (isPending ? '가입 신청을 취소할까요?' : `정말 ${words.leave.replace('하기', '')}할까요?`)
              : '이 문의를 삭제할까요? 되돌릴 수 없어요.'
          }
          confirmLabel={confirm === 'leave' ? (isPending ? '신청 취소' : words.leave.replace('하기', '')) : '삭제'}
          danger
          onCancel={() => setConfirm(null)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  )
}
