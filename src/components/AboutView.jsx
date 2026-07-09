import './PrivacyPolicy.css'

export default function AboutView({ onBack, onExplore, onRegister }) {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <button className="privacy-back" onClick={onBack}>← 돌아가기</button>

        <h1 className="privacy-title">SpotLight 소개</h1>
        <p className="privacy-updated">숨은 사진 명소를 지도에 기록하고 공유하는 커뮤니티</p>

        <p className="privacy-intro">
          SpotLight는 사진 찍기 좋은 장소, 이른바 '포토스팟'을 지도 위에 모으고 함께
          나누기 위해 만든 서비스입니다. 우연히 발견한 골목의 노을, 새벽의 궁궐, 한적한
          바닷가처럼 나만 알던 촬영 명소를 지도에 기록해두면, 다른 사람도 그 장소를 찾아가
          같은 감동을 경험할 수 있습니다. SpotLight는 흩어져 있던 촬영 명소 정보를 한곳에
          모아, 사진을 사랑하는 사람들이 서로의 시선을 공유하는 공간을 지향합니다.
        </p>

        <section className="privacy-section">
          <h2>이렇게 시작했어요</h2>
          <p>
            여행이나 산책 중 '여기 사진 정말 잘 나오겠다' 싶은 장소를 발견해도, 막상
            나중에 다시 찾으려 하면 위치가 기억나지 않는 경우가 많습니다. 반대로 어딘가
            멋진 사진을 보고 '나도 저기서 찍고 싶다'는 생각이 들어도, 정확히 어디인지
            알 수 없어 아쉬웠던 경험도 흔합니다. SpotLight는 이런 불편함에서 출발했습니다.
            촬영 명소의 위치와 분위기, 촬영 팁을 지도 위에 남겨두면 누구나 쉽게 찾아갈 수
            있도록 하자는 아이디어가 서비스의 시작이었습니다.
          </p>
        </section>

        <section className="privacy-section">
          <h2>이런 기능이 있어요</h2>
          <ul>
            <li>
              <strong>지도로 탐색</strong> — 카카오맵 기반 지도 위에서 주변 촬영 명소를
              한눈에 살펴볼 수 있습니다. 지역, 계절, 시간대별로 필터링해 원하는 분위기의
              장소를 찾아보세요.
            </li>
            <li>
              <strong>스팟 등록</strong> — 내가 발견한 촬영 명소의 위치, 사진, 촬영 팁,
              추천 시간대를 등록해 다른 사람과 공유할 수 있습니다.
            </li>
            <li>
              <strong>사진 비교</strong> — 같은 장소를 여러 사람이 다양한 구도와 시간대로
              담은 사진을 함께 볼 수 있어, 방문 전 어떤 사진을 찍을 수 있을지 미리
              가늠할 수 있습니다.
            </li>
            <li>
              <strong>나만의 지도</strong> — 가보고 싶은 스팟을 저장해 나만의 컬렉션으로
              만들고, 다음 출사 계획을 세울 수 있습니다.
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>이런 분들께 추천해요</h2>
          <ul>
            <li>주말마다 새로운 출사 장소를 찾아 다니는 사진 애호가</li>
            <li>여행지에서 인생샷을 남기고 싶은 여행자</li>
            <li>일출·일몰·야경 등 특정 시간대의 풍경을 담고 싶은 분</li>
            <li>내가 아는 좋은 장소를 다른 사람과 나누고 싶은 분</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>이렇게 사용하세요</h2>
          <ul>
            <li><strong>1. 탐색</strong> — 지도에서 숨겨진 포토스팟을 발견하고 상세 정보를 확인하세요.</li>
            <li><strong>2. 저장</strong> — 마음에 드는 스팟을 저장해 나만의 지도에 담아두세요.</li>
            <li><strong>3. 방문</strong> — 추천 시간대와 촬영 팁을 참고해 직접 방문해 사진을 남기세요.</li>
            <li><strong>4. 공유</strong> — 새로 발견한 명소나 찍은 사진을 등록해 커뮤니티에 기여하세요.</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>함께 만들어가요</h2>
          <p>
            SpotLight는 사용자들이 직접 등록하는 정보로 채워지는 커뮤니티 서비스입니다.
            한 사람 한 사람이 남긴 장소와 사진이 모여, 다른 누군가에게는 잊지 못할 촬영의
            기억이 됩니다. 여러분이 아는 숨은 명소를 지도에 더해주세요. 탐색 → 저장 →
            등록의 선순환이 더 풍성한 지도를 만들어갑니다.
          </p>
          <div className="about-actions">
            <button className="about-btn about-btn-primary" onClick={onExplore}>지도 탐색하기</button>
            <button className="about-btn about-btn-ghost" onClick={onRegister}>스팟 등록하기</button>
          </div>
        </section>

        <section className="privacy-section">
          <h2>문의</h2>
          <p>
            서비스에 대한 문의나 제안이 있으시면 아래 이메일로 연락해 주세요.
          </p>
          <table className="privacy-table">
            <tbody>
              <tr>
                <td>서비스명</td>
                <td>SpotLight</td>
              </tr>
              <tr>
                <td>운영자</td>
                <td>김민운</td>
              </tr>
              <tr>
                <td>이메일</td>
                <td>vvpp1593@gmail.com</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}
