import { useMemo, useState } from 'react'

function readRoomFromHash() {
  const match = window.location.hash.match(/#\/room\/([A-Za-z0-9]+)/)
  return match ? match[1].toUpperCase().slice(0, 6) : ''
}

function Room({
  copy,
  playerName,
  setPlayerName,
  roomCode,
  existingRoomCodes,
  isValidRoomCode,
  onCreateRoomCode,
  onEnterLobby,
}) {
  const [nameInput, setNameInput] = useState(playerName)
  const [joinCode, setJoinCode] = useState(readRoomFromHash() || roomCode || '')
  const [status, setStatus] = useState('')
  const shareCode = useMemo(() => joinCode.trim().toUpperCase() || roomCode, [joinCode, roomCode])

  function cleanName() {
    return nameInput.trim() || 'Guest'
  }

  function createRoom() {
    const code = onCreateRoomCode()
    setPlayerName(cleanName())
    setJoinCode(code)
    const result = onEnterLobby({ playerName: cleanName(), roomCode: code, mode: 'create' })

    if (!result?.ok) {
      setStatus(result?.message || 'Could not create room.')
    }
  }

  function joinRoom(event) {
    event.preventDefault()
    const code = joinCode.trim().toUpperCase()

    if (!isValidRoomCode(code)) {
      setStatus('Room code must be exactly 6 letters or numbers.')
      return
    }

    setPlayerName(cleanName())
    const result = onEnterLobby({ playerName: cleanName(), roomCode: code, mode: 'join' })

    if (!result?.ok) {
      setStatus(result?.message || 'Could not join room.')
    }
  }

  async function shareRoom() {
    const code = isValidRoomCode(shareCode) ? shareCode : onCreateRoomCode()
    const link = `${window.location.origin}${window.location.pathname}#/room/${code}`

    try {
      await navigator.clipboard.writeText(link)
      setStatus(`Room link copied: ${code}`)
    } catch {
      setStatus(link)
    }
  }

  return (
    <section className="room-layout">
      <div className="section-heading">
        <p className="eyebrow">{copy.nav.room}</p>
        <h1>{copy.room.title}</h1>
        <p>{copy.disclaimer}</p>
      </div>

      <form className="room-panel" onSubmit={joinRoom}>
        <label>
          <span>{copy.labels.playerName}</span>
          <input
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
            placeholder="Ajinkya"
            autoComplete="name"
          />
        </label>

        <div className="room-actions-grid">
          <div className="room-action-card">
            <h2>{copy.actions.createRoom}</h2>
            <p>{copy.room.createHelp}</p>
            <button className="primary-button" type="button" onClick={createRoom}>
              {copy.actions.createRoom}
            </button>
          </div>

          <div className="room-action-card">
            <h2>{copy.actions.joinRoom}</h2>
            <p>{copy.room.joinHelp}</p>
            <label>
              <span>{copy.labels.roomCode}</span>
              <input
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value.toUpperCase().slice(0, 6))}
                placeholder="ABC123"
                autoCapitalize="characters"
              />
            </label>
            <button className="secondary-button" type="submit">
              {copy.actions.joinRoom}
            </button>
          </div>
        </div>

        <div className="share-strip">
          <span>
            {copy.room.lastRoom}: <strong>{shareCode || '------'}</strong>
          </span>
          <small>{existingRoomCodes.length} local room{existingRoomCodes.length === 1 ? '' : 's'} saved</small>
          <button className="chip-button" type="button" onClick={shareRoom}>
            {copy.actions.shareRoom}
          </button>
        </div>

        {status && <p className="form-status">{status}</p>}
      </form>
    </section>
  )
}

export default Room
