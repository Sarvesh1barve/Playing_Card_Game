import NotificationCenter from './NotificationCenter.jsx'

function Header({
  copy,
  language,
  screen,
  theme,
  notifications,
  onNavigate,
  onLanguageChange,
  onThemeChange,
  onMarkAllNotificationsRead,
}) {
  const navItems = [
    { id: 'home', label: copy.nav.home },
    { id: 'guides', label: copy.nav.guides },
    { id: 'room', label: copy.nav.room },
    { id: 'profile', label: 'Profile' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'install', label: copy.nav.install },
  ]

  return (
    <header className="app-header">
      <button className="brand-button" type="button" onClick={() => onNavigate('home')}>
        <span className="brand-mark">M</span>
        <span>
          <strong>{copy.appName}</strong>
          <small>{copy.appNameMarathi}</small>
        </span>
      </button>

      <nav className="top-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <button
            className={screen === item.id || (screen === 'join' && item.id === 'room') ? 'nav-button active' : 'nav-button'}
            type="button"
            key={item.id}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="header-actions">
        <NotificationCenter
          notifications={notifications}
          onMarkAllRead={onMarkAllNotificationsRead}
        />
        <button
          className="chip-button"
          type="button"
          onClick={() => onLanguageChange(language === 'en' ? 'mr' : 'en')}
        >
          {language === 'en' ? 'मराठी' : 'English'}
        </button>
        <button className="chip-button" type="button" onClick={onThemeChange}>
          {theme === 'midnight' ? 'Royal' : 'Midnight'}
        </button>
      </div>
    </header>
  )
}

export default Header
