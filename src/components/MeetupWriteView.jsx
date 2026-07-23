import { useState } from 'react'
import { TYPE_INFO } from '../hooks/useMeetups'
import { compressImage } from '../utils/image'
import LocationPicker from './LocationPicker'
import './MeetupWriteView.css'

export default function MeetupWriteView({
  editingMeetup, initialType = '소셜링', addMeetup, updateMeetup, user, onDone, onCancel,
}) {
  const isEdit = !!editingMeetup
  const [form, setForm] = useState(() => ({
    // 유형은 만들기 전 팝업에서 고르고, 수정 시에는 기존 유형을 유지한다
    type: editingMeetup?.type ?? initialType,
    title: editingMeetup?.title ?? '',
    description: editingMeetup?.description ?? '',
    image: editingMeetup?.image ?? '',
    region: editingMeetup?.region ?? '',
    place: editingMeetup?.place ?? '',
    lat: editingMeetup?.lat ?? null,
    lng: editingMeetup?.lng ?? null,
    date: editingMeetup?.date ?? '',
    time: editingMeetup?.time ?? '',
    schedule: editingMeetup?.schedule ?? '',
    capacity: editingMeetup?.capacity || '',
    fee: editingMeetup?.fee ?? '',
    instructor: editingMeetup?.instructor ?? '',
  }))
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))
  const isClub = form.type === '클럽'
  const isClass = form.type === '원데이클래스'

  const handleImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageLoading(true)
    try {
      const compressed = await compressImage(file)
      if (compressed) set('image', compressed)
    } catch (err) {
      console.error('이미지 처리 실패:', err)
      setErrors(v => ({ ...v, image: '이미지를 불러올 수 없어요' }))
    } finally {
      setImageLoading(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.title.trim()) errs.title = '제목을 입력해주세요'
    if (!form.description.trim()) errs.description = '소개를 입력해주세요'
    if (isClub && !form.schedule.trim()) errs.schedule = '활동 주기를 입력해주세요'
    if (!isClub && !form.date) errs.date = '날짜를 선택해주세요'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    try {
      if (isEdit) {
        await updateMeetup(editingMeetup.id, form)
        onDone(editingMeetup.id)
      } else {
        const created = await addMeetup(form, user)
        onDone(created.id)
      }
    } catch (err) {
      console.error('모임 저장 실패:', err)
      setErrors({ submit: '저장 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mw-page">
      <div className="mw-container">
        <h1 className="mw-title">{isEdit ? '모임 수정' : '모임 만들기'}</h1>

        <form onSubmit={handleSubmit} className="mw-form">
          <div className="mw-type-banner">
            <span className="mw-type-chip">{form.type}</span>
            <span className="mw-type-desc">{TYPE_INFO[form.type].desc}</span>
          </div>

          <div className="mw-field">
            <span className="mw-label">대표 사진</span>
            {form.image ? (
              <div className="mw-image-wrap">
                <img src={form.image} alt="대표 사진" className="mw-image" />
                <button type="button" className="mw-image-remove" onClick={() => set('image', '')}>✕</button>
              </div>
            ) : (
              <label className={`mw-image-drop ${imageLoading ? 'loading' : ''}`}>
                <span className="mw-image-icon">📷</span>
                <span>{imageLoading ? '처리 중…' : '사진 선택하기'}</span>
                <small>모임 분위기를 보여주는 사진을 올려보세요</small>
                <input type="file" accept="image/*" onChange={handleImage} hidden />
              </label>
            )}
            {errors.image && <span className="mw-error">{errors.image}</span>}
          </div>

          <label className="mw-field">
            <span className="mw-label">제목 <b>*</b></span>
            <input
              className={`mw-input ${errors.title ? 'error' : ''}`}
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder={isClass ? '예: 야경 촬영 기초 클래스' : '예: 주말 새벽 한강 출사 같이 가요'}
              maxLength={60}
            />
            {errors.title && <span className="mw-error">{errors.title}</span>}
          </label>

          {isClub ? (
            <label className="mw-field">
              <span className="mw-label">활동 주기 <b>*</b></span>
              <input
                className={`mw-input ${errors.schedule ? 'error' : ''}`}
                value={form.schedule}
                onChange={e => set('schedule', e.target.value)}
                placeholder="예: 매주 토요일 오전"
                maxLength={40}
              />
              {errors.schedule && <span className="mw-error">{errors.schedule}</span>}
            </label>
          ) : (
            <div className="mw-row">
              <label className="mw-field">
                <span className="mw-label">날짜 <b>*</b></span>
                <input
                  className={`mw-input ${errors.date ? 'error' : ''}`}
                  type="date"
                  value={form.date}
                  onChange={e => set('date', e.target.value)}
                />
                {errors.date && <span className="mw-error">{errors.date}</span>}
              </label>
              <label className="mw-field">
                <span className="mw-label">시간</span>
                <input
                  className="mw-input"
                  type="time"
                  value={form.time}
                  onChange={e => set('time', e.target.value)}
                />
              </label>
            </div>
          )}

          {/* 클럽은 활동 범위라 자유 입력, 나머지는 실제 만나는 곳이라 지도에서 고른다 */}
          {isClub ? (
            <div className="mw-row">
              <label className="mw-field">
                <span className="mw-label">활동 지역</span>
                <input
                  className="mw-input"
                  value={form.place}
                  onChange={e => set('place', e.target.value)}
                  placeholder="예: 서울 전역"
                  maxLength={40}
                />
              </label>
              <label className="mw-field">
                <span className="mw-label">정원</span>
                <input
                  className="mw-input"
                  type="number"
                  min="0"
                  value={form.capacity}
                  onChange={e => set('capacity', e.target.value)}
                  placeholder="비워두면 제한 없음"
                />
              </label>
            </div>
          ) : (
            <>
              <div className="mw-field">
                <span className="mw-label">모이는 장소</span>
                <LocationPicker
                  initialAddress={form.place}
                  placeholder="장소명 또는 주소 검색 (예: 반포한강공원)"
                  hint="지도를 클릭하거나 위 검색창으로 모이는 장소를 선택하세요"
                  onSelect={(loc) => {
                    set('place', loc?.address ?? '')
                    set('lat', loc?.lat ?? null)
                    set('lng', loc?.lng ?? null)
                  }}
                />
              </div>
              <label className="mw-field">
                <span className="mw-label">정원</span>
                <input
                  className="mw-input"
                  type="number"
                  min="0"
                  value={form.capacity}
                  onChange={e => set('capacity', e.target.value)}
                  placeholder="비워두면 제한 없음"
                />
              </label>
            </>
          )}

          {isClass && (
            <div className="mw-row">
              <label className="mw-field">
                <span className="mw-label">강사</span>
                <input
                  className="mw-input"
                  value={form.instructor}
                  onChange={e => set('instructor', e.target.value)}
                  placeholder="예: 김作가"
                  maxLength={30}
                />
              </label>
              <label className="mw-field">
                <span className="mw-label">수강료</span>
                <input
                  className="mw-input"
                  value={form.fee}
                  onChange={e => set('fee', e.target.value)}
                  placeholder="예: 30,000원 / 무료"
                  maxLength={20}
                />
              </label>
            </div>
          )}

          <label className="mw-field">
            <span className="mw-label">소개 <b>*</b></span>
            <textarea
              className={`mw-textarea ${errors.description ? 'error' : ''}`}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder={TYPE_INFO[form.type].hint}
              rows={10}
            />
            {errors.description && <span className="mw-error">{errors.description}</span>}
          </label>

          {errors.submit && <p className="mw-error">{errors.submit}</p>}

          <div className="mw-actions">
            <button type="button" className="mw-btn secondary" onClick={onCancel}>취소</button>
            <button type="submit" className="mw-btn primary" disabled={submitting}>
              {submitting ? '저장 중…' : (isEdit ? '수정 완료' : '모임 만들기')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
