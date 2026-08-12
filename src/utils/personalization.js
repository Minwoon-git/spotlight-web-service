// Salesforce Marketing Cloud Personalization — 스팟 관련 행동 이벤트 전송
// 참고: https://developer.salesforce.com/docs/marketing/personalization/guide/custom-events.html
//       https://developer.salesforce.com/docs/data/salesforce-interactions-sdk/guide/c360a-api-catalog-interaction.html
//
// index.html의 비콘 스크립트가 로드된 뒤에만 동작하므로, SDK가 없는 환경
// (광고 차단기, 스크립트 로드 실패 등)에서는 조용히 아무 일도 하지 않는다.

function getSDK() {
  return typeof window !== 'undefined' ? window.SalesforceInteractions : undefined
}

// imageUrl은 추천 카드 썸네일용 "URL"이어야 한다. 일부 사용자 등록 스팟/모임은 사진을
// base64 data URI(수백 KB)로 저장하는데, 이를 그대로 카탈로그 속성에 실으면 조회
// 이벤트 페이로드가 커져 이벤트 API가 413(Content Too Large)로 거부한다 → 조회 유실.
// 따라서 http(s) URL만 imageUrl로 보내고 data URI 등 비-URL 값은 제외한다.
function toHttpUrl(value) {
  return typeof value === 'string' && /^https?:\/\//.test(value) ? value : undefined
}

function toImageUrl(photos) {
  return toHttpUrl(Array.isArray(photos) ? photos[0] : undefined)
}

// 주소 문자열에서 시/군/구 단위를 뽑는다(예: "서울 종로구 사직로 161" → "종로구").
// 스팟↔모임 "같은 구" 매칭의 공통 키라, 스팟 주소와 모임 장소에 같은 규칙을 쓴다.
// (useMeetups.js의 shortRegion과 동일 로직 — 의존성 없이 personalization에 인라인.)
function toDistrict(str) {
  if (!str) return undefined
  const tokens = String(str).trim().split(/\s+/)
  const unit = tokens.find(t => /(시|군|구)$/.test(t) && t.length > 1)
  return unit || tokens.slice(0, 2).join(' ') || undefined
}

// 콘솔 Catalog 스키마(Settings > Catalog and Profile Objects > Spot)에 정의된
// 커스텀 속성과 이름·타입을 1:1로 맞춘다. 여기서 벗어난 필드를 보내면 무시된다.
//   address  : String
//   season   : String
//   bestTime : String
//   likes    : Integer
// name·description은 내장(built-in) 속성이라 스키마에 없어도 항상 수집된다.
// description은 Similar Items 재료가 유사도를 계산하는 텍스트 필드라 함께 보낸다.
//
// 주의: `tags`는 Personalization commerce 모델의 예약 필드다. 문자열 배열로 보내면
// 서버가 built-in Tag 객체(type 속성 필요)로 파싱하려다 실패해 "Invalid Item"으로
// 아이템 전체(및 조회 집계)를 거부한다. 그래서 tags는 전송하지 않는다. 태그 데이터가
// 필요하면 예약어가 아닌 다른 속성명(예: spotTags)으로 스키마에 추가해 보낸다.
function toCatalogAttributes(spot) {
  return {
    name: spot.name,
    // url은 내장 속성이자 추천 노출의 필수 조건이다. 콘솔 sitemap 리스너가
    // 상세보기/좋아요에서 쓰는 /spot/{id} 규칙과 동일하게 맞춘다.
    url: typeof window !== 'undefined' ? `${window.location.origin}/spot/${spot.id}` : undefined,
    // description: "함께 본 스팟" 레시피의 Similar Items(name+description 매칭) 폴백용
    description: spot.description,
    // imageUrl: 추천 카드 썸네일용(내장 필드). http(s) URL만 (base64 data URI 제외 — 413 방지).
    imageUrl: toImageUrl(spot.photos),
    address: spot.address,
    season: spot.season,
    bestTime: spot.bestTime,
    likes: spot.likes,
  }
}

function toCatalogObject(spot) {
  return {
    type: 'Spot',
    id: String(spot.id),
    attributes: toCatalogAttributes(spot),
  }
}

// 콘솔 sitemap 리스너(상세보기/좋아요/저장)는 DOM의 data-spot-id만 읽을 수 있어
// name·url 정도만 이벤트에 실을 수 있었다. 전체 속성을 실으려면 리스너가 id로
// 조회할 수 있는 데이터가 있어야 하므로, 스팟 id → 카탈로그 속성 맵을 전역에
// 노출한다. 콘솔 리스너는 window.__spotlightCatalog[id]로 전체 속성을 가져간다.
// (register 이벤트와 동일한 toCatalogAttributes를 써서 속성 형태를 일치시킨다.)
export function syncSpotCatalog(spots) {
  if (typeof window === 'undefined' || !Array.isArray(spots)) return

  const map = {}
  for (const spot of spots) {
    if (spot?.id == null) continue
    map[String(spot.id)] = toCatalogAttributes(spot)
  }
  window.__spotlightCatalog = map
}

// 모임(Meetup) 카탈로그 — 스팟과 동일한 이벤트 방식. 콘솔 Catalog Object "Meetup"
// 스키마와 속성명을 1:1로 맞춘다. 스팟→모임 크로스셀("이 근처 출사 모임")의 재료로,
// region(구)은 스팟 주소의 구와 매칭하는 키다.
//   region  : String  (매칭용 구 단위)
//   place   : String  (표시용 전체 장소)
//   type    : String  (소셜링/클럽/원데이클래스)
//   schedule: String  (일정 표시용)
//   capacity/participantCount : Integer
//   host    : String
// name(=title)·description·url·imageUrl은 내장 속성.
function toMeetupCatalogAttributes(meetup) {
  const place = meetup.place || meetup.region
  return {
    name: meetup.title,
    url: typeof window !== 'undefined' ? `${window.location.origin}/meetup/${meetup.id}` : undefined,
    description: meetup.description,
    // 모임 대표 이미지도 http(s)만 (base64 data URI 제외 — 413 방지)
    imageUrl: toHttpUrl(meetup.image),
    region: toDistrict(place),
    place,
    type: meetup.type,
    // 클럽은 활동 주기(schedule), 나머지는 날짜(+시간)
    schedule: meetup.type === '클럽'
      ? (meetup.schedule || '')
      : (meetup.date ? (meetup.time ? `${meetup.date} ${meetup.time}` : meetup.date) : ''),
    capacity: meetup.capacity,
    participantCount: meetup.participantCount,
    host: meetup.host,
  }
}

// 콘솔 sitemap의 MeetupDetail 리스너가 data(id)만으로 전체 속성을 이벤트에 실을 수
// 있도록, 모임 id→속성 맵을 전역에 노출한다. (스팟의 __spotlightCatalog와 동일 계약.)
export function syncMeetupCatalog(meetups) {
  if (typeof window === 'undefined' || !Array.isArray(meetups)) return

  const map = {}
  for (const meetup of meetups) {
    if (meetup?.id == null) continue
    map[String(meetup.id)] = toMeetupCatalogAttributes(meetup)
  }
  window.__spotlightMeetupCatalog = map
}

function sendSpotInteraction(name, spot) {
  const sdk = getSDK()
  if (!sdk || !spot) return

  sdk.sendEvent({
    interaction: {
      name,
      catalogObject: toCatalogObject(spot),
    },
  })
}

// 상세보기/저장/좋아요는 콘솔 sitemap의 listeners로 이전했다 (data-spot-id 기반 DOM 추출).
// 등록만 비동기(Firestore 저장 완료 후 ID 생성)라 DOM 리스너로 잡을 수 없어 앱 코드에 남겨둔다.
export function trackSpotRegister(spot) {
  sendSpotInteraction('스팟 등록', spot)
}

// react-router는 탭 이동 시 풀 페이지 로드가 없어서, 콘솔에 등록된 sitemap의
// pageType 매칭이 최초 로드 이후로는 재실행되지 않는다. 라우트가 바뀔 때마다
// 호출해서 새 경로에 맞는 pageType을 다시 매칭시킨다.
// 참고: https://developer.salesforce.com/docs/marketing/personalization/guide/sitemap-implementation.html#single-page-app-handling
export function reinitSitemap() {
  const sdk = getSDK()
  if (!sdk?.reinit) return

  sdk.reinit()
}
