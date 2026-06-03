import { useState } from 'react'
import Card from './Card.jsx'
import ChatPanel from './ChatPanel.jsx'

const hand = [
  { symbol: '🂡', label: 'Ace of Spades' },
  { symbol: '🂾', label: 'King of Spades' },
  { symbol: '🂱', label: 'Ace of Hearts', red: true },
  { symbol: '🃇', label: 'Seven of Diamonds', red: true },
  { symbol: '🃞', label: 'King of Clubs' },
]

const reactions = ['👏', '😂', '🔥', '🙏', '😮']

// TODO: WebRTC signalling
// TODO: Camera/mic real stream
// TODO: STUN/TURN server
function GameTable({ copy, language, playerName, roomCode, roomData, selectedGame, onSendMessage, onLeave }) {
  const [cameraOn, setCameraOn] = useState(false)
  const [muted, setMuted] = useState(true)
  const [activeReaction, setActiveReaction] = useState('')

  const roomPlayers = roomData?.players?.length ? roomData.players : [{ id: 'local', name: playerName || 'You' }]
  const seats = [
    ...roomPlayers.slice(0, 6),
    ...Array.from({ length: Math.max(0, 2 - roomPlayers.length) }, (_, index) => ({
      id: `open-${index}`,
      name: `Guest ${index + 1}`,
      role: 'guest',
      ready: false,
    })),
  ].slice(0, 6)
  const currentTurn = seats[0]?.name || playerName || 'You'

  return (
    <section className="table-layout">
      <div className="section-heading table-heading">
        <div>
          <p className="eyebrow">{copy.table.sampleMode}</p>
          <h1>{copy.table.title}</h1>
          <p>
            {selectedGame.name[language]} · {roomCode || '------'}
          </p>
        </div>
        <button className="danger-button" type="button" onClick={onLeave}>
          {copy.actions.leaveRoom}
        </button>
      </div>

      <div className="table-grid">
        <section className="card-table-zone">
          <div className="score-strip" aria-label={copy.labels.scoreboard}>
            <span>{copy.labels.scoreboard}</span>
            <strong>{seats[0]?.name || 'You'} 18</strong>
            <strong>{seats[1]?.name || 'Guest'} 14</strong>
            <strong>Round 1</strong>
          </div>

          <div className="green-table" aria-label="Virtual green card table">
            {seats.slice(0, 6).map((seat, index) => (
              <span className={`seat seat-${index + 1}`} key={seat.id || seat.name}>
                <b>{seat.name}</b>
                <small>{index === 0 ? copy.labels.currentTurn : 'Waiting'}</small>
              </span>
            ))}
            <div className="table-center">
              <div className="sample-deck" aria-label="Sample card deck">
                <span className="deck-back deck-one">M</span>
                <span className="deck-back deck-two">M</span>
                <span className="deck-back deck-three">M</span>
              </div>
              <span className="turn-pill">{copy.labels.currentTurn}: {currentTurn}</span>
              {activeReaction && <strong className="reaction-pop">{activeReaction}</strong>}
            </div>
          </div>

          <div className="hand-strip">
            <div>
              <p className="panel-label">{copy.table.yourHand}</p>
              <div className="hand-cards">
                {hand.map((card) => (
                  <Card key={card.label} {...card} />
                ))}
              </div>
            </div>
            <div className="reaction-group" aria-label={copy.table.reactions}>
              {reactions.map((reaction) => (
                <button className="reaction-button" key={reaction} type="button" onClick={() => setActiveReaction(reaction)}>
                  {reaction}
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="side-stack">
          <section className="side-panel">
            <h2>{copy.labels.videoCall}</h2>
            <div className="video-grid">
              {seats.map((seat, index) => (
                <div className="video-tile" key={seat.id || seat.name}>
                  <span>{seat.name.slice(0, 1).toUpperCase()}</span>
                  <strong>{seat.name}</strong>
                  <small>{index === 0 && cameraOn ? 'Camera preview' : 'Video placeholder'}</small>
                </div>
              ))}
            </div>
            <div className="media-controls">
              <button className="chip-button" type="button" onClick={() => setCameraOn(!cameraOn)}>
                {cameraOn ? copy.actions.cameraOff : copy.actions.cameraOn}
              </button>
              <button className="chip-button" type="button" onClick={() => setMuted(!muted)}>
                {muted ? copy.actions.unmute : copy.actions.mute}
              </button>
              <button className="danger-button small-danger" type="button" onClick={onLeave}>
                {copy.actions.leaveRoom}
              </button>
            </div>
          </section>

          <section className="side-panel">
            <ChatPanel
              title={copy.labels.chat}
              messages={roomData?.messages || []}
              playerName={playerName}
              onSendMessage={onSendMessage}
            />
          </section>
        </aside>
      </div>
    </section>
  )
}

export default GameTable
