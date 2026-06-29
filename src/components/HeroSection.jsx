import { useEffect, useRef, useState, useCallback } from 'react'
import SpotCard from './SpotCard'
import MobileHeader from './MobileHeader'
import './HeroSection.css'

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target) }
      }),
      { threshold: 0.12 }
    )
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start || !target) return
    let startTime = null
    const step = (ts) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(ease * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, start, duration])
  return count
}

const CYCLING_WORDS = ['일출 명소', '야경 스팟', '새벽 풍경', '숨은 명소', '포토스팟']
const QUICK_TAGS = ['#궁궐', '#야경', '#새벽', '#카페', '#숲', '#골목', '#한옥', '#도심', '#바다', '#일몰']
const REGIONS = [
  { name: '서울', emoji: '🏙️' },
  { name: '경기', emoji: '🌿' },
  { name: '부산', emoji: '🌊' },
  { name: '강원', emoji: '🏔️' },
  { name: '제주', emoji: '🍊' },
  { name: '경주', emoji: '🏛️' },
]

const FLOAT_CARDS = [
  { src: 'https://images.unsplash.com/photo-1539920225512-31f8905dc582?w=300&auto=format&q=70', style: { top: '12%', left: '4%', animationDelay: '0s', animationDuration: '7s' } },
  { src: 'https://images.unsplash.com/photo-1620144959655-1d797e251a1b?w=300&auto=format&q=70', style: { top: '55%', left: '1%', animationDelay: '1.5s', animationDuration: '9s' } },
  { src: 'https://i.imgur.com/UzNSYHM.jpeg', style: { top: '20%', right: '3%', animationDelay: '0.8s', animationDuration: '8s' } },
  { src: 'https://images.unsplash.com/photo-1635686692794-b0ce6337386b?w=300&auto=format&q=70', style: { top: '60%', right: '2%', animationDelay: '2.2s', animationDuration: '10s' } },
  { src: 'https://images.unsplash.com/photo-1694248592032-a63bdb2a954a?w=300&auto=format&q=70', style: { top: '78%', left: '6%', animationDelay: '3s', animationDuration: '8.5s' } },
]

export default function HeroSection({ spots, totalCount, userCount, onExplore, onRegister, onNavigate, onAuthOpen, onSelectSpot }) {
  const featured = [...spots].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0)).slice(0, 3)
  const spotCount = totalCount ?? spots.length
  const regionCount = new Set(spots.map(s => s.address.split(' ')[0])).size
  const scrollRef = useRef(null)
  const bannerRef = useRef(null)
  const spotlightRef = useRef(null)

  const [wordIdx, setWordIdx] = useState(0)
  const [wordVisible, setWordVisible] = useState(true)
  const [statsVisible, setStatsVisible] = useState(false)
  const [mousePos, setMousePos] = useState({ x: -999, y: -999 })

  const spotCountUp = useCountUp(spotCount, 1600, statsVisible)
  const userCountUp = useCountUp(userCount, 2000, statsVisible)

  useScrollReveal()

  // Cycling words
  useEffect(() => {
    const interval = setInterval(() => {
      setWordVisible(false)
      setTimeout(() => {
        setWordIdx(i => (i + 1) % CYCLING_WORDS.length)
        setWordVisible(true)
      }, 400)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  // Stats counter trigger
  useEffect(() => {
    const el = bannerRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStatsVisible(true); obs.disconnect() }
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Mouse spotlight
  const handleMouseMove = useCallback((e) => {
    const rect = bannerRef.current?.getBoundingClientRect()
    if (!rect) return
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [])

  const scrollToFeatured = () => scrollRef.current?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="hero-page">

      {/* ── Hero Banner ── */}
      <section className="hero-banner" ref={bannerRef} onMouseMove={handleMouseMove}>
        <MobileHeader onNavigate={onNavigate} onAuthOpen={onAuthOpen} />

        {/* Mouse spotlight */}
        <div
          className="hero-spotlight"
          style={{ left: mousePos.x, top: mousePos.y }}
        />

        {/* Background */}
        <div className="hero-bg-orb orb-1" />
        <div className="hero-bg-orb orb-2" />
        <div className="hero-bg-orb orb-3" />
        <div className="hero-noise" />

        {/* Floating cards */}
        <div className="float-cards">
          {FLOAT_CARDS.map((c, i) => (
            <div key={i} className="float-card" style={c.style}>
              <img src={c.src} alt="" />
            </div>
          ))}
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot" />
            전국 포토스팟 커뮤니티
          </div>

          <h1 className="hero-title">
            <span className="hero-title-line">당신만의</span>
            <span className="hero-title-cycling">
              <span className={`cycling-word ${wordVisible ? 'visible' : ''}`}>
                {CYCLING_WORDS[wordIdx]}
              </span>
            </span>
            <span className="hero-title-line">지도에 기록하세요</span>
          </h1>

          <p className="hero-desc">
            나만 알던 촬영 명소를 지도에 올리고 공유하세요.<br />
            전국의 숨겨진 포토스팟을 한 곳에서 만나보세요.
          </p>

          <div className="hero-actions">
            <button className="btn-primary hero-btn-glow" onClick={onExplore}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              지도 탐색하기
            </button>
            <button className="btn-ghost" onClick={onRegister}>
              스팟 등록하기 →
            </button>
          </div>
        </div>

        <div className="hero-stats">
          <div className="stat">
            <span className="stat-num">{statsVisible ? spotCountUp : 0}+</span>
            <span className="stat-label">등록된 스팟</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-num">{regionCount}개</span>
            <span className="stat-label">지역 커버</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-num">{statsVisible ? userCountUp : 0}</span>
            <span className="stat-label">사용자</span>
          </div>
        </div>

        <button className="scroll-indicator" onClick={scrollToFeatured}>
          <span>스크롤</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
        </button>
      </section>

      {/* ── 모바일 전용: 빠른 탐색 태그 ── */}
      <section className="quick-tags-section mobile-only">
        <div className="quick-tags-label">빠른 탐색</div>
        <div className="quick-tags-scroll">
          {QUICK_TAGS.map(tag => (
            <button key={tag} className="quick-tag-chip" onClick={onExplore}>{tag}</button>
          ))}
        </div>
      </section>

      {/* ── Featured ── */}
      <section className="featured-section" ref={scrollRef}>
        <div className="reveal">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">인기 스팟</div>
              <h2 className="section-title">많은 사랑을 받은 명소</h2>
              <p className="section-desc desktop-only">지금 가장 주목받는 촬영 포인트를 확인해보세요</p>
            </div>
            <button className="btn-more" onClick={onExplore}>
              전체 보기
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
          <div className="spot-grid">
            {featured.map((spot, i) => (
              <div key={spot.id} className="card-reveal" style={{ animationDelay: `${i * 0.12}s` }}>
                <SpotCard spot={spot} onClick={() => onSelectSpot(spot)} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 모바일 전용: 지역별 탐색 ── */}
      <section className="region-section mobile-only">
        <div className="section-eyebrow">지역별 탐색</div>
        <h2 className="section-title">어디로 떠날까요?</h2>
        <div className="region-grid">
          {REGIONS.map((r) => {
            const count = spots.filter(s => s.address.startsWith(r.name)).length
            return (
              <button key={r.name} className="region-card" onClick={onExplore}>
                <span className="region-emoji">{r.emoji}</span>
                <span className="region-name">{r.name}</span>
                <span className="region-count">{count}곳</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── Feature Highlights ── */}
      <section className="highlights-section reveal desktop-only">
        <div className="highlights-inner">
          {[
            {
              color: 'purple',
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
              title: '지도로 발견',
              desc: '카카오맵 기반으로 주변 촬영 명소를 한눈에 탐색하세요.',
            },
            {
              color: 'blue',
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
              title: '사진 비교',
              desc: '같은 장소를 다양한 구도와 시간대로 비교해보세요.',
            },
            {
              color: 'indigo',
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
              title: '나만의 지도',
              desc: '가보고 싶은 스팟을 저장해 나만의 컬렉션으로 만드세요.',
            },
          ].map((h, i) => (
            <div key={h.title} className={`highlight-card ${h.color}`} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="highlight-icon">{h.icon}</div>
              <h3>{h.title}</h3>
              <p>{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How Section ── */}
      <section className="how-section desktop-only">
        <div className="reveal">
          <div className="section-eyebrow center">사용 방법</div>
          <h2 className="section-title center">이렇게 시작하세요</h2>
          <p className="section-desc center">탐색 → 저장 → 등록의 선순환으로 함께 만들어가는 스팟 지도</p>
          <div className="how-grid">
            {[
              { num: '01', title: '지도 탐색', desc: '지도에서 숨겨진 포토스팟을 발견하고 상세 정보를 확인하세요.' },
              { num: '02', title: '사진 비교', desc: '한 장소를 여러 구도로 찍은 사진들을 비교해보세요.' },
              { num: '03', title: '스팟 저장', desc: '가보고 싶은 스팟을 북마크해 나만의 지도로 정리하세요.' },
              { num: '04', title: '스팟 등록', desc: '다녀온 명소를 직접 올려 모두와 공유하세요.' },
            ].map((step, i) => (
              <div key={step.num} className="how-step" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="how-num">{step.num}</div>
                <div className="how-connector" />
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section reveal desktop-only">
        <div className="cta-inner">
          <div className="cta-bg-orb" />
          <div className="cta-bg-orb cta-bg-orb-2" />
          <h2 className="cta-title">지금 바로 시작해보세요</h2>
          <p className="cta-desc">전국의 숨은 포토스팟이 당신을 기다리고 있어요.</p>
          <div className="cta-actions">
            <button className="btn-primary" onClick={onExplore}>지도 탐색하기</button>
            <button className="cta-btn-ghost" onClick={onRegister}>스팟 등록하기</button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-left">
            <span className="footer-logo">SpotLight</span>
            <span className="footer-tagline">숨은 명소를 함께 발견해요</span>
          </div>
          <div className="footer-right">
            <button className="footer-link" onClick={() => onNavigate('privacy')}>개인정보 처리방침</button>
            <span className="footer-copy">© 2026 SpotLight. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
