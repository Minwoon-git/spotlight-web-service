import { useState, useEffect, useRef } from 'react'
import './RegisterView.css'

const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_KEY

const TAG_SUGGESTIONS = [
  '#일출', '#일몰', '#야경', '#새벽', '#안개',
  '#자연', '#숲', '#산', '#강', '#바다', '#호수',
  '#도심', '#골목', '#전통', '#파노라마', '#황금빛',
]

/* ── 태그 입력 컴포넌트 ── */
function TagInput({ tags, onChange }) {
  const [input, setInput] = useState('')
  const inputRef = useRef(null)

  const addTag = (raw) => {
    const cleaned = raw.trim().replace(/,/g, '')
    if (!cleaned) return
    const tag = cleaned.startsWith('#') ? cleaned : `#${cleaned}`
    if (!tags.includes(tag)) onChange([...tags, tag])
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
      setInput('')
    } else if (e.key === 'Backspace' && !input) {
      onChange(tags.slice(0, -1))
    }
  }

  const removeTag = (tag) => onChange(tags.filter(t => t !== tag))

  return (
    <div className="tag-input-root">
      <div className="tag-chips-wrap" onClick={() => inputRef.current?.focus()}>
        {tags.map(tag => (
          <span key={tag} className="tag-chip">
            {tag}
            <button type="button" className="chip-remove" onClick={() => removeTag(tag)}>×</button>
          </span>
        ))}
        <input
          ref={inputRef}
          className="tag-text-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? '태그 입력 후 Enter' : ''}
        />
      </div>
      <div className="tag-suggestions">
        <span className="suggestion-label">추천</span>
        {TAG_SUGGESTIONS.filter(s => !tags.includes(s)).map(s => (
          <button
            key={s}
            type="button"
            className="suggestion-pill"
            onClick={() => addTag(s)}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

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
function LocationPicker({ onSelect }) {
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const mapObjRef = useRef(null)
  const [address, setAddress] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [mapReady, setMapReady] = useState(false)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  useEffect(() => {
    if (!KAKAO_KEY) return
    loadKakaoSDK().then(() => {
      if (!mapRef.current || mapObjRef.current) return
      const { Map, LatLng, Marker, services, event } = window.kakao.maps

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
          placeholder="장소명 또는 주소 검색 (예: 북한산, 반포한강공원)"
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
        <p className="location-hint">지도를 클릭하거나 위 검색창으로 위치를 선택하세요</p>
      )}
    </div>
  )
}

/* ── 메인 등록 페이지 ── */
const FALLBACK_PHOTO = 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format'

function compressImage(file, maxWidth = 1920, quality = 0.85) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > maxWidth) {
        height = Math.round(height * maxWidth / width)
        width = maxWidth
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => resolve(null)
    img.src = url
  })
}

export default function RegisterView({ addSpot, onNavigate }) {
  const [form, setForm] = useState({
    name: '', description: '', bestTime: '',
    tags: [], photos: [], location: null,
  })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const addPhotos = (files) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!imageFiles.length) return
    const previews = imageFiles.map(f => ({ file: f, preview: URL.createObjectURL(f) }))
    setForm(f => ({ ...f, photos: [...f.photos, ...previews].slice(0, 5) }))
  }

  const handlePhotoInput = (e) => addPhotos(e.target.files)

  const handleDrop = (e) => {
    e.preventDefault()
    addPhotos(e.dataTransfer.files)
  }

  const removePhoto = (idx) =>
    setForm(f => ({ ...f, photos: f.photos.filter((_, i) => i !== idx) }))

  const moveFirst = (idx) =>
    setForm(f => {
      const arr = [...f.photos]
      const [item] = arr.splice(idx, 1)
      return { ...f, photos: [item, ...arr] }
    })

  const validate = () => {
    const e = {}
    if (!form.name.trim())     e.name     = '스팟 이름을 입력해주세요'
    if (!form.location)        e.location = '지도에서 위치를 선택해주세요'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    let photoUrls = [FALLBACK_PHOTO]
    if (form.photos.length > 0) {
      try {
        const results = await Promise.all(form.photos.map(p => compressImage(p.file)))
        photoUrls = results.filter(Boolean)
      } catch {}
    }

    addSpot({
      name: form.name,
      address: form.location.address,
      lat: form.location.lat,
      lng: form.location.lng,
      tags: form.tags,
      photos: photoUrls,
      description: form.description,
      bestTime: form.bestTime,
    })

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="register-page">
        <div className="register-success">
          <div className="success-icon" />
          <h2>스팟이 등록되었어요!</h2>
          <p>지도에 바로 추가되었습니다.<br />소중한 명소를 공유해 주셔서 감사합니다.</p>
          <div className="success-actions">
            <button className="btn-outline" onClick={() => {
              setSubmitted(false)
              setForm({ name:'', description:'', bestTime:'', tags:[], photos:[], location:null })
              setErrors({})
            }}>추가 등록하기</button>
            <button className="btn-filled" onClick={() => onNavigate('explore')}>지도에서 보기</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-page-header">
          <h1>스팟 등록</h1>
          <p>나만 알던 촬영 명소를 지도에 추가해 모두와 공유하세요.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ── 상단: 사진 | 기본정보 반반 ── */}
          <div className="register-top">
            <div className="register-left">
              <p className="section-label">
                사진
                {form.photos.length > 0 && (
                  <span className="photo-count">{form.photos.length} / 5</span>
                )}
              </p>

              {form.photos.length === 0 ? (
                <label
                  className="photo-drop"
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  <div className="photo-empty">
                    <div className="photo-empty-icon" />
                    <p className="photo-empty-title">사진 업로드</p>
                    <p className="photo-empty-hint">클릭하거나 드래그해서 추가<br/>최대 5장 · JPG · PNG · WEBP</p>
                  </div>
                  <input type="file" accept="image/*" multiple onChange={handlePhotoInput} hidden />
                </label>
              ) : (
                <div className="photo-main-wrap">
                  <img src={form.photos[0].preview} alt="main" className="photo-main" />
                  <div className="photo-main-badge">대표</div>
                </div>
              )}

              {form.photos.length > 0 && (
                <div className="photo-thumb-grid">
                  {form.photos.map((p, i) => (
                    <div key={i} className={`photo-thumb-item ${i === 0 ? 'is-main' : ''}`}>
                      <img src={p.preview} alt={`photo-${i}`} />
                      <div className="thumb-actions">
                        {i !== 0 && (
                          <button type="button" className="thumb-btn" onClick={() => moveFirst(i)}>대표</button>
                        )}
                        <button type="button" className="thumb-remove" onClick={() => removePhoto(i)}>✕</button>
                      </div>
                    </div>
                  ))}
                  {form.photos.length < 5 && (
                    <label className="photo-thumb-add">
                      <span>+</span>
                      <input type="file" accept="image/*" multiple onChange={handlePhotoInput} hidden />
                    </label>
                  )}
                </div>
              )}
            </div>

            <div className="register-right">
              <div className="form-section register-right-section">
                <p className="section-label">기본 정보</p>
                <div className="form-group">
                  <label>스팟 이름 <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="예: 북한산 소나무 숲 전망대"
                    value={form.name}
                    onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(v => ({ ...v, name: '' })) }}
                  />
                  {errors.name && <span className="error-msg">⚠ {errors.name}</span>}
                </div>
                <div className="form-group">
                  <label>최적 촬영 시간</label>
                  <select
                    value={form.bestTime}
                    onChange={e => setForm(f => ({ ...f, bestTime: e.target.value }))}
                    className={`time-select ${!form.bestTime ? 'placeholder' : ''}`}
                  >
                    <option value="">시간대 선택</option>
                    <option value="04:00~06:00">04:00~06:00</option>
                    <option value="06:00~07:30">06:00~07:30</option>
                    <option value="07:30~12:00">07:30~12:00</option>
                    <option value="12:00~14:00">12:00~14:00</option>
                    <option value="14:00~17:00">14:00~17:00</option>
                    <option value="17:00~19:30">17:00~19:30</option>
                    <option value="19:30~21:00">19:30~21:00</option>
                    <option value="21:00~24:00">21:00~24:00</option>
                    <option value="시간 무관">시간 무관</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>태그</label>
                  <TagInput tags={form.tags} onChange={tags => setForm(f => ({ ...f, tags }))} />
                </div>
                <div className="form-group">
                  <label>스팟 소개</label>
                  <textarea
                    placeholder="이 장소의 특징, 촬영 팁, 방문 시 주의사항 등을 자유롭게 적어주세요."
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={5}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── 하단: 위치 + 등록 버튼 ── */}
          <div className="register-bottom">
            <div className="form-section">
              <p className="section-label">위치 <span className="required">*</span></p>
              <LocationPicker onSelect={loc => { setForm(f => ({ ...f, location: loc })); setErrors(v => ({ ...v, location: '' })) }} />
              {errors.location && <span className="error-msg">⚠ {errors.location}</span>}
            </div>

            <button type="submit" className="btn-submit">
              스팟 등록하기
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
