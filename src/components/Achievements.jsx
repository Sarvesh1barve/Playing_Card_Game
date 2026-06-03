import { achievements } from '../data/achievements.js'

function Achievements({ unlockedAchievements, onToggleAchievement }) {
  return (
    <section className="content-stack">
      <div className="section-heading">
        <p className="eyebrow">Player Progress</p>
        <h1>Achievements</h1>
        <p>Mock achievement cards stored locally for future social progression.</p>
      </div>

      <div className="achievements-grid">
        {achievements.map((achievement) => {
          const unlocked = unlockedAchievements.includes(achievement.id)

          return (
            <article className={unlocked ? 'achievement-card unlocked' : 'achievement-card'} key={achievement.id}>
              <span className="achievement-icon">{achievement.icon}</span>
              <div>
                <h2>{achievement.title}</h2>
                <p>{achievement.description}</p>
              </div>
              <button className={unlocked ? 'primary-button ready-button' : 'secondary-button'} type="button" onClick={() => onToggleAchievement(achievement.id)}>
                {unlocked ? 'Unlocked' : 'Unlock'}
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default Achievements
