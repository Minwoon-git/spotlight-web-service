import { useState, useEffect, useRef } from 'react'
import './LocationPicker.css'

const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_KEY

/* ── 카카오 SDK 보장 로더 ── */
function loadKakaoSDK() {
  return new Promise((resolve) => {
    // 이미 완전히 로드된 경우
    if (window.kakao?.maps?.services) {
      resolve(); return
    }
    // kakao 객체는 있지만 load() 미실행
    if (window.kakao?.maps) {
      window.kakao.maps.load(resolve); return
    }
    // 스크립트 태그가 이미 있는 경우 (다른 페이지에서 추가)
    const existing = document.querySelector('script[data-kakao]')
    if (existing) {
      const onLoad = () => window.kakao.maps.load(resolve)
      if (window.kakao) { onLoad(); return }
      existing.addEventListener('load', onLoad, { once: true })
      return
    }
    // 처음 로드
    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false&libraries=services`
    script.setAttribute('data-kakao', 'true')
    script.async = true
    script.onload = () => window.kakao.maps.load(resolve)
    document.head.appendChild(script)
  })
}

/* ── 지도 주소 선택 컴포넌트 ── */
export default function LocationPicker({ onSelect, initialAddress = '', placeholder, hint }) {
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const mapObjRef = useRef(null)
  const [address, setAddress] = useState(initialAddress)
  const [searchInput, setSearchInput] = useState('')
  const [mapReady, setMapReady] = useState(false)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  // 지도 클릭/검색 결과의 좌표를 주소로 바꿔 상위에 알린다.
  // useEffect보다 먼저 선언해야 effect 안에서 안전하게 참조된다.
  const reverseGeocode = (lng, lat) => {
    const geocoder = new window.kakao.maps.services.Geocoder()
    geocoder.coord2Address(lng, lat, (result, status) => {
      if (status !== window.kakao.maps.services.Status.OK) return
      const found = result[0]
      const addr = found.road_address
        ? found.road_address.address_name
        : found.address.address_name
      setAddress(addr)
      onSelect({ lat, lng, address: addr })
    })
  }

  useEffect(() => {
    if (!KAKAO_KEY) return
    loadKakaoSDK().then(() => {
      if (!mapRef.current || mapObjRef.current) return
      const { Map, LatLng, Marker, event } = window.kakao.maps

      const map = new Map(mapRef.current, {
        center: new LatLng(37.5665, 126.9780),
        level: 7,
      })
      mapObjRef.current = map
      markerRef.current = new Marker({ map: null })
      setTimeout(() => map.relayout(), 100)

      event.addListener(map, 'click', (e) => {
        const latlng = e.latLng
        markerRef.current.setPosition(latlng)
        markerRef.current.setMap(map)
        reverseGeocode(latlng.getLng(), latlng.getLat())
      })

      setMapReady(true)
    })
  }, [])

  const handleSearch = () => {
    const q = searchInput.trim()
    if (!q || !mapObjRef.current) return

    setSearching(true)
    setSearchError('')

    const { services, LatLng } = window.kakao.maps
    const ps = new services.Places()

    ps.keywordSearch(q, (data, status) => {
      setSearching(false)
      if (status === services.Status.ZERO_RESULT) {
        setSearchError('검색 결과가 없어요. 다른 키워드를 입력해보세요.')
        return
      }
      if (status !== services.Status.OK) {
        setSearchError('검색 중 오류가 발생했어요.')
        return
      }
      const first = data[0]
      const lat = parseFloat(first.y)
      const lng = parseFloat(first.x)
      const latlng = new LatLng(lat, lng)
      mapObjRef.current.setCenter(latlng)
      mapObjRef.current.setLevel(4)
      markerRef.current.setPosition(latlng)
      markerRef.current.setMap(mapObjRef.current)
      reverseGeocode(lng, lat)
    })
  }

  return (
    <div className="location-picker">
      <div className="location-search">
        <input
          type="text"
          placeholder={placeholder ?? '장소명 또는 주소 검색 (예: 북한산, 반포한강공원)'}
          value={searchInput}
          onChange={e => { setSearchInput(e.target.value); setSearchError('') }}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearch() } }}
        />
        <button type="button" onClick={handleSearch} disabled={searching}>
          {searching ? '검색 중' : '검색'}
        </button>
      </div>

      {searchError && <p className="search-error">{searchError}</p>}

      <div className="location-map-wrap">
        {KAKAO_KEY ? (
          <div ref={mapRef} className="location-map" />
        ) : (
          <div className="location-map-placeholder">
            <p>Kakao Maps API 키가 필요합니다</p>
          </div>
        )}
        {!mapReady && KAKAO_KEY && (
          <div className="map-loading">지도 불러오는 중...</div>
        )}
      </div>

      {address ? (
        <div className="location-result">
          <span className="location-pin" />
          <span className="location-addr">{address}</span>
          <button type="button" className="location-clear" onClick={() => {
            setAddress('')
            markerRef.current?.setMap(null)
            onSelect(null)
          }}>✕</button>
        </div>
      ) : (
        <p className="location-hint">{hint ?? '지도를 클릭하거나 위 검색창으로 위치를 선택하세요'}</p>
      )}
    </div>
  )
}
