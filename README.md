# Maharashtra Cards Hub

Maharashtra Cards Hub / महाराष्ट्र कार्ड्स हब is a frontend-only React + Vite + PWA for private family and friends playing-card rooms.

This phase is intentionally static and deployable. It uses React state, hash-based navigation, clean invite routes, plain CSS, localStorage, a PWA manifest, install icons, and a lightweight service worker. It does not include Supabase, Firebase, payments, wallets, gambling, betting, or real WebRTC yet.

## Local Run

Install dependencies:

```bash
npm install
```

Start the local dev server:

```bash
npm run dev
```

Open the Vite URL shown in the terminal, usually:

```bash
http://localhost:5173/
```

If an older PWA cache appears during local testing, hard refresh the page or open:

```bash
http://127.0.0.1:5173/
```

## Build

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The static output is generated in:

```bash
dist
```

## Vercel Deployment

Recommended Vercel settings:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

Deployment options:

1. Push this project to a GitHub repository.
2. In Vercel, choose **Add New Project**.
3. Import the GitHub repository.
4. Keep the Vite defaults, or confirm the settings above.
5. Deploy.

Most app navigation uses hash routes like `#/lobby` and `#/table`. Friend invite links also support clean paths like `/join/ABC123`; `vercel.json` rewrites those paths back to `index.html` for static deployment.

## Current Features

- Home screen with English and Marathi branding
- English/Marathi language toggle
- Midnight/Royal dark theme toggle
- PWA manifest, install icons, service worker, and install guide
- localStorage for player name, player profile, language, theme, last room, mock room data, achievements, and notifications
- Profile page, view profile page, and edit profile page
- Built-in avatar gallery: Maharaja, Warrior, Tiger, Eagle, Lion, Playing Card King, Playing Card Queen, Ace Card, Traditional Marathi Theme, and Modern Gamer
- Create and join private rooms with 6-character room codes
- Invite sharing UI with `/join/ROOMCODE` links, copy, WhatsApp, Telegram, and native share support
- Lobby with player cards, avatars, host badge, ready badge, online badge, favorite game, selected game, and start gating
- Local-state chat simulation with avatars, player names, timestamps, emoji support, and auto-scroll
- Mock leaderboard page with Daily, Weekly, and Monthly tabs
- Mock achievements page with locally stored unlocked achievements
- Notification center with local mock notifications
- Game guides for Rummy, Mendicot, 304, Challenge, Teen Patti, Call Break, 29, and Court Piece
- Virtual green card table with avatar seats, sample deck, sample hand, scoreboard, turn indicator, reactions, chat, and video placeholders
- Camera, mute, and leave-room UI controls without real camera access

## Important Disclaimer

This app is for private social play only. No real money or betting is supported.

## Future Supabase Setup Notes

Do not add Supabase until the frontend deployment is stable. When ready, the likely integration order is:

1. Add Supabase project and environment variables in Vercel.
2. Add Supabase Auth for private family/friends sign-in.
3. Add a friends database for profiles, friend invites, and blocked/private lists.
4. Replace localStorage room data with Supabase tables.
5. Add Supabase Presence for online player state.
6. Add Supabase Realtime for rooms, player presence, chat sync, ready state, selected game, and game state sync.
7. Add row-level security policies before inviting real users.
8. Keep localStorage only for device preferences such as language, theme, and last used player name.

## Future WebRTC Notes

Real video is not connected yet. Later work should add:

- WebRTC signalling through Supabase Realtime
- Camera/mic stream permissions
- Peer connection lifecycle
- STUN/TURN server configuration
- Mute/camera state sync
- Cleanup on leave room and browser close
