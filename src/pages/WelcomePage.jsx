function WelcomePage({ navigate }) {
  return (
    <section id="welcome-section" className="welcome-section">
      <div className="welcome-copy">
        <p>익명으로 커밋하는 개발자 대나무숲</p>
        <strong>PlayCode Bamboo</strong>
      </div>

      <div className="welcome-actions">
        <div className="welcome-action">
          <p>new contributor?</p>
          <button
            id="welcome-signup-button"
            className="welcome-button"
            type="button"
            onClick={() => navigate('signup')}
          >
            Join
          </button>
        </div>

        <div className="welcome-action">
          <p>already pushed?</p>
          <button
            id="welcome-login-button"
            className="welcome-button welcome-button-dark"
            type="button"
            onClick={() => navigate('login')}
          >
            Login
          </button>
        </div>
      </div>
    </section>
  )
}

export default WelcomePage
