import { useState } from 'react'
import { leaderboardPeriods } from '../data/leaderboard.js'
import AvatarBadge from './AvatarBadge.jsx'

const periodLabels = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
}

function Leaderboard({ playerProfile, games }) {
  const [period, setPeriod] = useState('daily')
  const rows = leaderboardPeriods[period]
  const localFavoriteGame = games.find((game) => game.id === playerProfile.favoriteGame)

  const localPlayer = {
    rank: rows.length + 1,
    playerName: playerProfile.displayName,
    avatar: playerProfile.avatar,
    gamesPlayed: 3,
    wins: 1,
    favoriteGame: localFavoriteGame ? localFavoriteGame.name.en : 'Cards',
    local: true,
  }

  const tableRows = [...rows, localPlayer]

  return (
    <section className="content-stack">
      <div className="section-heading">
        <p className="eyebrow">Social Standings</p>
        <h1>Leaderboard</h1>
        <p>Frontend-only mock rankings for future multiplayer stats.</p>
      </div>

      <div className="tab-row" role="tablist" aria-label="Leaderboard period">
        {Object.entries(periodLabels).map(([id, label]) => (
          <button className={period === id ? 'tab-button active' : 'tab-button'} key={id} type="button" onClick={() => setPeriod(id)}>
            {label}
          </button>
        ))}
      </div>

      <div className="leaderboard-panel">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Avatar</th>
              <th>Player Name</th>
              <th>Games Played</th>
              <th>Wins</th>
              <th>Win Percentage</th>
              <th>Favorite Game</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row) => {
              const winPercentage = row.gamesPlayed ? Math.round((row.wins / row.gamesPlayed) * 100) : 0

              return (
                <tr className={row.local ? 'local-row' : ''} key={`${period}-${row.playerName}`}>
                  <td>#{row.rank}</td>
                  <td>
                    <AvatarBadge avatarId={row.avatar} name={row.playerName} />
                  </td>
                  <td>{row.playerName}</td>
                  <td>{row.gamesPlayed}</td>
                  <td>{row.wins}</td>
                  <td>{winPercentage}%</td>
                  <td>{row.favoriteGame}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default Leaderboard
