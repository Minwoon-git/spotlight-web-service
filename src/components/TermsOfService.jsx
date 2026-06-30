import './PrivacyPolicy.css'

export default function TermsOfService({ onBack }) {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <button className="privacy-back" onClick={onBack}>← 돌아가기</button>

        <h1 className="privacy-title">이용약관</h1>
        <p className="privacy-updated">최종 업데이트: 2026년 6월 30일</p>

        <p className="privacy-intro">
          본 약관은 SpotLight(이하 "서비스")가 제공하는 서비스의 이용과 관련하여
          서비스와 이용자 간의 권리, 의무 및 책임사항을 규정합니다.
        </p>

        <section className="privacy-section">
          <h2>1. 서비스의 정의</h2>
          <p>
            서비스는 이용자가 사진 촬영 명소("스팟")를 지도에 등록하고, 다른
            이용자가 등록한 스팟을 탐색·저장·좋아요 표시하며, 방문 사진을
            공유할 수 있는 웹 서비스입니다.
          </p>
        </section>

        <section className="privacy-section">
          <h2>2. 이용계약의 성립</h2>
          <p>
            이용계약은 이용자가 본 약관 및 개인정보 처리방침에 동의하고,
            Google 소셜 로그인 또는 이메일 회원가입을 통해 계정을 생성함으로써
            성립합니다.
          </p>
        </section>

        <section className="privacy-section">
          <h2>3. 이용자의 의무</h2>
          <ul>
            <li>타인의 개인정보, 저작권 등 권리를 침해하는 콘텐츠를 등록하지 않습니다.</li>
            <li>허위 정보나 실제 존재하지 않는 장소를 등록하지 않습니다.</li>
            <li>서비스의 정상적인 운영을 방해하는 행위를 하지 않습니다.</li>
            <li>타인의 계정을 도용하거나 부정한 방법으로 서비스를 이용하지 않습니다.</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>4. 게시물(스팟·사진)의 관리</h2>
          <p>
            이용자가 등록한 스팟 정보와 사진의 저작권은 해당 이용자에게 있습니다.
            다만 이용자는 서비스 내에서 해당 콘텐츠를 표시·전송·저장하는 데
            필요한 범위 내에서 서비스에 이용을 허락한 것으로 봅니다. 본 약관 또는
            관계 법령을 위반하는 게시물은 사전 통지 없이 삭제될 수 있습니다.
          </p>
        </section>

        <section className="privacy-section">
          <h2>5. 서비스의 변경 및 중단</h2>
          <p>
            서비스는 운영상, 기술상의 필요에 따라 제공하는 서비스의 전부 또는
            일부를 변경하거나 중단할 수 있으며, 이 경우 사전에 서비스 내 공지를
            통해 안내합니다.
          </p>
        </section>

        <section className="privacy-section">
          <h2>6. 면책조항</h2>
          <p>
            서비스는 이용자가 등록한 스팟 정보(위치, 설명 등)의 정확성을
            보증하지 않으며, 이를 신뢰하여 발생한 손해에 대해 책임을 지지
            않습니다. 또한 천재지변, 정전 등 불가항력으로 서비스를 제공할 수
            없는 경우 책임이 면제됩니다.
          </p>
        </section>

        <section className="privacy-section">
          <h2>7. 계정 해지(탈퇴)</h2>
          <p>
            이용자는 아래 문의처로 이메일을 보내 언제든지 계정 해지를 요청할
            수 있습니다. 해지 요청이 접수되면 관련 법령에 따른 보관 의무가
            없는 범위에서 지체 없이 이용자의 개인정보를 파기합니다.
          </p>
        </section>

        <section className="privacy-section">
          <h2>8. 약관의 변경</h2>
          <p>
            본 약관은 관계 법령 또는 서비스 정책 변경에 따라 수정될 수 있으며,
            변경 시 서비스 내 공지를 통해 안내합니다. 변경된 약관은 공지 후
            적용됩니다.
          </p>
        </section>

        <section className="privacy-section">
          <h2>9. 문의처</h2>
          <table className="privacy-table">
            <tbody>
              <tr>
                <td>서비스명</td>
                <td>SpotLight</td>
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
