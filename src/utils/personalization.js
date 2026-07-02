// Salesforce Marketing Cloud Personalization — 스팟 관련 행동 이벤트 전송
// 참고: https://developer.salesforce.com/docs/marketing/personalization/guide/custom-events.html
//       https://developer.salesforce.com/docs/data/salesforce-interactions-sdk/guide/c360a-api-catalog-interaction.html
//
// index.html의 비콘 스크립트가 로드된 뒤에만 동작하므로, SDK가 없는 환경
// (광고 차단기, 스크립트 로드 실패 등)에서는 조용히 아무 일도 하지 않는다.

function getSDK() {
  return typeof window !== 'undefined' ? window.SalesforceInteractions : undefined
}

function toCatalogObject(spot) {
  return {
    type: 'Spot',
    id: String(spot.id),
    attributes: {
      name: spot.name,
      description: spot.description,
    },
    relatedCatalogObjects: {
      Tag: spot.tags ?? [],
      Season: spot.season ? [spot.season] : [],
    },
  }
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

// 참고: 예약된 ViewCatalogObject 인터랙션은 Personalization 콘솔에 "Spot" Dimension이
// 등록되어 있어야 통과한다(현재 미등록 → 400). 등록 전까지는 다른 액션과 동일하게
// 커스텀 인터랙션 이름으로 보낸다. 콘솔에 Dimension이 등록되면 ViewCatalogObject로 교체 가능.
export function trackSpotView(spot) {
  sendSpotInteraction('View Spot', spot)
}

export function trackSpotSave(spot, saved) {
  sendSpotInteraction(saved ? 'Save Spot' : 'Unsave Spot', spot)
}

export function trackSpotLike(spot, liked) {
  sendSpotInteraction(liked ? 'Like Spot' : 'Unlike Spot', spot)
}

export function trackSpotRegister(spot) {
  sendSpotInteraction('Register Spot', spot)
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
