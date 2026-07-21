import { useState } from 'react'
import { POST_CATEGORIES } from '../hooks/usePosts'
import './PostWriteView.css'

export default function PostWriteView({ editingPost, addPost, updatePost, user, onDone, onCancel }) {
  const isEdit = !!editingPost
  const [form, setForm] = useState(() => ({
    category: editingPost?.category ?? '모임',
    title: editingPost?.title ?? '',
    content: editingPost?.content ?? '',
    meetupDate: editingPost?.meetupDate ?? '',
    meetupPlace: editingPost?.meetupPlace ?? '',
  }))
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.title.trim()) errs.title = '제목을 입력해주세요'
    if (!form.content.trim()) errs.content = '내용을 입력해주세요'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    try {
      if (isEdit) {
        await updatePost(editingPost.id, form)
        onDone(editingPost.id)
      } else {
        const created = await addPost(form, user)
        onDone(created.id)
      }
    } catch (err) {
      console.error('글 저장 실패:', err)
      setErrors({ submit: '저장 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="postwrite-page">
      <div className="postwrite-container">
        <h1 className="postwrite-title">{isEdit ? '글 수정' : '글쓰기'}</h1>

        <form onSubmit={handleSubmit} className="postwrite-form">
          <label className="pw-field">
            <span className="pw-label">카테고리</span>
            <div className="pw-cats">
              {POST_CATEGORIES.map(c => (
                <button
                  type="button"
                  key={c}
                  className={`pw-cat ${form.category === c ? 'active' : ''}`}
                  onClick={() => set('category', c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </label>

          <label className="pw-field">
            <span className="pw-label">제목 <b>*</b></span>
            <input
              className={`pw-input ${errors.title ? 'error' : ''}`}
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="제목을 입력하세요"
              maxLength={80}
            />
            {errors.title && <span className="pw-error">{errors.title}</span>}
          </label>

          {form.category === '모임' && (
            <div className="pw-row">
              <label className="pw-field">
                <span className="pw-label">날짜</span>
                <input
                  className="pw-input"
                  type="date"
                  value={form.meetupDate}
                  onChange={e => set('meetupDate', e.target.value)}
                />
              </label>
              <label className="pw-field">
                <span className="pw-label">장소</span>
                <input
                  className="pw-input"
                  value={form.meetupPlace}
                  onChange={e => set('meetupPlace', e.target.value)}
                  placeholder="예: 반포한강공원"
                  maxLength={40}
                />
              </label>
            </div>
          )}

          <label className="pw-field">
            <span className="pw-label">내용 <b>*</b></span>
            <textarea
              className={`pw-textarea ${errors.content ? 'error' : ''}`}
              value={form.content}
              onChange={e => set('content', e.target.value)}
              placeholder={
                form.category === '모임'
                  ? '어떤 사진을 찍으러 가는지, 몇 명이나 모으는지, 준비물이 있는지 적어주세요.'
                  : form.category === '클래스'
                    ? '클래스 주제, 강사, 일정, 신청 방법 등을 적어주세요.'
                    : '사진에 대한 이야기를 자유롭게 나눠주세요.'
              }
              rows={12}
            />
            {errors.content && <span className="pw-error">{errors.content}</span>}
          </label>

          {errors.submit && <p className="pw-error">{errors.submit}</p>}

          <div className="pw-actions">
            <button type="button" className="pw-btn secondary" onClick={onCancel}>취소</button>
            <button type="submit" className="pw-btn primary" disabled={submitting}>
              {submitting ? '저장 중…' : (isEdit ? '수정 완료' : '등록하기')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
