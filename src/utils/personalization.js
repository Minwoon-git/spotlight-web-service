// Salesforce Marketing Cloud Personalization — 스팟 관련 행동 이벤트 전송
// 참고: https://developer.salesforce.com/docs/marketing/personalization/guide/custom-events.html
//       https://developer.salesforce.com/docs/data/salesforce-interactions-sdk/guide/c360a-api-catalog-interaction.html
//
// index.html의 비콘 스크립트가 로드된 뒤에만 동작하므로, SDK가 없는 환경
// (광고 차단기, 스크립트 로드 실패 등)에서는 조용히 아무 일도 하지 않는다.

function getSDK() {
  return typeof window !== 'undefined' ? window.SalesforceInteractions : undefined
}

// 콘솔 Catalog 스키마(Settings > Catalog and Profile Objects > Spot)에 정의된
// 커스텀 속성과 이름·타입을 1:1로 맞춘다. 여기서 벗어난 필드를 보내면 무시된다.
//   address  : String
//   season   : String
//   bestTime : String
//   tags     : MultiString (배열)
//   likes    : Integer
// name·description은 내장(built-in) 속성이라 스키마에 없어도 항상 수집된다.
// description은 Similar Items 재료가 유사도를 계산하는 텍스트 필드라 함께 보낸다.
function toCatalogAttributes(spot) {
  return {
    name: spot.name,
    // url은 내장 속성이자 추천 노출의 필수 조건이다. 콘솔 sitemap 리스너가
    // 상세보기/좋아요에서 쓰는 /spot/{id} 규칙과 동일하게 맞춘다.
    url: typeof window !== 'undefined' ? `${window.location.origin}/spot/${spot.id}` : undefined,
    // description: "함께 본 스팟" 레시피의 Similar Items(name+description 매칭) 폴백용
    description: spot.description,
    address: spot.address,
    season: spot.season,
    bestTime: spot.bestTime,
    tags: spot.tags ?? [],
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
