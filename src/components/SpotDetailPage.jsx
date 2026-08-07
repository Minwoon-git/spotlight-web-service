import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { mockSpots } from '../data/mockSpots'
import { reinitSitemap } from '../utils/personalization'
import './SpotDetailPage.css'

const extractTime = (str) => {
  if (!str) return ''
  const match = str.match(/\d{1,2}:\d{2}~\d{1,2}:\d{2}/)
  return match ? match[0] : str
}

const formatDate = (createdAt) => {
  if (!createdAt) return ''
  if (createdAt.toDate) return createdAt.toDate().toLocaleDateString('ko-KR')
  return createdAt
}

export default function SpotDetailPage({ spots = [], onBack, onOpenMap }) {
  const { id } = useParams()
  const [spot, setSpot] = useState(() =>
    spots.find(s => String(s.id) === String(id)) ??
    mockSpots.find(s => String(s.id) === String(id)) ??
    null
  )
  const [loading, setLoading] = useState(!spot)

  useEffect(() => {
    const found = spots.find(s => String(s.id) === String(id))
    if (found) { setSpot(found); setLoading(false); return }
    // 목업이 아닌 Firestore 스팟이면 단건 조회
    if (mockSpots.some(s => String(s.id) === String(id))) return
    let alive = true
    getDoc(doc(db, 'spots', String(id)))
      .then(snap => {
        if (!alive) return
        if (snap.exists()) setSpot({ id: snap.id, ...snap.data() })
        setLoading(false)
      })
      .catch(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [id, spots])

  // 페이지별 메타 태그 (클라이언트 렌더 시)
  useEffect(() => {
    if (!spot) return
    const prevTitle = document.title
    document.title = `${spot.name} — SpotLight 촬영 명소`
    const setMeta = (name, content, attr = 'name') => {
      let el = document.head.querySelector(`meta[${attr}="${name}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }
    const desc = `${spot.address} · ${spot.description ?? ''}`.slice(0, 150)
    setMeta('description', desc)
    setMeta('og:title', `${spot.name} — SpotLight`, 'property')
    setMeta('og:description', desc, 'property')
    if (spot.photos?.[0]) setMeta('og:image', spot.photos[0], 'property')
    return () => { document.title = prevTitle }
  }, [spot])

  // 콘솔 Web Campaign이 #spot-similar-recs 콘텐츠 존에 추천을 주입하려면, 이 요소가
  // DOM에 있는 상태에서 사이트맵(SpotDetail pageType + contentZones)이 평가돼야 한다.
  // /spot/{id} 직접 진입(공유·SEO) 시 비콘은 이 페이지가 렌더되기 전에 사이트맵을
  // 평가하므로, 스팟 로드 후 reinit을 한 번 호출해 요소가 존재하는 상태로 재평가시킨다.
  useEffect(() => {
    if (spot) reinitSitemap()
  }, [spot])

  if (loading) {
    return (
      <div className="spotpage">
        <div className="spotpage-container">
          <p className="spotpage-loading">스팟 정보를 불러오는 중…</p>
        </div>
      </div>
    )
  }

  if (!spot) {
    return (
      <div className="spotpage">
        <div className="spotpage-container">
          <button className="spotpage-back" onClick={onBack}>← 돌아가기</button>
          <h1 className="spotpage-title">스팟을 찾을 수 없어요</h1>
          <p className="spotpage-addr">삭제되었거나 잘못된 주소일 수 있어요.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="spotpage">
      <div className="spotpage-container">
        <button className="spotpage-back" onClick={onBack}>← 목록으로</button>

        <div className="spotpage-tags">
          {(spot.tags ?? []).map(t => <span key={t} className="spotpage-tag">{t}</span>)}
        </div>
        <h1 className="spotpage-title">{spot.name}</h1>
        <p className="spotpage-addr">{spot.address}</p>

        {spot.photos?.length > 0 && (
          <div className="spotpage-gallery">
            {spot.photos.map((p, i) => (
              <img key={i} src={p} alt={`${spot.name} 촬영 명소 사진 ${i + 1}`} loading="lazy" />
            ))}
          </div>
        )}

        <section className="spotpage-section">
          <h2>장소 소개</h2>
          <p className="spotpage-desc">{spot.description}</p>
        </section>

        <section className="spotpage-section">
          <h2>촬영 정보</h2>
          <table className="spotpage-table">
            <tbody>
              <tr>
                <th>주소</th>
                <td>{spot.address}</td>
              </tr>
              {extractTime(spot.bestTime) && (
                <tr>
                  <th>최적 촬영 시간</th>
                  <td>{extractTime(spot.bestTime)}</td>
                </tr>
              )}
              {spot.season && (
                <tr>
                  <th>추천 계절</th>
                  <td>{spot.season}</td>
                </tr>
              )}
              {(spot.tags?.length > 0) && (
                <tr>
                  <th>태그</th>
                  <td>{spot.tags.join(', ')}</td>
                </tr>
              )}
              {spot.author && (
                <tr>
                  <th>등록자</th>
                  <td>{spot.author}</td>
                </tr>
              )}
              {spot.createdAt && (
                <tr>
                  <th>등록일</th>
                  <td>{formatDate(spot.createdAt)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <div className="spotpage-actions">
          <button className="spotpage-btn" onClick={() => onOpenMap?.(spot)}>지도에서 보기</button>
        </div>

        {/* Einstein Personalization "함께 본 스팟" 추천 존.
            콘솔 Web Campaign이 이 요소에 추천 카드를 주입한다. 제목·카드 마크업은
            템플릿에서 렌더하므로, 추천이 없으면 비어 있어 아무것도 보이지 않는다.
            data-spot-id는 참고용(앵커는 SpotDetail pageType의 catalogObject에서 잡힘). */}
        <div id="spot-similar-recs" className="spotpage-recs" data-spot-id={spot.id} />
      </div>
    </div>
  )
}
