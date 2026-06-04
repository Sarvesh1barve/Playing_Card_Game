import { useEffect, useMemo, useRef } from 'react'
import { supabase } from '../lib/supabase.js'
import { fetchRoomById } from '../lib/supabase-services.js'

export function useRoomRealtime({
  enabled,
  room,
  player,
  playerProfile,
  currentScreen,
  onRoomChange,
  onBroadcast,
}) {
  const roomRef = useRef(room)
  const channelRef = useRef(null)
  const localReady = useMemo(
    () => room?.players?.find((roomPlayer) => roomPlayer.playerId === player?.id || roomPlayer.id === 'local')?.ready || false,
    [player?.id, room?.players],
  )

  useEffect(() => {
    roomRef.current = room
  }, [room])

  useEffect(() => {
    if (!enabled || !supabase || !room?.id || !player?.id) {
      return undefined
    }

    let disposed = false
    const channel = supabase.channel(`room:${room.id}`, {
      config: {
        presence: {
          key: player.id,
        },
      },
    })
    channelRef.current = channel

    async function refreshRoom() {
      try {
        const nextRoom = await fetchRoomById(room.id, player.id)
        if (!disposed) {
          onRoomChange(applyPresence(nextRoom, channel.presenceState()))
        }
      } catch (error) {
        console.info('Supabase room refresh skipped:', error.message)
      }
    }

    function applyPresence(nextRoom, presenceState) {
      const presenceRows = Object.values(presenceState || {}).flat()
      const onlineByPlayer = new Map(presenceRows.map((presence) => [presence.player_id, presence]))

      return {
        ...nextRoom,
        players: nextRoom.players.map((roomPlayer) => {
          const presence = onlineByPlayer.get(roomPlayer.playerId)
          return {
            ...roomPlayer,
            online: Boolean(presence),
            ready: presence?.ready ?? roomPlayer.ready,
          }
        }),
      }
    }

    channel
      .on('presence', { event: 'sync' }, () => {
        const currentRoom = roomRef.current
        if (currentRoom) {
          onRoomChange(applyPresence(currentRoom, channel.presenceState()))
        }
      })
      .on('broadcast', { event: 'typing' }, (payload) => onBroadcast?.('typing', payload.payload))
      .on('broadcast', { event: 'emoji-reaction' }, (payload) => onBroadcast?.('emoji-reaction', payload.payload))
      .on('broadcast', { event: 'video-signal-placeholder' }, (payload) =>
        onBroadcast?.('video-signal-placeholder', payload.payload),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `room_id=eq.${room.id}` }, refreshRoom)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${room.id}` }, refreshRoom)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${room.id}` }, refreshRoom)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_state', filter: `room_id=eq.${room.id}` }, refreshRoom)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            player_id: player.id,
            display_name: playerProfile.displayName,
            avatar: playerProfile.avatar,
            favorite_game: playerProfile.favoriteGame,
            ready: localReady,
            current_screen: currentScreen,
          })
        }
      })

    return () => {
      disposed = true
      channelRef.current = null
      supabase.removeChannel(channel)
    }
  }, [currentScreen, enabled, localReady, onBroadcast, onRoomChange, player?.id, playerProfile, room?.id])

  function sendBroadcast(event, payload) {
    if (!enabled || !channelRef.current) {
      return
    }

    channelRef.current.send({
      type: 'broadcast',
      event,
      payload,
    })
  }

  return { sendBroadcast }
}
