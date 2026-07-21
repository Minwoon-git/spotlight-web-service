import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { usePost, bumpViews } from '../hooks/usePosts'
import { formatPostDate } from './CommunityView'
import ConfirmModal from './ConfirmModal'
import './PostDetailView.css'

export default function PostDetailView({ user, isAdmin, onBack, onEdit, onDeletePost, onAuthOpen }) {
  const { id } = useParams()
  const { post, loading, comments, addComment, deleteComment } = usePost(id, user)
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null) // 'post' | commentId

  useEffect(() => { if (id) bumpViews(id) }, [id])

  const isOwner = !!user && post?.authorId === user.uid
  const canDeletePost = isOwner || isAdmin

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

  const handleConfirmDelete = async () => {
    if (confirmDelete === 'post') {
      await onDeletePost(post.id)
    } else {
      await deleteComment(confirmDelete)
    }
    setConfirmDelete(null)
  }

  if (loading) {
    return <div className="postdetail-page"><div className="postdetail-container"><p className="pd-loading">불러오는 중…</p></div></div>
  }

  if (!post) {
    return (
      <div className="postdetail-page">
        <div className="postdetail-container">
          <button className="pd-back" onClick={onBack}>← 커뮤니티</button>
          <h1 className="pd-title">글을 찾을 수 없어요</h1>
          <p className="pd-meta-line">삭제되었거나 잘못된 주소일 수 있어요.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="postdetail-page">
      <div className="postdetail-container">
        <button className="pd-back" onClick={onBack}>← 커뮤니티</button>

        <div className="pd-head">
          <span className={`post-badge cat-${post.category}`}>{post.category}</span>
          {(isOwner || canDeletePost) && (
            <div className="pd-owner-actions">
              {isOwner && <button className="pd-act" onClick={() => onEdit(post)}>수정</button>}
              {canDeletePost && <button className="pd-act danger" onClick={() => setConfirmDelete('post')}>삭제</button>}
            </div>
          )}
        </div>

        <h1 className="pd-title">{post.title}</h1>

        <div className="pd-meta-line">
          <span className="pd-author">
            {post.authorPhoto
              ? <img src={post.authorPhoto} alt="" className="pd-avatar" />
              : <span className="pd-avatar-placeholder">{post.author?.[0]?.toUpperCase()}</span>
            }
            {post.author}
          </span>
          <span>{formatPostDate(post.createdAt)}</span>
          <span>조회 {post.views ?? 0}</span>
        </div>

        {post.category === '모임' && (post.meetupDate || post.meetupPlace) && (
          <div className="pd-meetup">
            {post.meetupDate && <div><span className="pd-meetup-label">날짜</span>{post.meetupDate}</div>}
            {post.meetupPlace && <div><span className="pd-meetup-label">장소</span>{post.meetupPlace}</div>}
          </div>
        )}

        <div className="pd-content">{post.content}</div>

        <section className="pd-comments">
          <h2 className="pd-comments-title">댓글 {comments.length}</h2>

          {comments.length === 0 && <p className="pd-no-comment">첫 댓글을 남겨보세요.</p>}

          <ul className="pd-comment-list">
            {comments.map(c => (
              <li key={c.id} className="pd-comment">
                <div className="pd-comment-head">
                  <span className="pd-author">
                    {c.authorPhoto
                      ? <img src={c.authorPhoto} alt="" className="pd-avatar" />
                      : <span className="pd-avatar-placeholder">{c.author?.[0]?.toUpperCase()}</span>
                    }
                    {c.author}
                  </span>
                  <span className="pd-comment-date">{formatPostDate(c.createdAt)}</span>
                  {(isAdmin || (user && c.authorId === user.uid)) && (
                    <button className="pd-comment-del" onClick={() => setConfirmDelete(c.id)}>삭제</button>
                  )}
                </div>
                <p className="pd-comment-body">{c.content}</p>
              </li>
            ))}
          </ul>

          <form className="pd-comment-form" onSubmit={handleAddComment}>
            <textarea
              className="pd-comment-input"
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder={user ? '댓글을 입력하세요' : '로그인하고 댓글을 남겨보세요'}
              rows={3}
            />
            <button className="pd-comment-submit" type="submit" disabled={sending}>
              {sending ? '등록 중…' : '댓글 등록'}
            </button>
          </form>
        </section>
      </div>

      {confirmDelete && (
        <ConfirmModal
          title={confirmDelete === 'post' ? '글 삭제' : '댓글 삭제'}
          message={confirmDelete === 'post'
            ? '이 글을 삭제할까요? 댓글도 함께 사라지며 되돌릴 수 없어요.'
            : '이 댓글을 삭제할까요? 되돌릴 수 없어요.'}
          confirmLabel="삭제"
          danger
          onCancel={() => setConfirmDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  )
}
