import { useState, useRef } from 'react'
import SuccessModal from './SuccessModal'
import LocationPicker from './LocationPicker'
import './RegisterView.css'

const TAG_SUGGESTIONS = [
  '#일출', '#일몰', '#야경', '#새벽', '#안개',
  '#자연', '#숲', '#산', '#강', '#바다', '#호수',
  '#도심', '#골목', '#파노라마',
]

const SEASON_OPTIONS = ['봄', '여름', '가을', '겨울', '사계절']

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

/* ── 메인 등록 페이지 ── */
const FALLBACK_PHOTO = 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format'

// Firestore 문서 1MB 제한 안에 여러 장이 들어가도록 사진당 base64 용량 상한을 둔다.
const MAX_PHOTOS = 4
const PHOTO_BYTE_BUDGET = 180_000 // base64 인코딩 후 기준

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('이미지를 불러올 수 없어요')) }
    img.src = url
  })
}

function drawToDataURL(img, width, quality) {
  const height = Math.round(img.height * width / img.width)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d').drawImage(img, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg', quality)
}

// 목표 용량(PHOTO_BYTE_BUDGET) 아래로 내려갈 때까지 해상도/품질을 단계적으로 낮춘다.
async function compressImage(file, maxBytes = PHOTO_BYTE_BUDGET) {
  const img = await loadImage(file)
  const widths = [1280, 960, 720, 480]
  const qualities = [0.75, 0.6, 0.45]

  let best = null
  for (const width of widths) {
    const targetWidth = Math.min(width, img.width)
    for (const quality of qualities) {
      const dataUrl = drawToDataURL(img, targetWidth, quality)
      best = dataUrl
      if (dataUrl.length <= maxBytes) return dataUrl
    }
  }
  return best
}

export default function RegisterView({ addSpot, updateSpot, editingSpot, onNavigate }) {
  const isEdit = !!editingSpot
  const [form, setForm] = useState(() => isEdit ? {
    name: editingSpot.name ?? '',
    description: editingSpot.description ?? '',
    bestTime: editingSpot.bestTime ?? '',
    season: editingSpot.season ?? '',
    tags: editingSpot.tags ?? [],
    // 기존 사진은 업로드된 URL 그대로 미리 채운다 (file 없음 = 기존 사진)
    photos: (editingSpot.photos ?? []).map(url => ({ url, preview: url })),
    location: { lat: editingSpot.lat, lng: editingSpot.lng, address: editingSpot.address },
  } : {
    name: '', description: '', bestTime: '',
    season: '', tags: [], photos: [], location: null,
  })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const addPhotos = (files) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!imageFiles.length) return
    const previews = imageFiles.map(f => ({ file: f, preview: URL.createObjectURL(f) }))
    setForm(f => ({ ...f, photos: [...f.photos, ...previews].slice(0, MAX_PHOTOS) }))
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

  // 썸네일을 대표 영역으로 드래그해 대표 사진을 바꾼다
  const [dragIndex, setDragIndex] = useState(null)
  const [dragOverMain, setDragOverMain] = useState(false)

  const handleThumbDragStart = (idx) => (e) => {
    setDragIndex(idx)
    e.dataTransfer.effectAllowed = 'move'
  }
  const handleMainDragOver = (e) => {
    if (dragIndex === null) return
    e.preventDefault()
    setDragOverMain(true)
  }
  const handleMainDrop = (e) => {
    e.preventDefault()
    if (dragIndex !== null) moveFirst(dragIndex)
    setDragIndex(null)
    setDragOverMain(false)
  }

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

    setSubmitting(true)
    try {
      let photoUrls
      if (form.photos.length > 0) {
        try {
          // 새로 올린 사진만 압축하고, 기존 사진은 URL을 그대로 유지한다
          const results = await Promise.all(
            form.photos.map(p => p.file ? compressImage(p.file) : p.url)
          )
          photoUrls = results.filter(Boolean)
        } catch {}
      }
      if (!photoUrls || photoUrls.length === 0) {
        photoUrls = [FALLBACK_PHOTO]
      }

      const data = {
        name: form.name,
        address: form.location.address,
        lat: form.location.lat,
        lng: form.location.lng,
        tags: form.tags,
        season: form.season,
        photos: photoUrls,
        description: form.description,
        bestTime: form.bestTime,
      }

      if (isEdit) {
        await updateSpot(editingSpot.id, data)
      } else {
        await addSpot(data)
      }

      setSubmitted(true)
    } catch (err) {
      console.error('스팟 저장 실패:', err)
      setErrors(v => ({ ...v, submit: '저장 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.' }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-page-header">
          <h1>{isEdit ? '스팟 수정' : '스팟 등록'}</h1>
          <p>{isEdit ? '등록한 스팟 정보를 수정하세요.' : '나만 알던 촬영 명소를 지도에 추가해 모두와 공유하세요.'}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ── 상단: 사진 | 기본정보 반반 ── */}
          <div className="register-top">
            <div className="register-left">
              <p className="section-label">
                사진
                {form.photos.length > 0 && (
                  <span className="photo-count">{form.photos.length} / {MAX_PHOTOS}</span>
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
                    <p className="photo-empty-hint">클릭하거나 드래그해서 추가<br/>최대 {MAX_PHOTOS}장 · JPG · PNG · WEBP</p>
                  </div>
                  <input type="file" accept="image/*" multiple onChange={handlePhotoInput} hidden />
                </label>
              ) : (
                <div
                  className={`photo-main-wrap ${dragOverMain ? 'drag-over' : ''}`}
                  onDragOver={handleMainDragOver}
                  onDragLeave={() => setDragOverMain(false)}
                  onDrop={handleMainDrop}
                >
                  <img src={form.photos[0].preview} alt="main" className="photo-main" />
                  <div className="photo-main-badge">대표</div>
                </div>
              )}

              {form.photos.length > 0 && (
                <div className="photo-thumb-grid">
                  {form.photos.map((p, i) => (
                    <div
                      key={i}
                      className={`photo-thumb-item ${i === 0 ? 'is-main' : ''} ${dragIndex === i ? 'dragging' : ''}`}
                      draggable={i !== 0}
                      onDragStart={handleThumbDragStart(i)}
                      onDragEnd={() => { setDragIndex(null); setDragOverMain(false) }}
                    >
                      <img src={p.preview} alt={`photo-${i}`} />
                      {i === 0 && <span className="thumb-main-tag">대표</span>}
                      <div className="thumb-actions">
                        <button type="button" className="thumb-remove" onClick={() => removePhoto(i)}>✕</button>
                      </div>
                    </div>
                  ))}
                  {form.photos.length < MAX_PHOTOS && (
                    <label className="photo-thumb-add">
                      <span>+</span>
                      <input type="file" accept="image/*" multiple onChange={handlePhotoInput} hidden />
                    </label>
                  )}
                </div>
              )}

              {form.photos.length > 1 && (
                <p className="photo-drag-hint">아래 사진을 위 영역으로 드래그하면 대표 사진으로 설정됩니다</p>
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
                  <label>추천 계절</label>
                  <select
                    value={form.season}
                    onChange={e => setForm(f => ({ ...f, season: e.target.value }))}
                    className={`time-select ${!form.season ? 'placeholder' : ''}`}
                  >
                    <option value="">계절 선택</option>
                    {SEASON_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
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

            {errors.submit && <span className="error-msg">⚠ {errors.submit}</span>}

            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? '저장 중...' : (isEdit ? '수정 완료' : '스팟 등록하기')}
            </button>
          </div>
        </form>
      </div>

      {submitted && (
        <SuccessModal
          title={isEdit ? '스팟이 수정되었어요!' : '스팟이 등록되었어요!'}
          message={isEdit ? '변경 내용이 저장되었습니다.' : '지도에 바로 추가되었습니다.\n소중한 명소를 공유해 주셔서 감사합니다.'}
          actions={[
            ...(!isEdit ? [{
              label: '추가 등록하기',
              onClick: () => {
                setSubmitted(false)
                setForm({ name: '', description: '', bestTime: '', seasons: [], tags: [], photos: [], location: null })
                setErrors({})
              },
            }] : []),
            { label: '확인', primary: true, onClick: () => onNavigate('explore') },
          ]}
        />
      )}
    </div>
  )
}
