import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { mockSpots } from '../data/mockSpots'
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

  // 캠페인이 주입하는 추천 블록(.ein-recs)을 앱에서 직접 보정한다.
  //  1) 캠페인 타겟이 잘못 잡혀 엉뚱한 위치(.spotpage-tags 등)에 주입되면 → #spot-similar-recs로 이동
  //  2) 현재 보고 있는 스팟 자신이 추천에 나오면(자기추천) 해당 카드 제거
  // 캠페인 주입/재주입이 비동기라 MutationObserver로 변화가 있을 때마다 보정한다.
  useEffect(() => {
    const zone = document.getElementById('spot-similar-recs')
    if (!zone) return
    const container = zone.closest('.spotpage-container') || document.body
    const currentPath = `/spot/${id}`
    const fix = () => {
      // 1) 엉뚱한 곳에 주입된 추천 블록을 콘텐츠 존으로 이동
      document.querySelectorAll('.ein-recs').forEach((recs) => {
        if (recs.parentElement !== zone) zone.appendChild(recs)
      })
      // 2) 자기추천 카드 제거
      zone.querySelectorAll('a[href]').forEach((a) => {
        let path = ''
        try { path = new URL(a.getAttribute('href'), window.location.origin).pathname }
        catch { path = a.getAttribute('href') || '' }
        if (path === currentPath) (a.closest('.ein-rec-card') || a).remove()
      })
    }
    fix()
    const obs = new MutationObserver(fix)
    obs.observe(container, { childList: true, subtree: true })
    return () => obs.disconnect()
  }, [id])

  // 추천 존 컨테이너(#spot-similar-recs)는 어느 상태에서도 DOM에 존재해야 한다.
  // Firestore 스팟은 비동기 로딩이라 "로딩 중" 화면 동안에도 이 요소가 있어야
  // 콘솔 사이트맵 평가(및 Sitemap Editor 스냅샷)가 콘텐츠 존을 찾을 수 있다.
  // (reinit은 App.jsx 한 곳에서만 호출해 View 이벤트 중복 발생을 막는다. 이 컨테이너를
  //  항상 렌더해두면 비콘 초기 평가 시점에도 콘텐츠 존이 해결된다.)
  const recsZone = <div id="spot-similar-recs" className="spotpage-recs" data-spot-id={spot?.id ?? id} />

  // "근처 추천 모임" 크로스셀 콘텐츠 존(spot_nearby_meetups). 콘솔 캠페인이 여기에
  // 모임 카드를 인라인으로 주입한다. data-address에 현재 스팟 주소를 실어, 템플릿이
  // 같은 구(區) 모임을 우선 필터링하는 데 쓴다. (스팟 추천 팝업과 달리 본문 흐름 안에 표시.)
  const nearbyMeetupsZone = (
    <div id="spot-nearby-meetups" className="spotpage-nearby-meetups" data-address={spot?.address ?? ''} />
  )

  if (loading) {
    return (
      <div className="spotpage">
        <div className="spotpage-container">
          <p className="spotpage-loading">스팟 정보를 불러오는 중…</p>
          {recsZone}
          {nearbyMeetupsZone}
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
          {recsZone}
          {nearbyMeetupsZone}
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
        {recsZone}

        {/* "근처 추천 모임" 크로스셀 존. 캠페인이 같은 구(區) 모임 카드를 인라인 주입. */}
        {nearbyMeetupsZone}
      </div>
    </div>
  )
}
