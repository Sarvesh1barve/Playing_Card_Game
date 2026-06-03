import { useState } from 'react'

function formatNotificationTime(timestamp) {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

function NotificationCenter({ notifications, onMarkAllRead }) {
  const [open, setOpen] = useState(false)
  const unreadCount = notifications.filter((notification) => !notification.read).length

  return (
    <div className="notification-center">
      <button className="chip-button notification-button" type="button" onClick={() => setOpen(!open)}>
        🔔
        {unreadCount > 0 && <span>{unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-menu">
          <div className="notification-head">
            <strong>Notifications</strong>
            <button className="tiny-link" type="button" onClick={onMarkAllRead}>
              Mark read
            </button>
          </div>
          <div className="notification-list">
            {notifications.length === 0 && <p>No notifications yet.</p>}
            {notifications.map((notification) => (
              <article className={notification.read ? 'notification-item read' : 'notification-item'} key={notification.id}>
                <span>{notification.icon}</span>
                <div>
                  <strong>{notification.title}</strong>
                  <p>{notification.message}</p>
                  <time dateTime={notification.createdAt}>{formatNotificationTime(notification.createdAt)}</time>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationCenter
