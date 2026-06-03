import AvatarBadge from './AvatarBadge.jsx'
import { getAvatarById } from '../data/avatars.js'

function Profile({ profile, favoriteGameName, onNavigate }) {
  const avatar = getAvatarById(profile.avatar)

  return (
    <section className="content-stack">
      <div className="section-heading profile-heading">
        <div>
          <p className="eyebrow">Player Profile</p>
          <h1>View Profile</h1>
          <p>Your local social identity for private family and friends rooms.</p>
        </div>
        <button className="primary-button" type="button" onClick={() => onNavigate('edit-profile')}>
          Edit Profile
        </button>
      </div>

      <article className="profile-card-large">
        <AvatarBadge avatarId={profile.avatar} name={profile.displayName} size="xl" />
        <div>
          <h2>{profile.displayName}</h2>
          <p className="profile-nickname">@{profile.nickname}</p>
          <dl className="profile-details">
            <div>
              <dt>Avatar</dt>
              <dd>{avatar.name}</dd>
            </div>
            <div>
              <dt>Preferred Language</dt>
              <dd>{profile.preferredLanguage === 'mr' ? 'Marathi' : 'English'}</dd>
            </div>
            <div>
              <dt>Favorite Game</dt>
              <dd>{favoriteGameName}</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{new Date(profile.createdAt).toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>
      </article>
    </section>
  )
}

export default Profile
