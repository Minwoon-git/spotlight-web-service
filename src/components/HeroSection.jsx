import SpotCard from './SpotCard'
import './HeroSection.css'

export default function HeroSection({ spots, onExplore, onRegister }) {
  const featured = spots.slice(0, 3)
  const spotCount = spots.length
  const regionCount = new Set(spots.map(s => s.address.split(' ')[0])).size

  return (
    <div className="hero-page">
      <section className="hero-banner">
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-badge">숨은 명소를 발견하세요</div>
          <h1 className="hero-title">
            숨은 사진 명소를<br />공유하는 지도 서비스
          </h1>
          <p className="hero-desc">
            나만 알던 촬영 명소를 지도에 기록하고 공유하세요.<br />
            당신이 찾은 최고의 순간들을 지도에서 만나보세요.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={onExplore}>
              지도 탐색하기
            </button>
            <button className="btn-ghost" onClick={onRegister}>
              스팟 등록하기
            </button>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-num">{spotCount}</span>
            <span className="stat-label">등록된 스팟</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-num">1</span>
            <span className="stat-label">사용자</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-num">{regionCount}개</span>
            <span className="stat-label">지역 커버</span>
          </div>
        </div>
      </section>

      <section className="featured-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">인기 스팟</h2>
            <p className="section-desc">이번 주 가장 많은 사랑을 받은 촬영 명소</p>
          </div>
          <button className="btn-more" onClick={onExplore}>전체 보기 →</button>
        </div>
        <div className="spot-grid">
          {featured.map(spot => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </div>
      </section>

      <section className="how-section">
        <h2 className="section-title center">이렇게 사용하세요</h2>
        <p className="section-desc center">탐색 → 저장 → 등록의 선순환으로 함께 만들어가는 스팟 지도</p>
        <div className="how-grid">
          <div className="how-card">
            <div className="how-num">01</div>
            <h3>지도 탐색</h3>
            <p>숨겨진 사진 명소를 지도에서 발견하고 탐색하세요.</p>
          </div>
          <div className="how-arrow">→</div>
          <div className="how-card">
            <div className="how-num">02</div>
            <h3>사진 모아보기</h3>
            <p>한 장소를 여러 사람이 찍은 다양한 사진과 구도를 비교해보세요.</p>
          </div>
          <div className="how-arrow">→</div>
          <div className="how-card">
            <div className="how-num">03</div>
            <h3>나만의 지도</h3>
            <p>가보고 싶은 스팟을 저장해 나만의 지도로 정리하세요.</p>
          </div>
          <div className="how-arrow">→</div>
          <div className="how-card">
            <div className="how-num">04</div>
            <h3>스팟 등록</h3>
            <p>다녀온 곳의 사진을 올리면 새 스팟으로 지도에 추가됩니다.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <span className="footer-logo">SpotLight</span>
        <span className="footer-copy">© 2025 SpotLight. 숨은 명소를 함께 발견해요.</span>
      </footer>
    </div>
  )
}
