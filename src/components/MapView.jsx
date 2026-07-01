import { useEffect, useRef, useState } from 'react'
import SpotCard from './SpotCard'
import './MapView.css'

const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_KEY

export default function MapView({ spots, onSelectSpot, savedSpots, onRegister, user, onAuthOpen }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markersRef = useRef([])
  const [mapReady, setMapReady] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 768)
  const [previewSpot, setPreviewSpot] = useState(null)

  const [sortOrder, setSortOrder] = useState('인기순')
  const [seasonFilter, setSeasonFilter] = useState('전체')
  const [timeFilter, setTimeFilter] = useState('전체')

  const TIME_SLOTS = ['전체', '새벽', '오전', '오후', '일몰', '야경']
  const SEASON_OPTIONS = ['전체', '봄', '여름', '가을', '겨울']

  const getTimeSlot = (bestTime) => {
    if (!bestTime || bestTime === '시간 무관') return null
    const m = bestTime.match(/^(\d{2}):(\d{2})/)
    if (!m) return null
    const h = parseInt(m[1]) + parseInt(m[2]) / 60
    if (h < 7) return '새벽'
    if (h < 12) return '오전'
    if (h < 17) return '오후'
    if (h < 19.5) return '일몰'
    return '야경'
  }

  const filteredSpots = spots
    .filter(spot => {
      const matchSeason =
        seasonFilter === '전체' ||
        (spot.seasons ?? []).includes(seasonFilter)
      const matchTime =
        timeFilter === '전체' ||
        getTimeSlot(spot.bestTime) === timeFilter
      const matchSearch =
        !searchQuery ||
        spot.name.includes(searchQuery) ||
        spot.address.includes(searchQuery) ||
        (spot.tags ?? []).some(t => t.includes(searchQuery))
      return matchSeason && matchTime && matchSearch
    })
    .sort((a, b) => {
      if (sortOrder === '인기순') return (b.likes ?? 0) - (a.likes ?? 0)
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt ?? 0)
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt ?? 0)
      return dateB - dateA
    })

  useEffect(() => {
    if (!mapInstance.current || window.innerWidth > 768) return
    const panAmount = sidebarOpen ? 80 : -80
    mapInstance.current.panBy(0, panAmount)
  }, [sidebarOpen])

  useEffect(() => {
    if (!mapInstance.current || !window.kakao?.maps) return
    const timer = setTimeout(() => {
      const map = mapInstance.current
      if (!map) return
      const { LatLng, LatLngBounds } = window.kakao.maps
      const isMobile = window.innerWidth <= 768
      const sheetOffset = isMobile && sidebarOpen ? Math.round(window.innerHeight * 0.46 / 2) : 0

      if (!searchQuery && seasonFilter === '전체' && timeFilter === '전체') {
        const defaultLat = isMobile && sidebarOpen ? 37.52 : 37.5665
        map.setCenter(new LatLng(defaultLat, 126.9780))
        map.setLevel(9)
        return
      }
      if (filteredSpots.length === 0) return
      if (filteredSpots.length === 1) {
        map.setCenter(new LatLng(filteredSpots[0].lat, filteredSpots[0].lng))
        map.setLevel(4)
        if (sheetOffset) map.panBy(0, sheetOffset)
      } else {
        const bounds = new LatLngBounds()
        filteredSpots.forEach(s => bounds.extend(new LatLng(s.lat, s.lng)))
        map.setBounds(bounds, isMobile ? sheetOffset + 40 : 80)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, seasonFilter, timeFilter, filteredSpots, sidebarOpen])

  useEffect(() => {
    if (!KAKAO_KEY) return

    const load = () => window.kakao.maps.load(() => {
      if (mapRef.current) initMap()
    })

    if (window.kakao?.maps) {
      load(); return
    }

    if (document.querySelector('script[data-kakao]')) {
      window.addEventListener('kakaoReady', initMap, { once: true }); return
    }

    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false&libraries=services`
    script.setAttribute('data-kakao', 'true')
    script.async = true
    script.onload = () => {
      window.kakao.maps.load(() => {
        window.dispatchEvent(new Event('kakaoReady'))
        if (mapRef.current) initMap()
      })
    }
    document.head.appendChild(script)
  }, [])

  function initMap() {
    if (!mapRef.current) return
    const { Map, LatLng, Marker, InfoWindow, event } = window.kakao.maps

    const saved = JSON.parse(localStorage.getItem('mapState') || 'null')
    const center = saved
      ? new LatLng(saved.lat, saved.lng)
      : new LatLng(37.5665, 126.9780)
    const level = saved?.level ?? 9

    const map = new Map(mapRef.current, { center, level })
    mapInstance.current = map

    const saveMapState = () => {
      const c = map.getCenter()
      localStorage.setItem('mapState', JSON.stringify({
        lat: c.getLat(), lng: c.getLng(), level: map.getLevel()
      }))
    }
    event.addListener(map, 'dragend', saveMapState)
    event.addListener(map, 'zoom_changed', saveMapState)

    event.addListener(map, 'click', () => setPreviewSpot(null))

    setMapReady(true)
  }

  useEffect(() => {
    const map = mapInstance.current
    if (!map || !window.kakao?.maps) return
    const { LatLng, Marker, InfoWindow, event } = window.kakao.maps

    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    spots.forEach(spot => {
      const pos = new LatLng(spot.lat, spot.lng)
      const marker = new Marker({ position: pos, map })
      markersRef.current.push(marker)

      const infoContent = `
        <div style="padding:6px 10px;font-size:12px;font-weight:600;
          color:#111827;border-radius:6px;white-space:nowrap;">
          ${spot.name}
        </div>`
      const infoWindow = new InfoWindow({ content: infoContent, removable: false })

      event.addListener(marker, 'mouseover', () => infoWindow.open(map, marker))
      event.addListener(marker, 'mouseout', () => infoWindow.close())
      event.addListener(marker, 'click', () => setPreviewSpot(spot))
    })
  }, [spots, mapReady])

  return (
    <div className="map-view">
      {/* Sidebar */}
      <aside className={`map-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>

        <div className="sidebar-top" onClick={() => setSidebarOpen(v => !v)}>
          <div className="sidebar-title-row">
            <div>
              <h2 className="sidebar-title">스팟 탐색</h2>
              <p className="sidebar-subtitle">서울의 숨은 명소를 찾아보세요</p>
            </div>
            <span className="sidebar-badge">{filteredSpots.length}</span>
          </div>
        </div>

        <div className="sidebar-header">
          <div className="sidebar-search">
            <svg className="search-svg" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="장소, 지역, 태그 검색"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>

          <div className="filter-dropdowns">
            <div className="filter-dropdown-wrap">
              <label className="filter-dropdown-label">계절</label>
              <select
                className={`filter-dropdown ${seasonFilter !== '전체' ? 'active' : ''}`}
                value={seasonFilter}
                onChange={e => setSeasonFilter(e.target.value)}
              >
                {SEASON_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="filter-dropdown-wrap">
              <label className="filter-dropdown-label">시간대</label>
              <select
                className={`filter-dropdown ${timeFilter !== '전체' ? 'active' : ''}`}
                value={timeFilter}
                onChange={e => setTimeFilter(e.target.value)}
              >
                {TIME_SLOTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="sidebar-count">
            <span>{filteredSpots.length}개의 스팟</span>
            <div className="sort-tabs">
              {['인기순', '최신순'].map(s => (
                <button
                  key={s}
                  className={`sort-tab ${sortOrder === s ? 'active' : ''}`}
                  onClick={() => setSortOrder(s)}
                >{s}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="sidebar-list">
          {filteredSpots.map(spot => (
            <SpotCard
              key={spot.id}
              spot={spot}
              compact
              onClick={() => onSelectSpot(spot)}
              isSaved={savedSpots.includes(spot.id)}
            />
          ))}
          {filteredSpots.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon" />
              <p>검색 결과가 없어요</p>
              <small>다른 키워드로 검색해보세요</small>
            </div>
          )}
          {!user && (
            <div className="login-nudge">
              <div className="login-nudge-icon">🔒</div>
              <p className="login-nudge-title">더 많은 스팟이 있어요</p>
              <p className="login-nudge-sub">로그인하면 사용자들이 공유한 숨은 명소를 모두 볼 수 있어요.</p>
              <button className="login-nudge-btn" onClick={onAuthOpen}>로그인하기</button>
            </div>
          )}
        </div>
      </aside>

      {/* Toggle button */}
      <button
        className={`sidebar-toggle ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(v => !v)}
        title={sidebarOpen ? '목록 닫기' : '목록 열기'}
      >
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d={sidebarOpen ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'}
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Map area */}
      <div className="map-area">
        {KAKAO_KEY ? (
          <div ref={mapRef} className="kakao-map" />
        ) : (
          <MockMap spots={filteredSpots} onSelectSpot={setPreviewSpot} />
        )}

        {!KAKAO_KEY && (
          <div className="map-notice">
            <strong>Kakao Maps</strong> API 키를 <code>.env</code> 파일에 추가하면 실제 지도가 표시됩니다.
          </div>
        )}

        {/* 마커 클릭 프리뷰 카드 */}
        {previewSpot && (
          <div className="map-preview-card" onClick={e => e.stopPropagation()}>
            <div className="preview-img">
              <img src={previewSpot.photos[0]} alt={previewSpot.name} />
            </div>
            <div className="preview-body">
              <div className="preview-tags">
                {previewSpot.tags.slice(0, 3).map(t => (
                  <span key={t} className="preview-tag">{t}</span>
                ))}
              </div>
              <h3 className="preview-name">{previewSpot.name}</h3>
              <p className="preview-addr">{previewSpot.address}</p>
              <div className="preview-meta">
                <span>좋아요 {previewSpot.likes.toLocaleString()}</span>
                <span>·</span>
                <span>{previewSpot.bestTime}</span>
              </div>
            </div>
            <div className="preview-actions">
              <button className="preview-detail" onClick={() => { onSelectSpot(previewSpot); setPreviewSpot(null) }}>
                자세히 보기
              </button>
              <button className="preview-close" onClick={() => setPreviewSpot(null)}>✕</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MockMap({ spots, onSelectSpot }) {
  return (
    <div className="mock-map">
      <div className="mock-map-bg" />
      <div className="mock-map-label">지도 영역 (Kakao Maps)</div>
      <div className="mock-markers">
        {spots.map((spot, i) => {
          const positions = [
            { top: '30%', left: '45%' },
            { top: '55%', left: '46%' },
            { top: '62%', left: '50%' },
            { top: '45%', left: '30%' },
          ]
          const pos = positions[i] || { top: `${20 + i * 8}%`, left: `${40 + i * 5}%` }
          return (
            <button
              key={spot.id}
              className="mock-marker"
              style={pos}
              onClick={(e) => { e.stopPropagation(); onSelectSpot(spot) }}
              title={spot.name}
            >
              <span className="marker-dot" />
              <span className="marker-label">{spot.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
