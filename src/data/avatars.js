export const avatars = [
  {
    id: 'maharaja',
    name: 'Maharaja',
    emoji: '👑',
    accent: '#d6a84b',
  },
  {
    id: 'warrior',
    name: 'Warrior',
    emoji: '⚔️',
    accent: '#c14f33',
  },
  {
    id: 'tiger',
    name: 'Tiger',
    emoji: '🐯',
    accent: '#f08a24',
  },
  {
    id: 'eagle',
    name: 'Eagle',
    emoji: '🦅',
    accent: '#7fb2ff',
  },
  {
    id: 'lion',
    name: 'Lion',
    emoji: '🦁',
    accent: '#d9a441',
  },
  {
    id: 'card-king',
    name: 'Playing Card King',
    emoji: '🤴',
    accent: '#b6252f',
  },
  {
    id: 'card-queen',
    name: 'Playing Card Queen',
    emoji: '👸',
    accent: '#c95ca4',
  },
  {
    id: 'ace-card',
    name: 'Ace Card',
    emoji: '🂡',
    accent: '#f6e9c7',
  },
  {
    id: 'marathi-theme',
    name: 'Traditional Marathi Theme',
    emoji: '🪔',
    accent: '#e0a11b',
  },
  {
    id: 'modern-gamer',
    name: 'Modern Gamer',
    emoji: '🎮',
    accent: '#63d2ff',
  },
]

export function getAvatarById(id) {
  return avatars.find((avatar) => avatar.id === id) || avatars[0]
}
