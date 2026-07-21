import { useState } from 'react'
import { Link } from 'react-router-dom'
import { POST_CATEGORIES } from '../hooks/usePosts'
import './CommunityView.css'

const CATEGORY_DESC = {
  모임: '같이 사진 찍으러 갈 사람을 구해보세요',
  클래스: '원데이 클래스·강좌 정보를 나눠요',
  자유: '사진에 대한 이야기를 자유롭게 나눠요',
}

export function formatPostDate(createdAt) {
  if (!createdAt) return ''
  const d = createdAt.toDate ? createdAt.toDate() : new Date(createdAt)
  if (Number.isNaN(d.getTime())) return ''
  const diff = Date.now() - d.getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return '방금'
  if (min < 60) return `${min}분 전`
  const hour = Math.floor(min / 60)
  if (hour < 24) return `${hour}시간 전`
  const day = Math.floor(hour / 24)
  if (day < 7) return `${day}일 전`
  return d.toLocaleDateString('ko-KR')
}

export default function CommunityView({ posts, loading, onWrite }) {
  const [category, setCategory] = useState('전체')

  const filtered = category === '전체'
    ? posts
    : posts.filter(p => p.category === category)

  return (
    <div className="community-page">
      <div className="community-container">

        <header className="community-header">
          <div>
            <h1 className="community-title">커뮤니티</h1>
            <p className="community-sub">
              함께 출사할 사람을 구하고, 클래스 정보를 나누고, 사진 이야기를 자유롭게 나누는 공간이에요.
            </p>
          </div>
          <button className="community-write-btn" onClick={onWrite}>글쓰기</button>
        </header>

        <div className="community-tabs">
          {['전체', ...POST_CATEGORIES].map(c => (
            <button
              key={c}
              className={`community-tab ${category === c ? 'active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {category !== '전체' && (
          <p className="community-cat-desc">{CATEGORY_DESC[category]}</p>
        )}

        {loading ? (
          <p className="community-empty">불러오는 중…</p>
        ) : filtered.length === 0 ? (
          <div className="community-empty">
            <p>아직 글이 없어요</p>
            <small>첫 글을 남겨보세요!</small>
          </div>
        ) : (
          <ul className="post-list">
            {filtered.map(post => (
              <li key={post.id} className="post-item">
                <Link className="post-link" to={`/community/${post.id}`}>
                  <div className="post-item-top">
                    <span className={`post-badge cat-${post.category}`}>{post.category}</span>
                    <h2 className="post-item-title">{post.title}</h2>
                  </div>

                  {post.category === '모임' && (post.meetupDate || post.meetupPlace) && (
                    <div className="post-meetup">
                      {post.meetupDate && <span>📅 {post.meetupDate}</span>}
                      {post.meetupPlace && <span>📍 {post.meetupPlace}</span>}
                    </div>
                  )}

                  <p className="post-item-excerpt">{post.content}</p>

                  <div className="post-item-meta">
                    <span className="post-author">
                      {post.authorPhoto
                        ? <img src={post.authorPhoto} alt="" className="post-avatar" />
                        : <span className="post-avatar-placeholder">{post.author?.[0]?.toUpperCase()}</span>
                      }
                      {post.author}
                    </span>
                    <span>{formatPostDate(post.createdAt)}</span>
                    <span>댓글 {post.commentCount ?? 0}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
