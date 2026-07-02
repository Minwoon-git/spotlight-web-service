/*
 * Salesforce Marketing Cloud Personalization (Evergage/Interaction Studio) — Sitemap
 *
 * 이 파일은 React 앱 번들에는 포함되지 않는다.
 * Personalization 관리 콘솔 > Visual Editor > Sitemap Editor 에서
 * "spotlight" 데이터셋(계정: milvuskorea)의 production sitemap으로 붙여넣어 등록한다.
 * 등록 후에는 index.html에 있는 비콘 스크립트가 이 코드를 함께 로드/실행한다.
 *
 * 참고: https://developer.salesforce.com/docs/marketing/personalization/guide/sitemap-implementation.html
 *
 * 수정 이력:
 * - pageTypeDefault에 interaction 필드 추가. SalesforceInteractions 네임스페이스는
 *   pageTypeDefault에 interaction이 없으면 sitemap 전체가 무효 처리된다(공식 문서 명시).
 *   이게 빠져서 지금까지 페이지뷰가 하나도 안 찍혔던 것으로 보인다.
 * - initSitemap을 init().then() 안으로 이동 (공식 예제와 동일한 순서).
 */

SalesforceInteractions.init().then(function () {
  // 앱의 라우팅 구조(App.jsx의 PATH_TO_VIEW)와 1:1로 맞춘 pageType 목록
  var sitemapConfig = {
    pageTypes: [
      { name: 'Home', interaction: { name: '메인 페이지 방문' }, isMatch: function () { return window.location.pathname === '/main'; } },
      { name: 'Explore', interaction: { name: '탐색 페이지 방문' }, isMatch: function () { return window.location.pathname === '/explore'; } },
      { name: 'MyMap', interaction: { name: '내 지도 페이지 방문' }, isMatch: function () { return window.location.pathname === '/mymap'; } },
      { name: 'Register', interaction: { name: '스팟 등록 페이지 방문' }, isMatch: function () { return window.location.pathname === '/register'; } },
      { name: 'MyPage', interaction: { name: '마이 페이지 방문' }, isMatch: function () { return window.location.pathname === '/mypage'; } },
      { name: 'Privacy', interaction: { name: '개인정보 처리방침 페이지 방문' }, isMatch: function () { return window.location.pathname === '/privacy'; } },
      { name: 'Terms', interaction: { name: '이용약관 페이지 방문' }, isMatch: function () { return window.location.pathname === '/terms'; } },
    ],
    pageTypeDefault: {
      name: 'Other',
      interaction: { name: 'Other' },
    },
  };

  SalesforceInteractions.initSitemap(sitemapConfig);
});

/*
 * SPA 라우트 변경 재초기화
 *
 * 이 앱(react-router)은 탭 이동 시 풀 페이지 로드가 없으므로, 최초 로드 이후의
 * 라우트 변경은 위 sitemap이 자동으로 다시 평가되지 않는다. 공식 SPA 가이드는
 * URL을 폴링해 SalesforceInteractions.reinit()을 호출하도록 안내하지만,
 * 이 프로젝트는 react-router를 쓰므로 폴링 대신 App.jsx의 라우트 변경 시점에
 * 직접 reinit()을 호출한다 (src/utils/personalization.js의 reinitSitemap 참고).
 * 이 부분은 콘솔에 붙여넣는 코드가 아니라 앱 코드에 구현되어 있다.
 */
