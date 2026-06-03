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
import Profile from './components/Profile.jsx'
import EditProfile from './components/EditProfile.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import Achievements from './components/Achievements.jsx'
import { avatars } from './data/avatars.js'
import { writeJson, readJson } from './utils/localStorage.js'

const storageKeys = {
  playerName: 'mch_player_name',
  language: 'mch_language',
  theme: 'mch_theme',
  lastRoom: 'mch_last_room',
  rooms: 'mch_rooms',
  playerProfile: 'mch_player_profile',
  achievements: 'mch_unlocked_achievements',
  notifications: 'mch_notifications',
}

const roomAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const minimumPlayers = 2

// TODO: Supabase Authentication
// TODO: Supabase Presence
// TODO: Friends Database
// TODO: Realtime Rooms
// TODO: Chat Sync
// TODO: WebRTC Video
// TODO: WebRTC Audio
// TODO: Supabase Auth
// TODO: Supabase Realtime rooms
// TODO: Chat messages
// TODO: Player presence
// TODO: Game state sync
// TODO: WebRTC signalling
// TODO: Camera/mic real stream
// TODO: STUN/TURN server

function createDefaultProfile(savedName = '') {
  const now = new Date().toISOString()

  return {
    id: `local-${Date.now()}`,
    displayName: savedName || 'Guest Player',
    nickname: savedName ? savedName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'cards-friend',
    avatar: avatars[0].id,
    preferredLanguage: getStoredValue(storageKeys.language, 'en'),
    favoriteGame: games[0].id,
    createdAt: now,
  }
}

function createInitialNotifications() {
  const now = Date.now()

  return [
    {
      id: 'friend-joined-room',
      icon: '👋',
      title: 'Friend joined room',
      message: 'Mrunal joined your local sample room.',
      createdAt: new Date(now - 240000).toISOString(),
      read: false,
    },
    {
      id: 'achievement-unlocked',
      icon: '🏆',
      title: 'Achievement unlocked',
      message: 'First Game is ready to unlock.',
      createdAt: new Date(now - 180000).toISOString(),
      read: false,
    },
    {
      id: 'game-started',
      icon: '🎴',
      title: 'Game started',
      message: 'Your next local table is ready.',
      createdAt: new Date(now - 120000).toISOString(),
      read: true,
    },
  ]
}

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
      avatar: 'ace-card',
      text: `Room ${code} is ready for private social play.`,
      timestamp: new Date(now - 120000).toISOString(),
      system: true,
    },
    {
      id: `${code}-mrunal`,
      playerName: 'Mrunal',
      avatar: 'card-queen',
      text: 'Code mila, joining now 🙂',
      timestamp: new Date(now - 90000).toISOString(),
    },
    {
      id: `${code}-aai`,
      playerName: 'Aai',
      avatar: 'marathi-theme',
      text: 'आधी नियम ठरवूया.',
      timestamp: new Date(now - 45000).toISOString(),
    },
  ]
}

function createSamplePlayers(hostName, hostRole = 'host') {
  return [
    { id: 'local', name: hostName || 'You', role: hostRole, ready: false, online: true, avatar: avatars[0].id, favoriteGame: games[0].id },
    { id: 'mrunal', name: 'Mrunal', role: 'guest', ready: true, online: true, avatar: 'card-queen', favoriteGame: 'mendicot' },
    { id: 'sanket', name: 'Sanket', role: 'guest', ready: false, online: true, avatar: 'modern-gamer', favoriteGame: 'call-break' },
    { id: 'aai', name: 'Aai', role: 'guest', ready: true, online: true, avatar: 'marathi-theme', favoriteGame: 'rummy' },
  ]
}

function createRoomData({ code, playerProfile, playerName: hostName, selectedGameId, hostRole = 'host' }) {
  const now = new Date().toISOString()
  const players = createSamplePlayers(hostName, hostRole).map((player) =>
    player.id === 'local'
      ? {
          ...player,
          name: playerProfile.displayName,
          avatar: playerProfile.avatar,
          favoriteGame: playerProfile.favoriteGame,
        }
      : player,
  )

  return {
    code,
    hostName: hostRole === 'host' ? hostName : 'Shared Host',
    selectedGameId,
    createdAt: now,
    updatedAt: now,
    players,
    messages: createInitialMessages(code),
  }
}

function parseRoute() {
  const path = window.location.pathname.replace(/^\/+/, '')
  const hash = window.location.hash.replace(/^#\/?/, '')
  const route = hash || path
  const [screen, roomCode] = route.split('/')
  const knownScreens = [
    'home',
    'guides',
    'room',
    'lobby',
    'table',
    'install',
    'profile',
    'edit-profile',
    'leaderboard',
    'achievements',
  ]

  if (!screen) {
    return { screen: 'home', roomCode: '' }
  }

  if ((screen === 'room' || screen === 'join') && roomCode) {
    return { screen, roomCode: roomCode.toUpperCase() }
  }

  if (knownScreens.includes(screen)) {
    return { screen, roomCode: '' }
  }

  return { screen: 'home', roomCode: '' }
}

function App() {
  const initialRoute = parseRoute()
  const initialPlayerName = getStoredValue(storageKeys.playerName, '')
  const [screen, setScreen] = useState(initialRoute.screen)
  const [playerName, setPlayerName] = useState(() => initialPlayerName)
  const [language, setLanguage] = useState(() => getStoredValue(storageKeys.language, 'en'))
  const [theme, setTheme] = useState(() => getStoredValue(storageKeys.theme, 'midnight'))
  const [rooms, setRooms] = useState(readStoredRooms)
  const [playerProfile, setPlayerProfile] = useState(() =>
    readJson(storageKeys.playerProfile, createDefaultProfile(initialPlayerName)),
  )
  const [unlockedAchievements, setUnlockedAchievements] = useState(() =>
    readJson(storageKeys.achievements, ['first-game']),
  )
  const [notifications, setNotifications] = useState(() =>
    readJson(storageKeys.notifications, createInitialNotifications()),
  )
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
  const favoriteGame = useMemo(
    () => games.find((game) => game.id === playerProfile.favoriteGame) || games[0],
    [playerProfile.favoriteGame],
  )

  useEffect(() => {
    localStorage.setItem(storageKeys.language, language)
    document.documentElement.lang = language === 'mr' ? 'mr' : 'en'
  }, [language])

  useEffect(() => {
    localStorage.setItem(storageKeys.theme, theme)
  }, [theme])

  useEffect(() => {
    writeJson(storageKeys.playerProfile, playerProfile)
    if (playerProfile.displayName.trim()) {
      localStorage.setItem(storageKeys.playerName, playerProfile.displayName.trim())
    }
  }, [playerProfile])

  useEffect(() => {
    writeJson(storageKeys.achievements, unlockedAchievements)
  }, [unlockedAchievements])

  useEffect(() => {
    writeJson(storageKeys.notifications, notifications)
  }, [notifications])

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
    const onRouteChange = () => {
      const nextRoute = parseRoute()
      setScreen(nextRoute.screen)
      if (nextRoute.roomCode) {
        const cleanCode = normalizeRoomCode(nextRoute.roomCode)
        setRoomCode(cleanCode)
        setRoomData(readStoredRooms()[cleanCode] || null)
      }
    }

    window.addEventListener('hashchange', onRouteChange)
    window.addEventListener('popstate', onRouteChange)
    return () => {
      window.removeEventListener('hashchange', onRouteChange)
      window.removeEventListener('popstate', onRouteChange)
    }
  }, [])

  function navigate(nextScreen, nextRoomCode = roomCode) {
    setScreen(nextScreen)
    if (nextRoomCode) {
      const cleanCode = normalizeRoomCode(nextRoomCode)
      setRoomCode(cleanCode)
      setRoomData((current) => current || rooms[cleanCode] || null)
    }

    if (window.location.pathname !== '/') {
      window.history.replaceState(null, '', '/')
    }

    const nextHash =
      nextScreen === 'home'
        ? '#/'
        : nextScreen === 'room' && nextRoomCode
          ? `#/room/${normalizeRoomCode(nextRoomCode)}`
          : nextScreen === 'join' && nextRoomCode
            ? `#/join/${normalizeRoomCode(nextRoomCode)}`
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
            playerProfile,
            playerName: cleanName,
            selectedGameId,
            hostRole: details.mode === 'join' ? 'guest' : 'host',
          })
        : { ...existingRoom, updatedAt: new Date().toISOString() }

    nextRoom = {
      ...nextRoom,
      players: nextRoom.players.some((player) => player.id === 'local')
        ? nextRoom.players.map((player) =>
            player.id === 'local'
              ? {
                  ...player,
                  name: cleanName,
                  avatar: playerProfile.avatar,
                  favoriteGame: playerProfile.favoriteGame,
                  online: true,
                }
              : player,
          )
        : [
            {
              id: 'local',
              name: cleanName,
              role: 'guest',
              ready: false,
              online: true,
              avatar: playerProfile.avatar,
              favoriteGame: playerProfile.favoriteGame,
            },
            ...nextRoom.players,
          ],
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
    addNotification({
      icon: '👋',
      title: details.mode === 'create' ? 'Room created' : 'Friend joined room',
      message: `${cleanName} entered room ${cleanRoom}.`,
    })
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
          avatar: playerProfile.avatar,
          text: text.trim(),
          timestamp: new Date().toISOString(),
        },
      ],
    })
  }

  function addNotification(notification) {
    setNotifications((current) => [
      {
        id: `${Date.now()}-${notification.title}`,
        createdAt: new Date().toISOString(),
        read: false,
        ...notification,
      },
      ...current,
    ].slice(0, 12))
  }

  function handleInviteCopied(title, link) {
    addNotification({
      icon: '📨',
      title,
      message: link,
    })
  }

  function handleStartGame() {
    addNotification({
      icon: '🎴',
      title: 'Game started',
      message: `${selectedGame.name.en} started in room ${roomCode}.`,
    })
    navigate('table')
  }

  function handleSaveProfile(nextProfile) {
    const savedProfile = { ...nextProfile, id: nextProfile.id || playerProfile.id }
    setPlayerProfile(savedProfile)
    setPlayerName(savedProfile.displayName)
    setLanguage(savedProfile.preferredLanguage)

    if (roomData) {
      updateRoom({
        ...roomData,
        players: roomData.players.map((player) =>
          player.id === 'local'
            ? {
                ...player,
                name: savedProfile.displayName,
                avatar: savedProfile.avatar,
                favoriteGame: savedProfile.favoriteGame,
              }
            : player,
        ),
      })
    }

    addNotification({
      icon: '👤',
      title: 'Profile updated',
      message: `${savedProfile.displayName}'s profile is saved locally.`,
    })
  }

  function handleToggleAchievement(achievementId) {
    const unlocked = unlockedAchievements.includes(achievementId)

    setUnlockedAchievements(
      unlocked
        ? unlockedAchievements.filter((id) => id !== achievementId)
        : [...unlockedAchievements, achievementId],
    )

    if (!unlocked) {
      addNotification({
        icon: '🏆',
        title: 'Achievement unlocked',
        message: achievementId.replace(/-/g, ' '),
      })
    }
  }

  function handleMarkAllNotificationsRead() {
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })))
  }

  const sharedProps = {
    copy,
    language,
    playerName,
    roomCode,
    setLanguage,
    setPlayerName,
    navigate,
    playerProfile,
  }

  return (
    <div className="app-root" data-theme={theme}>
      <Header
        copy={copy}
        language={language}
        screen={screen}
        theme={theme}
        notifications={notifications}
        onNavigate={navigate}
        onLanguageChange={setLanguage}
        onThemeChange={() => setTheme((current) => (current === 'midnight' ? 'royal' : 'midnight'))}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
      />

      <main className="screen-shell">
        {screen === 'home' && <Home {...sharedProps} />}
        {screen === 'guides' && <GameGuides copy={copy} language={language} games={games} />}
        {(screen === 'room' || screen === 'join') && (
          <Room
            {...sharedProps}
            existingRoomCodes={Object.keys(rooms)}
            isValidRoomCode={isValidRoomCode}
            onCreateRoomCode={handleCreateRoomCode}
            onEnterLobby={handleEnterLobby}
            onInviteCopied={handleInviteCopied}
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
            onInviteCopied={handleInviteCopied}
            onStart={handleStartGame}
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
        {screen === 'profile' && (
          <Profile
            profile={playerProfile}
            favoriteGameName={`${favoriteGame.name.en} / ${favoriteGame.name.mr}`}
            onNavigate={navigate}
          />
        )}
        {screen === 'edit-profile' && (
          <EditProfile
            profile={playerProfile}
            games={games}
            onSaveProfile={handleSaveProfile}
            onNavigate={navigate}
          />
        )}
        {screen === 'leaderboard' && <Leaderboard playerProfile={playerProfile} games={games} />}
        {screen === 'achievements' && (
          <Achievements
            unlockedAchievements={unlockedAchievements}
            onToggleAchievement={handleToggleAchievement}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>{copy.disclaimer}</p>
      </footer>
    </div>
  )
}

export default App
