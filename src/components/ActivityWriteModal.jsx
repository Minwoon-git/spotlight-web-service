import { useState } from 'react'
import { compressImage } from '../utils/image'
import './ActivityWriteModal.css'

const MAX_PHOTOS = 6

export default function ActivityWriteModal({ members = [], onSubmit, onClose }) {
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({ title: '', date: today, place: '', note: '' })
  const [photos, setPhotos] = useState([]) // 압축된 dataURL 목록
  const [attendeeIds, setAttendeeIds] = useState([])
  const [errors, setErrors] = useState({})
  const [imgLoading, setImgLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleAttendee = (id) =>
    setAttendeeIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id])

  const handlePhotos = async (e) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'))
    if (!files.length) return
    setImgLoading(true)
    try {
      const room = MAX_PHOTOS - photos.length
      const results = await Promise.all(files.slice(0, room).map(f => compressImage(f)))
      setPhotos(p => [...p, ...results.filter(Boolean)])
    } catch (err) {
      console.error('사진 처리 실패:', err)
      setErrors(v => ({ ...v, photos: '사진을 불러올 수 없어요' }))
    } finally {
      setImgLoading(false)
      e.target.value = ''
    }
  }

  const removePhoto = (i) => setPhotos(p => p.filter((_, idx) => idx !== i))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.title.trim()) errs.title = '제목을 입력해주세요'
    if (!form.date) errs.date = '날짜를 선택해주세요'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    try {
      const attendees = members
        .filter(m => attendeeIds.includes(m.id))
        .map(m => ({ id: m.id, name: m.name, photo: m.photo ?? null }))
      await onSubmit({ ...form, photos, attendees })
      onClose()
    } catch (err) {
      console.error('후기 저장 실패:', err)
      setErrors({ submit: '저장 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.' })
      setSubmitting(false)
    }
  }

  return (
    <div className="activity-overlay" onClick={onClose}>
      <div className="activity-modal" onClick={e => e.stopPropagation()}>
        <div className="activity-modal-head">
          <h2>모임 후기 남기기</h2>
          <button type="button" className="activity-close" onClick={onClose} aria-label="닫기">✕</button>
        </div>

        <form className="activity-form" onSubmit={handleSubmit}>
          <label className="activity-field">
            <span className="activity-label">제목 <b>*</b></span>
            <input
              className={`activity-input ${errors.title ? 'error' : ''}`}
              value={form.title}
              onChange={e => { set('title', e.target.value); setErrors(v => ({ ...v, title: '' })) }}
              placeholder="예: 남산 야경 출사"
              maxLength={50}
            />
            {errors.title && <span className="activity-error">{errors.title}</span>}
          </label>

          <div className="activity-row">
            <label className="activity-field">
              <span className="activity-label">날짜 <b>*</b></span>
              <input
                className={`activity-input ${errors.date ? 'error' : ''}`}
                type="date"
                value={form.date}
                onChange={e => set('date', e.target.value)}
              />
              {errors.date && <span className="activity-error">{errors.date}</span>}
            </label>
            <label className="activity-field">
              <span className="activity-label">장소</span>
              <input
                className="activity-input"
                value={form.place}
                onChange={e => set('place', e.target.value)}
                placeholder="예: 남산타워"
                maxLength={40}
              />
            </label>
          </div>

          <label className="activity-field">
            <span className="activity-label">후기</span>
            <textarea
              className="activity-textarea"
              value={form.note}
              onChange={e => set('note', e.target.value)}
              placeholder="이 날 어땠는지, 어떤 사진을 담았는지 자유롭게 적어보세요."
              rows={5}
            />
          </label>

          <div className="activity-field">
            <span className="activity-label">
              사진
              {photos.length > 0 && <span className="activity-count">{photos.length} / {MAX_PHOTOS}</span>}
            </span>
            <div className="activity-photo-grid">
              {photos.map((src, i) => (
                <div key={i} className="activity-photo-item">
                  <img src={src} alt={`후기 사진 ${i + 1}`} />
                  <button type="button" className="activity-photo-remove" onClick={() => removePhoto(i)}>✕</button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <label className={`activity-photo-add ${imgLoading ? 'loading' : ''}`}>
                  <span>{imgLoading ? '…' : '+'}</span>
                  <input type="file" accept="image/*" multiple onChange={handlePhotos} hidden />
                </label>
              )}
            </div>
            {errors.photos && <span className="activity-error">{errors.photos}</span>}
          </div>

          {members.length > 0 && (
            <div className="activity-field">
              <span className="activity-label">참여 멤버</span>
              <div className="activity-members">
                {members.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    className={`activity-member ${attendeeIds.includes(m.id) ? 'selected' : ''}`}
                    onClick={() => toggleAttendee(m.id)}
                  >
                    {m.photo
                      ? <img src={m.photo} alt="" className="activity-member-avatar" />
                      : <span className="activity-member-avatar placeholder">{m.name?.[0]?.toUpperCase()}</span>
                    }
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {errors.submit && <p className="activity-error">{errors.submit}</p>}

          <div className="activity-actions">
            <button type="button" className="activity-btn secondary" onClick={onClose}>취소</button>
            <button type="submit" className="activity-btn primary" disabled={submitting}>
              {submitting ? '저장 중…' : '후기 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
