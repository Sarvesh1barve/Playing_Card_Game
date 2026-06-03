import { useEffect, useMemo, useState } from 'react'
import { games } from './data/games.js'
import { translations } from './i18n/translations.js'
import Header from './components/Header.jsx'
import Home from './components/Home.jsx'
import GameGuides from './components/GameGuides.jsx'
import Room from './components/Room.jsx'
import Lobby from './components/Lobby.jsx'
import GameTable from './components/GameTable.jsx'
import InstallGuide from './components/InstallGuide.jsx'

const storageKeys = {
  playerName: 'mch_player_name',
  language: 'mch_language',
  theme: 'mch_theme',
  lastRoom: 'mch_last_room',
  rooms: 'mch_rooms',
}

const roomAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const minimumPlayers = 2

// TODO: Supabase Auth
// TODO: Supabase Realtime rooms
// TODO: Chat messages
// TODO: Player presence
// TODO: Game state sync
// TODO: WebRTC signalling
// TODO: Camera/mic real stream
// TODO: STUN/TURN server

function getStoredValue(key, fallback) {
  return localStorage.getItem(key) || fallback
}

function readStoredRooms() {
  try {
    return JSON.parse(localStorage.getItem(storageKeys.rooms) || '{}')
  } catch {
    return {}
  }
}

function writeStoredRooms(rooms) {
  localStorage.setItem(storageKeys.rooms, JSON.stringify(rooms))
}

function normalizeRoomCode(code) {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
}

function isValidRoomCode(code) {
  return /^[A-Z0-9]{6}$/.test(code)
}

function createUniqueRoomCode(rooms) {
  let code = ''

  do {
    code = Array.from(
      { length: 6 },
      () => roomAlphabet[Math.floor(Math.random() * roomAlphabet.length)],
    ).join('')
  } while (rooms[code])

  return code
}

function createInitialMessages(code) {
  const now = Date.now()

  return [
    {
      id: `${code}-welcome`,
      playerName: 'System',
      text: `Room ${code} is ready for private social play.`,
      timestamp: new Date(now - 120000).toISOString(),
      system: true,
    },
    {
      id: `${code}-mrunal`,
      playerName: 'Mrunal',
      text: 'Code mila, joining now 🙂',
      timestamp: new Date(now - 90000).toISOString(),
    },
    {
      id: `${code}-aai`,
      playerName: 'Aai',
      text: 'आधी नियम ठरवूया.',
      timestamp: new Date(now - 45000).toISOString(),
    },
  ]
}

function createSamplePlayers(hostName, hostRole = 'host') {
  return [
    { id: 'local', name: hostName || 'You', role: hostRole, ready: false, online: true },
    { id: 'mrunal', name: 'Mrunal', role: 'guest', ready: true, online: true },
    { id: 'sanket', name: 'Sanket', role: 'guest', ready: false, online: true },
    { id: 'aai', name: 'Aai', role: 'guest', ready: true, online: true },
  ]
}

function createRoomData({ code, playerName: hostName, selectedGameId, hostRole = 'host' }) {
  const now = new Date().toISOString()

  return {
    code,
    hostName: hostRole === 'host' ? hostName : 'Shared Host',
    selectedGameId,
    createdAt: now,
    updatedAt: now,
    players: createSamplePlayers(hostName, hostRole),
    messages: createInitialMessages(code),
  }
}

function parseHash() {
  const hash = window.location.hash.replace(/^#\/?/, '')
  const [screen, roomCode] = hash.split('/')
  const knownScreens = ['home', 'guides', 'room', 'lobby', 'table', 'install']

  if (!screen) {
    return { screen: 'home', roomCode: '' }
  }

  if (screen === 'room' && roomCode) {
    return { screen: 'room', roomCode: roomCode.toUpperCase() }
  }

  if (knownScreens.includes(screen)) {
    return { screen, roomCode: '' }
  }

  return { screen: 'home', roomCode: '' }
}

function App() {
  const initialRoute = parseHash()
  const [screen, setScreen] = useState(initialRoute.screen)
  const [playerName, setPlayerName] = useState(() => getStoredValue(storageKeys.playerName, ''))
  const [language, setLanguage] = useState(() => getStoredValue(storageKeys.language, 'en'))
  const [theme, setTheme] = useState(() => getStoredValue(storageKeys.theme, 'midnight'))
  const [rooms, setRooms] = useState(readStoredRooms)
  const [roomCode, setRoomCode] = useState(
    () => normalizeRoomCode(initialRoute.roomCode || getStoredValue(storageKeys.lastRoom, '')),
  )
  const [selectedGameId, setSelectedGameId] = useState(games[0].id)
  const [roomData, setRoomData] = useState(() => {
    const code = normalizeRoomCode(initialRoute.roomCode || getStoredValue(storageKeys.lastRoom, ''))
    return code ? readStoredRooms()[code] || null : null
  })

  const copy = translations[language] || translations.en
  const effectiveSelectedGameId = roomData?.selectedGameId || selectedGameId
  const selectedGame = useMemo(
    () => games.find((game) => game.id === effectiveSelectedGameId) || games[0],
    [effectiveSelectedGameId],
  )

  useEffect(() => {
    localStorage.setItem(storageKeys.language, language)
    document.documentElement.lang = language === 'mr' ? 'mr' : 'en'
  }, [language])

  useEffect(() => {
    localStorage.setItem(storageKeys.theme, theme)
  }, [theme])

  useEffect(() => {
    if (playerName.trim()) {
      localStorage.setItem(storageKeys.playerName, playerName.trim())
    }
  }, [playerName])

  useEffect(() => {
    if (roomCode.trim()) {
      localStorage.setItem(storageKeys.lastRoom, roomCode.trim().toUpperCase())
    }
  }, [roomCode])

  useEffect(() => {
    const onHashChange = () => {
      const nextRoute = parseHash()
      setScreen(nextRoute.screen)
      if (nextRoute.roomCode) {
        const cleanCode = normalizeRoomCode(nextRoute.roomCode)
        setRoomCode(cleanCode)
        setRoomData(readStoredRooms()[cleanCode] || null)
      }
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  function navigate(nextScreen, nextRoomCode = roomCode) {
    setScreen(nextScreen)
    if (nextRoomCode) {
      const cleanCode = normalizeRoomCode(nextRoomCode)
      setRoomCode(cleanCode)
      setRoomData((current) => current || rooms[cleanCode] || null)
    }

    const nextHash =
      nextScreen === 'home'
        ? '#/'
        : nextScreen === 'room' && nextRoomCode
          ? `#/room/${normalizeRoomCode(nextRoomCode)}`
          : `#/${nextScreen}`

    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash
    }
  }

  function handleEnterLobby(details) {
    const cleanName = details.playerName.trim() || 'Guest'
    const cleanRoom = normalizeRoomCode(details.roomCode)

    if (!isValidRoomCode(cleanRoom)) {
      return { ok: false, message: 'Room code must be exactly 6 letters or numbers.' }
    }

    const existingRoom = rooms[cleanRoom]
    let nextRoom =
      details.mode === 'create' || !existingRoom
        ? createRoomData({
            code: cleanRoom,
            playerName: cleanName,
            selectedGameId,
            hostRole: details.mode === 'join' ? 'guest' : 'host',
          })
        : { ...existingRoom, updatedAt: new Date().toISOString() }

    nextRoom = {
      ...nextRoom,
      players: nextRoom.players.some((player) => player.id === 'local')
        ? nextRoom.players.map((player) =>
            player.id === 'local' ? { ...player, name: cleanName, online: true } : player,
          )
        : [{ id: 'local', name: cleanName, role: 'guest', ready: false, online: true }, ...nextRoom.players],
    }

    const nextRooms = { ...rooms, [cleanRoom]: nextRoom }
    setPlayerName(cleanName)
    setRoomCode(cleanRoom)
    setRooms(nextRooms)
    setRoomData(nextRoom)
    setSelectedGameId(nextRoom.selectedGameId || games[0].id)
    localStorage.setItem(storageKeys.playerName, cleanName)
    localStorage.setItem(storageKeys.lastRoom, cleanRoom)
    writeStoredRooms(nextRooms)
    navigate('lobby', cleanRoom)
    return { ok: true, room: nextRoom }
  }

  function handleCreateRoomCode() {
    return createUniqueRoomCode(rooms)
  }

  function updateRoom(nextRoom) {
    if (!nextRoom?.code) {
      return
    }

    const savedRoom = { ...nextRoom, updatedAt: new Date().toISOString() }
    const nextRooms = { ...rooms, [savedRoom.code]: savedRoom }
    setRooms(nextRooms)
    setRoomData(savedRoom)
    setRoomCode(savedRoom.code)
    setSelectedGameId(savedRoom.selectedGameId || games[0].id)
    writeStoredRooms(nextRooms)
  }

  function handleGameChange(nextGameId) {
    setSelectedGameId(nextGameId)
    if (roomData) {
      updateRoom({ ...roomData, selectedGameId: nextGameId })
    }
  }

  function handleReadyChange() {
    if (!roomData) {
      return
    }

    updateRoom({
      ...roomData,
      players: roomData.players.map((player) =>
        player.id === 'local' ? { ...player, ready: !player.ready } : player,
      ),
    })
  }

  function handleSendMessage(text) {
    if (!roomData || !text.trim()) {
      return
    }

    updateRoom({
      ...roomData,
      messages: [
        ...roomData.messages,
        {
          id: `${roomData.code}-${Date.now()}`,
          playerName: playerName || 'Guest',
          text: text.trim(),
          timestamp: new Date().toISOString(),
        },
      ],
    })
  }

  const sharedProps = {
    copy,
    language,
    playerName,
    roomCode,
    setLanguage,
    setPlayerName,
    navigate,
  }

  return (
    <div className="app-root" data-theme={theme}>
      <Header
        copy={copy}
        language={language}
        screen={screen}
        theme={theme}
        onNavigate={navigate}
        onLanguageChange={setLanguage}
        onThemeChange={() => setTheme((current) => (current === 'midnight' ? 'royal' : 'midnight'))}
      />

      <main className="screen-shell">
        {screen === 'home' && <Home {...sharedProps} />}
        {screen === 'guides' && <GameGuides copy={copy} language={language} games={games} />}
        {screen === 'room' && (
          <Room
            {...sharedProps}
            existingRoomCodes={Object.keys(rooms)}
            isValidRoomCode={isValidRoomCode}
            onCreateRoomCode={handleCreateRoomCode}
            onEnterLobby={handleEnterLobby}
          />
        )}
        {screen === 'lobby' && (
          <Lobby
            copy={copy}
            language={language}
            roomCode={roomCode}
            playerName={playerName}
            roomData={roomData}
            games={games}
            selectedGameId={roomData?.selectedGameId || selectedGameId}
            minimumPlayers={minimumPlayers}
            onGameChange={handleGameChange}
            onReadyChange={handleReadyChange}
            onSendMessage={handleSendMessage}
            onStart={() => navigate('table')}
          />
        )}
        {screen === 'table' && (
          <GameTable
            copy={copy}
            language={language}
            playerName={playerName}
            roomCode={roomCode}
            roomData={roomData}
            selectedGame={selectedGame}
            onSendMessage={handleSendMessage}
            onLeave={() => navigate('lobby')}
          />
        )}
        {screen === 'install' && <InstallGuide copy={copy} />}
      </main>

      <footer className="app-footer">
        <p>{copy.disclaimer}</p>
      </footer>
    </div>
  )
}

export default App
