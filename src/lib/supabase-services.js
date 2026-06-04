import { supabase } from './supabase.js'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured.')
  }

  return supabase
}

function toPlayerPayload(profile) {
  return {
    client_id: profile.id,
    display_name: profile.displayName || 'Guest Player',
    nickname: profile.nickname || 'cards-friend',
    avatar: profile.avatar || 'maharaja',
    preferred_language: profile.preferredLanguage || 'en',
    favorite_game: profile.favoriteGame || 'rummy',
    is_guest: true,
  }
}

function toMessage(message) {
  return {
    id: message.id,
    playerName: message.players?.display_name || 'System',
    avatar: message.players?.avatar || message.metadata?.avatar || 'ace-card',
    text: message.body,
    timestamp: message.created_at,
    system: message.message_type === 'system',
  }
}

function toRoomPlayer(row, localPlayerId) {
  return {
    id: row.player_id === localPlayerId ? 'local' : row.player_id,
    playerId: row.player_id,
    membershipId: row.id,
    name: row.players?.display_name || 'Guest',
    role: row.role,
    ready: row.is_ready,
    online: false,
    avatar: row.players?.avatar || 'maharaja',
    favoriteGame: row.players?.favorite_game || 'rummy',
    seatIndex: row.seat_index,
  }
}

async function assertNoError(result) {
  if (result.error) {
    throw result.error
  }

  return result.data
}

export async function bootstrapPlayer(profile) {
  const client = requireSupabase()
  const payload = toPlayerPayload(profile)
  const result = await client
    .from('players')
    .upsert(payload, { onConflict: 'client_id' })
    .select()
    .single()

  return assertNoError(result)
}

export async function fetchRoomById(roomId, localPlayerId) {
  const client = requireSupabase()
  const room = await assertNoError(
    await client.from('rooms').select('*').eq('id', roomId).single(),
  )
  return hydrateRoom(room, localPlayerId)
}

export async function fetchRoomByCode(roomCode, localPlayerId) {
  const client = requireSupabase()
  const room = await assertNoError(
    await client.from('rooms').select('*').eq('room_code', roomCode).single(),
  )
  return hydrateRoom(room, localPlayerId)
}

async function hydrateRoom(room, localPlayerId) {
  const client = requireSupabase()
  const [settings, players, messages] = await Promise.all([
    client.from('room_settings').select('*').eq('room_id', room.id).maybeSingle(),
    client
      .from('room_players')
      .select('*, players(*)')
      .eq('room_id', room.id)
      .is('left_at', null)
      .order('seat_index', { ascending: true, nullsFirst: false }),
    client
      .from('messages')
      .select('*, players(*)')
      .eq('room_id', room.id)
      .order('created_at', { ascending: true }),
  ])

  if (settings.error) throw settings.error
  if (players.error) throw players.error
  if (messages.error) throw messages.error

  const mappedPlayers = players.data.map((player) => toRoomPlayer(player, localPlayerId))
  const host = mappedPlayers.find((player) => player.playerId === room.host_player_id)

  return {
    id: room.id,
    source: 'supabase',
    code: room.room_code,
    hostName: host?.name || 'Host',
    selectedGameId: room.selected_game,
    status: room.status,
    settings: settings.data,
    createdAt: room.created_at,
    updatedAt: room.updated_at,
    players: mappedPlayers,
    messages: messages.data.map(toMessage),
  }
}

export async function createRemoteRoom({ code, playerProfile, selectedGameId }) {
  const client = requireSupabase()
  const player = await bootstrapPlayer(playerProfile)
  const room = await assertNoError(
    await client
      .from('rooms')
      .insert({
        room_code: code,
        host_player_id: player.id,
        selected_game: selectedGameId,
        status: 'lobby',
        is_private: true,
      })
      .select()
      .single(),
  )

  await assertNoError(
    await client.from('room_settings').insert({
      room_id: room.id,
      allow_spectators: false,
      voice_enabled: false,
      video_enabled: false,
      language: playerProfile.preferredLanguage || 'en',
      max_players: 6,
    }),
  )
  await assertNoError(
    await client.from('room_players').insert({
      room_id: room.id,
      player_id: player.id,
      role: 'host',
      seat_index: 0,
      is_ready: false,
    }),
  )
  await assertNoError(
    await client.from('game_state').insert({
      room_id: room.id,
      game_id: selectedGameId,
      phase: 'waiting',
      state: {},
      version: 1,
      last_action_by: player.id,
      last_action_at: new Date().toISOString(),
    }),
  )
  await logRoomEvent({
    roomId: room.id,
    playerId: player.id,
    eventType: 'PLAYER_JOINED',
    payload: { role: 'host' },
  })
  await sendChatMessage({
    roomId: room.id,
    playerId: null,
    body: `Room ${code} is ready for private social play.`,
    messageType: 'system',
    metadata: { avatar: 'ace-card' },
  })

  return {
    room: await fetchRoomById(room.id, player.id),
    player,
  }
}

export async function joinRemoteRoom({ code, playerProfile }) {
  const client = requireSupabase()
  const player = await bootstrapPlayer(playerProfile)
  const room = await assertNoError(
    await client.from('rooms').select('*').eq('room_code', code).single(),
  )
  const [settingsResult, membersResult] = await Promise.all([
    client.from('room_settings').select('*').eq('room_id', room.id).maybeSingle(),
    client
      .from('room_players')
      .select('seat_index, player_id')
      .eq('room_id', room.id)
      .is('left_at', null),
  ])

  if (settingsResult.error) throw settingsResult.error
  if (membersResult.error) throw membersResult.error

  const maxPlayers = settingsResult.data?.max_players || 6
  const alreadyMember = membersResult.data.some((member) => member.player_id === player.id)

  if (!alreadyMember && membersResult.data.length >= maxPlayers) {
    throw new Error('Room is full.')
  }

  const occupiedSeats = new Set(membersResult.data.map((member) => member.seat_index))
  const seatIndex = alreadyMember
    ? membersResult.data.find((member) => member.player_id === player.id)?.seat_index
    : Array.from({ length: maxPlayers }, (_, index) => index).find((index) => !occupiedSeats.has(index))

  await assertNoError(
    await client
      .from('room_players')
      .upsert(
        {
          room_id: room.id,
          player_id: player.id,
          role: room.host_player_id === player.id ? 'host' : 'guest',
          seat_index: seatIndex,
          is_ready: false,
          left_at: null,
        },
        { onConflict: 'room_id,player_id' },
      ),
  )
  await logRoomEvent({
    roomId: room.id,
    playerId: player.id,
    eventType: 'PLAYER_JOINED',
    payload: { role: room.host_player_id === player.id ? 'host' : 'guest' },
  })

  return {
    room: await fetchRoomById(room.id, player.id),
    player,
  }
}

export async function leaveRemoteRoom({ roomId, playerId }) {
  const client = requireSupabase()
  await assertNoError(
    await client
      .from('room_players')
      .update({ left_at: new Date().toISOString(), is_ready: false })
      .eq('room_id', roomId)
      .eq('player_id', playerId),
  )
  await logRoomEvent({
    roomId,
    playerId,
    eventType: 'PLAYER_LEFT',
    payload: {},
  })
}

export async function updateReadyStatus({ roomId, playerId, ready }) {
  const client = requireSupabase()
  await assertNoError(
    await client
      .from('room_players')
      .update({ is_ready: ready })
      .eq('room_id', roomId)
      .eq('player_id', playerId),
  )

  return fetchRoomById(roomId, playerId)
}

export async function updateRoomSelectedGame({ roomId, playerId, gameId }) {
  const client = requireSupabase()
  await assertNoError(
    await client.from('rooms').update({ selected_game: gameId }).eq('id', roomId),
  )
  await assertNoError(
    await client
      .from('game_state')
      .update({
        game_id: gameId,
        last_action_by: playerId,
        last_action_at: new Date().toISOString(),
      })
      .eq('room_id', roomId),
  )

  return fetchRoomById(roomId, playerId)
}

export async function startRemoteGame({ roomId, playerId }) {
  const client = requireSupabase()
  await assertNoError(
    await client.from('rooms').update({ status: 'in_game' }).eq('id', roomId),
  )
  await assertNoError(
    await client
      .from('game_state')
      .update({
        phase: 'playing',
        last_action_by: playerId,
        last_action_at: new Date().toISOString(),
      })
      .eq('room_id', roomId),
  )
  await logRoomEvent({
    roomId,
    playerId,
    eventType: 'GAME_STARTED',
    payload: {},
  })

  return fetchRoomById(roomId, playerId)
}

export async function sendChatMessage({ roomId, playerId, body, messageType = 'chat', metadata = {} }) {
  const client = requireSupabase()
  const result = await client
    .from('messages')
    .insert({
      room_id: roomId,
      player_id: playerId,
      message_type: messageType,
      body,
      metadata,
    })
    .select('*, players(*)')
    .single()

  return toMessage(await assertNoError(result))
}

export async function logRoomEvent({ roomId, playerId, eventType, payload = {} }) {
  const client = requireSupabase()
  await assertNoError(
    await client.from('room_events').insert({
      room_id: roomId,
      player_id: playerId,
      event_type: eventType,
      payload,
    }),
  )
}
