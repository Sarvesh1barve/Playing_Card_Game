import { getAvatarById } from '../data/avatars.js'

function AvatarBadge({ avatarId, name, size = 'md' }) {
  const avatar = getAvatarById(avatarId)

  return (
    <span
      className={`avatar-badge avatar-${size}`}
      style={{ '--avatar-accent': avatar.accent }}
      title={avatar.name}
      aria-label={`${name || avatar.name} avatar: ${avatar.name}`}
    >
      {avatar.emoji}
    </span>
  )
}

export default AvatarBadge
