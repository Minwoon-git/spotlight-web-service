import { useState } from 'react'
import './SpotRegisterModal.css'

export default function SpotRegisterModal({ onClose }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '', address: '', description: '',
    tags: [], bestTime: '', photo: null,
  })
  const [submitted, setSubmitted] = useState(false)

  const tagOptions = ['#Sunrise', '#Sunset', '#Night', '#Nature', '#Cityscape',
    '#Forest', '#River', '#Beach', '#Traditional', '#Hidden']

  const toggleTag = (tag) => {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) setForm(f => ({ ...f, photo: URL.createObjectURL(file) }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="register-panel" onClick={e => e.stopPropagation()}>
        <div className="register-header">
          <h2>새 스팟 등록</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {submitted ? (
          <div className="register-success">
            <div className="success-icon">🎉</div>
            <h3>스팟이 등록되었어요!</h3>
            <p>검토 후 지도에 추가됩니다. 감사합니다!</p>
            <button className="btn-primary" onClick={onClose}>확인</button>
          </div>
        ) : (
          <>
            {/* Steps */}
            <div className="register-steps">
              {[1, 2, 3].map(s => (
                <div key={s} className={`step ${step === s ? 'active' : ''} ${step > s ? 'done' : ''}`}>
                  <span className="step-num">{step > s ? '✓' : s}</span>
                  <span className="step-label">
                    {s === 1 ? '사진' : s === 2 ? '위치 정보' : '태그 & 설명'}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="register-form">
              {step === 1 && (
                <div className="step-content">
                  <label className="photo-upload">
                    {form.photo ? (
                      <img src={form.photo} alt="preview" className="photo-preview" />
                    ) : (
                      <div className="photo-placeholder">
                        <span className="upload-icon">📷</span>
                        <p>사진을 클릭해 업로드하세요</p>
                        <small>JPG, PNG · 최대 10MB</small>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handlePhotoChange} hidden />
                  </label>
                  <button
                    type="button"
                    className="btn-next"
                    onClick={() => setStep(2)}
                  >
                    다음 →
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="step-content">
                  <div className="form-group">
                    <label>스팟 이름 *</label>
                    <input
                      type="text"
                      placeholder="예: 북한산 소나무 숲 전망대"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>주소 *</label>
                    <input
                      type="text"
                      placeholder="예: 서울 강북구 우이동"
                      value={form.address}
                      onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>최적 촬영 시간</label>
                    <input
                      type="text"
                      placeholder="예: 일출 직후 (06:00~07:30)"
                      value={form.bestTime}
                      onChange={e => setForm(f => ({ ...f, bestTime: e.target.value }))}
                    />
                  </div>
                  <div className="step-nav">
                    <button type="button" className="btn-back" onClick={() => setStep(1)}>← 이전</button>
                    <button type="button" className="btn-next" onClick={() => setStep(3)}
                      disabled={!form.name || !form.address}>
                      다음 →
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="step-content">
                  <div className="form-group">
                    <label>태그 선택</label>
                    <div className="tag-options">
                      {tagOptions.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          className={`tag-option ${form.tags.includes(tag) ? 'selected' : ''}`}
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>스팟 소개</label>
                    <textarea
                      placeholder="이 장소의 특징, 촬영 팁 등을 자유롭게 적어주세요."
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      rows={4}
                    />
                  </div>
                  <div className="step-nav">
                    <button type="button" className="btn-back" onClick={() => setStep(2)}>← 이전</button>
                    <button type="submit" className="btn-submit">등록하기 ✨</button>
                  </div>
                </div>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  )
}
