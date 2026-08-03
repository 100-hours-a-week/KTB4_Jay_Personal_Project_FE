function WelcomePage({ navigate }) {
  return (
    <section id="welcome-section" className="welcome-section">
      <div className="welcome-copy">
        <p>익명으로 커밋하는 개발자 대나무숲</p>
        <strong>PlayCode Bamboo</strong>
      </div>

      <div className="welcome-actions">
        <div className="welcome-action">
          <p>새로 오셨나요?</p>
          <button
            id="welcome-signup-button"
            className="welcome-button"
            type="button"
            onClick={() => navigate('signup')}
          >
            회원가입
          </button>
        </div>

        <div className="welcome-action">
          <p>이미 오신 적이 있군요!</p>
          <button
            id="welcome-login-button"
            className="welcome-button welcome-button-dark"
            type="button"
            onClick={() => navigate('login')}
          >
            로그인
          </button>
        </div>
      </div>
    </section>
  )
}

export default WelcomePage
