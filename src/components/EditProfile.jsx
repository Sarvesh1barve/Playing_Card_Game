import { useState } from 'react'
import { avatars } from '../data/avatars.js'
import AvatarBadge from './AvatarBadge.jsx'

function EditProfile({ profile, games, onSaveProfile, onNavigate }) {
  const [form, setForm] = useState(profile)

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function saveProfile(event) {
    event.preventDefault()
    onSaveProfile({
      ...form,
      displayName: form.displayName.trim() || 'Guest Player',
      nickname: form.nickname.trim() || 'cards-friend',
    })
    onNavigate('profile')
  }

  return (
    <section className="content-stack">
      <div className="section-heading">
        <p className="eyebrow">Player Profile</p>
        <h1>Edit Profile</h1>
        <p>Stored only in this browser using localStorage.</p>
      </div>

      <form className="profile-form" onSubmit={saveProfile}>
        <div className="profile-form-grid">
          <label>
            <span>Display Name</span>
            <input value={form.displayName} onChange={(event) => updateField('displayName', event.target.value)} />
          </label>
          <label>
            <span>Nickname</span>
            <input value={form.nickname} onChange={(event) => updateField('nickname', event.target.value)} />
          </label>
          <label>
            <span>Preferred Language</span>
            <select
              value={form.preferredLanguage}
              onChange={(event) => updateField('preferredLanguage', event.target.value)}
            >
              <option value="en">English</option>
              <option value="mr">Marathi</option>
            </select>
          </label>
          <label>
            <span>Favorite Game</span>
            <select value={form.favoriteGame} onChange={(event) => updateField('favoriteGame', event.target.value)}>
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name.en} / {game.name.mr}
                </option>
              ))}
            </select>
          </label>
        </div>

        <section className="avatar-gallery" aria-label="Avatar selection">
          <h2>Avatar Selection</h2>
          <div className="avatar-grid">
            {avatars.map((avatar) => (
              <button
                className={form.avatar === avatar.id ? 'avatar-option selected' : 'avatar-option'}
                key={avatar.id}
                type="button"
                onClick={() => updateField('avatar', avatar.id)}
              >
                <AvatarBadge avatarId={avatar.id} name={avatar.name} size="lg" />
                <span>{avatar.name}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="form-actions">
          <button className="secondary-button" type="button" onClick={() => onNavigate('profile')}>
            Cancel
          </button>
          <button className="primary-button" type="submit">
            Save Profile
          </button>
        </div>
      </form>
    </section>
  )
}

export default EditProfile
