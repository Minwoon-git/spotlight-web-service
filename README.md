# SpotLight — 숨은 사진 명소 공유 지도 서비스

나만 알던 촬영 명소를 지도에 기록하고, 모두와 공유하는 웹 서비스입니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 지도 탐색 | Kakao Maps 기반 실제 지도에서 스팟 마커 확인 |
| 스팟 검색 | 장소명 · 지역 · 태그로 필터링 |
| 마커 프리뷰 | 마커 클릭 시 지도 위에 미리보기 카드 표시 |
| 스팟 등록 | 사진 업로드 · 위치 검색 · 태그 입력으로 새 스팟 추가 |
| 다중 사진 | 최대 5장 업로드, 대표 사진 지정 가능 |
| 이미지 압축 | Canvas API로 자동 압축 (최대 1920px, JPEG 85%) |
| 스팟 저장 | 마음에 드는 스팟을 저장해 나만의 지도 구성 |
| 데이터 유지 | localStorage로 등록/저장 데이터 브라우저 재시작 후에도 유지 |

---

## 화면 구성

```
홈          — 서비스 소개, 인기 스팟, 이용 방법 안내
탐색        — 카카오 지도 + 사이드바 스팟 목록
내 지도     — 저장한 스팟 모아보기
스팟 등록   — 사진 · 위치 · 태그 · 설명 입력 폼
```

---

## 기술 스택

- **프레임워크**: React 18 + Vite
- **지도 API**: Kakao Maps JavaScript SDK
- **스타일**: 순수 CSS (CSS Custom Properties 기반 디자인 시스템)
- **상태 관리**: React useState / useRef / Custom Hook
- **데이터 저장**: localStorage (사용자 등록 스팟 영속성)
- **이미지 처리**: Canvas API (압축 · Base64 변환)

---

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 만들고 Kakao Maps API 키를 입력합니다.

```
VITE_KAKAO_MAP_KEY=여기에_카카오_앱키_입력
```

> **Kakao 개발자 콘솔 설정 필요**
> [developers.kakao.com](https://developers.kakao.com) → 내 애플리케이션 → 플랫폼 → Web에
> `http://localhost:5173` 을 등록해야 지도가 정상 작동합니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 4. 빌드

```bash
npm run build
```

---

## 프로젝트 구조

```
src/
├── components/
│   ├── Navbar.jsx          # 상단 네비게이션
│   ├── HeroSection.jsx     # 홈 화면
│   ├── MapView.jsx         # 지도 탐색 화면
│   ├── RegisterView.jsx    # 스팟 등록 화면
│   ├── MyMapView.jsx       # 내 지도 화면
│   ├── SpotCard.jsx        # 스팟 카드 컴포넌트
│   └── SpotDetailModal.jsx # 스팟 상세 모달
├── data/
│   └── mockSpots.js        # 초기 샘플 스팟 데이터
├── hooks/
│   └── useSpots.js         # 스팟 상태 관리 훅
├── App.jsx                 # 라우팅 및 전역 상태
└── index.css               # CSS 디자인 시스템 (변수 정의)
```

---

## 환경 변수

| 변수명 | 설명 |
|--------|------|
| `VITE_KAKAO_MAP_KEY` | Kakao Maps JavaScript 앱 키 |

> `.env` 파일은 `.gitignore`에 포함되어 있어 GitHub에 업로드되지 않습니다.

---

## 라이선스

본 프로젝트는 개인 학습 및 포트폴리오 목적으로 제작되었습니다.
