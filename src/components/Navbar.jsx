import './Navbar.css'

export default function Navbar({ view, onNavigate }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <button className="navbar-logo" onClick={() => onNavigate('home')}>
          <span className="logo-dot" />
          SpotLight
        </button>

        <div className="navbar-links">
          <button
            className={`nav-link ${view === 'explore' ? 'active' : ''}`}
            onClick={() => onNavigate('explore')}
          >
            탐색
          </button>
          <button
            className={`nav-link ${view === 'mymap' ? 'active' : ''}`}
            onClick={() => onNavigate('mymap')}
          >
            내 지도
          </button>
          <button
            className={`nav-link ${view === 'register' ? 'active' : ''}`}
            onClick={() => onNavigate('register')}
          >
            스팟 등록
          </button>
        </div>

        <div className="navbar-actions">
          <button className="btn-login">로그인</button>
          <button className="btn-start" onClick={() => onNavigate('explore')}>
            시작하기
          </button>
        </div>
      </div>
    </nav>
  )
}
