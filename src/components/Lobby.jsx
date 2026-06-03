import { useState } from 'react'
import ChatPanel from './ChatPanel.jsx'
import AvatarBadge from './AvatarBadge.jsx'
import InviteShare from './InviteShare.jsx'

function Lobby({
  copy,
  language,
  roomCode,
  playerName,
  roomData,
  games,
  selectedGameId,
  minimumPlayers,
  onGameChange,
  onReadyChange,
  onSendMessage,
  onInviteCopied,
  onStart,
}) {
  const [shareStatus, setShareStatus] = useState('')
  const players = roomData?.players || []
  const localPlayer = players.find((player) => player.id === 'local')
  const selectedGame = games.find((game) => game.id === selectedGameId) || games[0]
  const canStart = players.length >= minimumPlayers

  async function shareRoom() {
    const link = `${window.location.origin}/join/${roomCode}`

    try {
      await navigator.clipboard.writeText(link)
      setShareStatus('Copied')
      onInviteCopied?.('Invite copied', link)
    } catch {
      setShareStatus(link)
      onInviteCopied?.('Copy manually', link)
    }
  }

  function getGameLabel(gameId) {
    const game = games.find((item) => item.id === gameId)
    return game ? game.name[language] : 'Cards'
  }

  return (
    <section className="lobby-layout">
      <div className="section-heading">
        <p className="eyebrow">{copy.lobby.title}</p>
        <h1>{roomCode || '------'}</h1>
        <p>{copy.disclaimer}</p>
      </div>

      <div className="lobby-grid">
        <section className="lobby-panel">
          <div className="panel-title-row">
            <h2>{copy.lobby.players}</h2>
            <button className="chip-button" type="button" onClick={shareRoom}>
              {copy.actions.shareRoom}
            </button>
          </div>

          <div className="player-list">
            {players.map((player) => (
              <div className="player-card" key={player.id}>
                <AvatarBadge avatarId={player.avatar} name={player.name} />
                <span>
                  <strong>{player.name}</strong>
                  <small className="player-meta-line">
                    {player.role === 'host' && <b className="host-badge">{copy.lobby.host}</b>}
                    <b className={player.online ? 'online-badge' : 'offline-badge'}>
                      {player.online ? 'Online' : 'Offline'}
                    </b>
                  </small>
                  <small>Fav: {getGameLabel(player.favoriteGame)}</small>
                </span>
                <b className={player.ready ? 'ready-dot ready' : 'ready-dot'}>
                  {player.ready ? copy.actions.ready : copy.actions.notReady}
                </b>
              </div>
            ))}
          </div>

          {shareStatus && <p className="form-status">{shareStatus}</p>}
          <InviteShare roomCode={roomCode} onInviteCopied={onInviteCopied} />
        </section>

        <section className="lobby-panel">
          <h2>{copy.labels.selectGame}</h2>
          <p className="selected-game-line">
            Current game: <strong>{selectedGame.name[language]}</strong>
          </p>
          <label>
            <span>{copy.labels.selectGame}</span>
            <select value={selectedGameId} onChange={(event) => onGameChange(event.target.value)}>
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name[language]}
                </option>
              ))}
            </select>
          </label>

          <div className="lobby-actions">
            <button
              className={localPlayer?.ready ? 'primary-button ready-button' : 'secondary-button'}
              type="button"
              onClick={onReadyChange}
            >
              {localPlayer?.ready ? copy.actions.ready : copy.actions.notReady}
            </button>
            <button className="primary-button" type="button" disabled={!canStart} onClick={onStart}>
              {copy.actions.startGame}
            </button>
          </div>
          <p className="minimum-note">
            {canStart
              ? `${players.length} players in room`
              : `Need at least ${minimumPlayers} players to start`}
          </p>
        </section>

        <section className="lobby-panel chat-preview">
          <ChatPanel
            title={copy.lobby.chatPreview}
            messages={roomData?.messages || []}
            playerName={playerName}
            onSendMessage={onSendMessage}
            compact
          />
        </section>
      </div>
    </section>
  )
}

export default Lobby
