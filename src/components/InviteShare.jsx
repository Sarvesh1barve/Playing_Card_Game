function createInviteText(roomCode) {
  return `Join my Maharashtra Cards Hub room: ${roomCode}`
}

function InviteShare({ roomCode, onInviteCopied }) {
  const invitePath = `/join/${roomCode || 'ROOM'}`
  const inviteUrl = `${window.location.origin}${invitePath}`
  const message = createInviteText(roomCode || 'ROOM')
  const encodedUrl = encodeURIComponent(inviteUrl)
  const encodedText = encodeURIComponent(`${message}\n${inviteUrl}`)

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      onInviteCopied?.('Invite copied', inviteUrl)
    } catch {
      onInviteCopied?.('Copy manually', inviteUrl)
    }
  }

  async function nativeShare() {
    if (!navigator.share) {
      await copyInvite()
      return
    }

    try {
      await navigator.share({
        title: 'Maharashtra Cards Hub',
        text: message,
        url: inviteUrl,
      })
      onInviteCopied?.('Invite shared', inviteUrl)
    } catch {
      onInviteCopied?.('Share cancelled', inviteUrl)
    }
  }

  return (
    <div className="invite-share">
      <div>
        <span>Invite link</span>
        <strong>{invitePath}</strong>
      </div>
      <div className="invite-buttons">
        <button className="chip-button" type="button" onClick={copyInvite}>
          Copy
        </button>
        <a className="chip-link" href={`https://wa.me/?text=${encodedText}`} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
        <a className="chip-link" href={`https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer">
          Telegram
        </a>
        <button className="chip-button" type="button" onClick={nativeShare}>
          Share
        </button>
      </div>
    </div>
  )
}

export default InviteShare
