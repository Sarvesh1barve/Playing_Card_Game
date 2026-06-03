import { useEffect, useRef, useState } from 'react'
import AvatarBadge from './AvatarBadge.jsx'

const emojis = ['🙂', '😂', '👏', '🔥', '🙏', '🎉']

function formatTime(timestamp) {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

function ChatPanel({ title, messages, playerName, onSendMessage, compact = false }) {
  const [draft, setDraft] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  function sendMessage(event) {
    event.preventDefault()
    if (!draft.trim()) {
      return
    }

    onSendMessage(draft)
    setDraft('')
  }

  function addEmoji(emoji) {
    setDraft((current) => `${current}${emoji}`)
  }

  return (
    <section className={compact ? 'chat-box compact-chat' : 'chat-box'}>
      {title && <h2>{title}</h2>}
      <div className="chat-scroll" ref={scrollRef}>
        {messages.map((message) => (
          <article className={message.system ? 'chat-message system' : 'chat-message'} key={message.id}>
            <div className="chat-message-head">
              <AvatarBadge avatarId={message.avatar || 'ace-card'} name={message.playerName} size="sm" />
              <div className="chat-meta">
                <strong>{message.playerName}</strong>
                <time dateTime={message.timestamp}>{formatTime(message.timestamp)}</time>
              </div>
            </div>
            <p>{message.text}</p>
          </article>
        ))}
      </div>

      <div className="emoji-row" aria-label="Emoji reactions for chat">
        {emojis.map((emoji) => (
          <button className="emoji-chip" key={emoji} type="button" onClick={() => addEmoji(emoji)}>
            {emoji}
          </button>
        ))}
      </div>

      <form className="chat-form" onSubmit={sendMessage}>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={`${playerName || 'Guest'}: type a message`}
        />
        <button className="chip-button" type="submit">
          Send
        </button>
      </form>
    </section>
  )
}

export default ChatPanel
