import './PrivacyPolicy.css'

export default function PrivacyPolicy({ onBack }) {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <button className="privacy-back" onClick={onBack}>← 돌아가기</button>

        <h1 className="privacy-title">개인정보 처리방침</h1>
        <p className="privacy-updated">최종 업데이트: 2026년 6월 30일</p>

        <p className="privacy-intro">
          SpotLight(이하 "서비스")는 이용자의 개인정보를 중요하게 생각하며,
          「개인정보 보호법」을 준수합니다. 본 방침은 서비스가 수집하는 개인정보의
          항목, 수집 목적, 보유 기간 및 이용자의 권리에 대해 안내합니다.
        </p>

        <section className="privacy-section">
          <h2>1. 수집하는 개인정보 항목</h2>
          <p>서비스는 다음과 같은 개인정보를 수집합니다.</p>
          <table className="privacy-table">
            <thead>
              <tr>
                <th>수집 방법</th>
                <th>수집 항목</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Google 소셜 로그인</td>
                <td>이름(닉네임), 이메일 주소, 프로필 사진</td>
              </tr>
              <tr>
                <td>이메일 회원가입</td>
                <td>이름(닉네임), 이메일 주소</td>
              </tr>
              <tr>
                <td>서비스 이용 중 자동 수집</td>
                <td>등록한 스팟 정보, 저장한 스팟 목록, 좋아요 내역, 접속 일시</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="privacy-section">
          <h2>2. 개인정보 수집 및 이용 목적</h2>
          <ul>
            <li>회원 식별 및 로그인 서비스 제공</li>
            <li>사용자가 등록한 스팟, 저장 목록 등 서비스 기능 제공</li>
            <li>서비스 이용 통계 분석 및 품질 개선</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>3. 개인정보 보유 및 이용 기간</h2>
          <p>
            수집된 개인정보는 회원 탈퇴 시 또는 수집·이용 목적 달성 시 즉시 파기합니다.
            단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
          </p>
          <table className="privacy-table">
            <thead>
              <tr>
                <th>보존 항목</th>
                <th>보존 근거</th>
                <th>보존 기간</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>접속 기록</td>
                <td>통신비밀보호법</td>
                <td>3개월</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="privacy-section">
          <h2>4. 개인정보 제3자 제공 및 처리 위탁</h2>
          <p>서비스는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 서비스 운영을 위해 아래 업체에 처리를 위탁합니다.</p>
          <table className="privacy-table">
            <thead>
              <tr>
                <th>수탁 업체</th>
                <th>위탁 내용</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Google LLC (Firebase)</td>
                <td>인증, 데이터베이스 저장 및 관리</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="privacy-section">
          <h2>5. 개인정보 파기 방법</h2>
          <p>
            전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없도록 영구 삭제하며,
            종이에 출력된 개인정보는 분쇄하거나 소각하여 파기합니다.
          </p>
        </section>

        <section className="privacy-section">
          <h2>6. 이용자의 권리</h2>
          <p>이용자는 언제든지 다음 권리를 행사할 수 있습니다.</p>
          <ul>
            <li>개인정보 열람 요청</li>
            <li>개인정보 수정·삭제 요청</li>
            <li>개인정보 처리 정지 요청</li>
            <li>회원 탈퇴 (아래 개인정보 관리 책임자에게 이메일로 요청)</li>
          </ul>
          <p>권리 행사는 아래 개인정보 관리 책임자에게 이메일로 요청하실 수 있습니다.</p>
        </section>

        <section className="privacy-section">
          <h2>7. 개인정보 관리 책임자</h2>
          <table className="privacy-table">
            <tbody>
              <tr>
                <td>서비스명</td>
                <td>SpotLight</td>
              </tr>
              <tr>
                <td>책임자</td>
                <td>김민운</td>
              </tr>
              <tr>
                <td>이메일</td>
                <td>vvpp1593@gmail.com</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="privacy-section">
          <h2>8. 개인정보 처리방침 변경</h2>
          <p>
            본 방침은 법령·정책 변경 또는 서비스 변경에 따라 내용이 수정될 수 있으며,
            변경 시 서비스 내 공지를 통해 안내합니다.
          </p>
        </section>
      </div>
    </div>
  )
}
