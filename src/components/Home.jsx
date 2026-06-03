function Home({ copy, language, setLanguage, navigate, playerName, roomCode }) {
  return (
    <section className="home-layout">
      <div className="hero-panel">
        <p className="eyebrow">{copy.home.kicker}</p>
        <h1>{copy.appName}</h1>
        <h2>{copy.appNameMarathi}</h2>
        <p className="hero-copy">{copy.home.intro}</p>

        <div className="hero-actions">
          <button className="primary-button" type="button" onClick={() => navigate('room')}>
            {copy.actions.createRoom}
          </button>
          <button className="secondary-button" type="button" onClick={() => navigate('room')}>
            {copy.actions.joinRoom}
          </button>
          <button className="secondary-button" type="button" onClick={() => navigate('guides')}>
            {copy.actions.gameGuides}
          </button>
          <button className="secondary-button" type="button" onClick={() => navigate('install')}>
            {copy.actions.installApp}
          </button>
        </div>
      </div>

      <aside className="status-panel">
        <div className="mini-table" aria-hidden="true">
          <span className="mini-card red">A</span>
          <span className="mini-card gold">K</span>
          <span className="mini-card dark">Q</span>
        </div>
        <p className="panel-label">{copy.home.stored}</p>
        <dl className="saved-list">
          <div>
            <dt>{copy.labels.playerName}</dt>
            <dd>{playerName || 'Guest'}</dd>
          </div>
          <div>
            <dt>{copy.labels.roomCode}</dt>
            <dd>{roomCode || '------'}</dd>
          </div>
          <div>
            <dt>Language</dt>
            <dd>{copy.languageName}</dd>
          </div>
        </dl>

        <button className="wide-ghost-button" type="button" onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')}>
          {language === 'en' ? 'Switch to Marathi' : 'इंग्रजी करा'}
        </button>
      </aside>
    </section>
  )
}

export default Home
