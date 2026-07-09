# SpotLight — 숨은 사진 명소 공유 지도 서비스

나만 알던 촬영 명소를 지도에 기록하고, 모두와 공유하는 웹 서비스입니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 회원가입 · 로그인 | 이메일/비밀번호(약관 동의, 비밀번호 확인 포함) 또는 구글 로그인 |
| 이메일 인증 | 가입 시 인증 메일 발송, 앱 내 커스텀 페이지에서 인증 링크 처리 |
| 마이페이지 | 닉네임 변경, 프로필 사진 변경 |
| 지도 탐색 | Kakao Maps 기반 실제 지도에서 스팟 마커 확인 |
| 스팟 검색 · 필터 | 장소명 · 지역 · 태그 검색, 계절/시간대 드롭다운 필터 |
| 마커 프리뷰 | 마커 클릭 시 지도 위에 미리보기 카드 표시 |
| 지도 위치 유지 | 새로고침 후에도 마지막 지도 위치·줌 레벨 복원 |
| 스팟 등록 · 수정 | 사진 업로드 · 위치 검색 · 태그 · 추천 계절/시간대 입력으로 스팟 추가/수정 |
| 다중 사진 | 최대 5장 업로드, 대표 사진 지정 가능 |
| 이미지 압축 | Canvas API로 자동 압축 (최대 1920px, JPEG 85%) |
| 스팟 저장 · 좋아요 | 마음에 드는 스팟을 저장/좋아요 표시해 나만의 지도 구성 |
| 커뮤니티 사진 | 기존 스팟에 다른 사용자가 방문자 사진을 추가해 비교 가능 (업로더/업로드일 표시) |
| 프로필 사진 노출 | 스팟 등록자·사진 업로더 이름 옆에 프로필 사진 표시 |
| 관리자 기능 | 관리자 계정은 스팟/방문자 사진 삭제 가능 |
| 약관 · 정책 페이지 | 이용약관, 개인정보 처리방침 페이지 제공 |
| 개인화 이벤트 트래킹 | Salesforce Marketing Cloud Personalization 연동, 스팟 조회/저장/좋아요/등록 이벤트 전송 |
| 데이터 영속성 | Firebase Firestore에 스팟·저장·좋아요·기여 사진 데이터 저장 |

---

## 화면 구성

```
홈           — 서비스 소개, 인기 스팟, 이용 방법 안내
탐색         — 카카오 지도 + 사이드바 스팟 목록, 계절/시간대 필터
내 지도      — 등록·저장한 스팟 모아보기, 수정/삭제
스팟 등록    — 사진 · 위치 · 태그 · 설명 · 추천 계절/시간대 입력 폼
스팟 상세    — 등록 사진 / 커뮤니티 사진 탭 전환, 좋아요·저장, 내 사진 직접 추가
마이페이지   — 닉네임 · 프로필 사진 변경
이용약관 / 개인정보 처리방침
```

---

## 기술 스택

- **프레임워크**: React 19 + Vite
- **라우팅**: React Router v7
- **지도 API**: Kakao Maps JavaScript SDK
- **인증 · 데이터베이스**: Firebase Authentication(이메일/구글) + Firestore
- **스타일**: 순수 CSS (CSS Custom Properties 기반 디자인 시스템)
- **상태 관리**: React useState / useRef / Context / Custom Hook
- **이미지 처리**: Canvas API (압축 · Base64 변환)
- **개인화**: Salesforce Marketing Cloud Personalization (Evergage beacon SDK)

---

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 만들고 아래 값을 입력합니다.

```
VITE_KAKAO_MAP_KEY=여기에_카카오_앱키_입력

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

> **Kakao 개발자 콘솔 설정 필요**
> [developers.kakao.com](https://developers.kakao.com) → 내 애플리케이션 → 플랫폼 → Web에
> `http://localhost:5173` 을 등록해야 지도가 정상 작동합니다.

> **Firebase 콘솔 설정 필요**
> Firebase 프로젝트에서 Authentication(이메일/비밀번호, Google) 과 Firestore를 활성화해야 로그인·등록·저장 기능이 정상 작동합니다.

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
│   ├── Navbar.jsx / BottomTabBar.jsx / MobileHeader.jsx  # 네비게이션
│   ├── HeroSection.jsx        # 홈 화면
│   ├── MapView.jsx            # 지도 탐색 화면 (검색 · 계절/시간대 필터)
│   ├── RegisterView.jsx       # 스팟 등록/수정 화면
│   ├── MyMapView.jsx          # 내 지도 화면
│   ├── MyPage.jsx             # 마이페이지 (닉네임 · 프로필 사진)
│   ├── SpotCard.jsx           # 스팟 카드 컴포넌트
│   ├── SpotDetailModal.jsx    # 스팟 상세 모달 (커뮤니티 사진, 좋아요 포함)
│   ├── SpotRegisterModal.jsx / SuccessModal.jsx / ConfirmModal.jsx
│   ├── AuthModal.jsx / AuthRequired.jsx      # 로그인/회원가입, 로그인 유도
│   ├── EmailVerifyRequired.jsx / EmailActionHandler.jsx  # 이메일 인증
│   └── PrivacyPolicy.jsx / TermsOfService.jsx
├── contexts/
│   └── AuthContext.jsx        # 전역 인증 상태
├── data/
│   └── mockSpots.js           # 서울 주요 명소 샘플 데이터
├── hooks/
│   ├── useSpots.js            # 스팟 CRUD (Firestore)
│   ├── useSavedSpots.js       # 저장 상태 관리
│   ├── useLikedSpots.js       # 좋아요 상태 관리
│   └── useContributions.js    # 커뮤니티(기여) 사진 관리
├── utils/
│   ├── admin.js                # 관리자 이메일 판별
│   ├── auth.js                 # 이메일 인증 여부 판별
│   └── personalization.js      # Salesforce Personalization 이벤트 전송
├── firebase.js                 # Firebase 초기화
├── App.jsx                     # 라우팅 및 전역 상태
└── index.css                   # CSS 디자인 시스템 (변수 정의)

salesforce/
└── personalization-sitemap.js  # Personalization sitemap 설정
```

---

## 샘플 데이터

API 키 없이도 홈 화면과 스팟 카드는 확인 가능합니다. 기본 제공 스팟:

| # | 장소 | 위치 |
|---|------|------|
| 1 | 경복궁 | 서울 종로구 |
| 2 | 청계천 | 서울 중구 |
| 3 | 북촌한옥마을 | 서울 종로구 |
| 4 | 남산타워 | 서울 중구 |
| 5 | 석촌호수 | 서울 송파구 |

---

## 환경 변수

| 변수명 | 설명 |
|--------|------|
| `VITE_KAKAO_MAP_KEY` | Kakao Maps JavaScript 앱 키 |
| `VITE_FIREBASE_API_KEY` | Firebase 프로젝트 API 키 |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth 도메인 |
| `VITE_FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage 버킷 |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Cloud Messaging 발신자 ID |
| `VITE_FIREBASE_APP_ID` | Firebase 앱 ID |

> `.env` 파일은 `.gitignore`에 포함되어 있어 GitHub에 업로드되지 않습니다.

---

## 라이선스

본 프로젝트는 개인 학습 및 포트폴리오 목적으로 제작되었습니다.
