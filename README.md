# Maharashtra Cards Hub

Maharashtra Cards Hub / महाराष्ट्र कार्ड्स हब is a React + Vite + PWA for private family and friends playing-card rooms.

The app still works fully in frontend-only local mode with localStorage. Phase 4 adds an optional Supabase Realtime foundation for rooms, lobby membership, ready status, chat messages, and presence when real Supabase environment variables are provided. It does not include Firebase, payments, wallets, gambling, betting, authentication, real game dealing logic, or real WebRTC yet.

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

## Local Mode And Supabase Mode

The app chooses its data mode at runtime:

- If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are missing or still use placeholder values, the app stays in localStorage fallback mode.
- If both values are real Supabase project values, create room, join room, lobby sync, ready status, chat, and presence use Supabase.
- Device preferences such as language, theme, player name, profile, last room, achievements, and notifications still use localStorage.

## Supabase Setup

Install dependencies:

```bash
npm install
```

Create a local `.env` file:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

Replace those placeholder values only with keys from your Supabase project. Do not commit `.env`; it is already ignored by git.

Run the initial SQL migration in Supabase:

1. Open your Supabase project dashboard.
2. Go to **SQL Editor**.
3. Paste the contents of `supabase/migrations/001_initial_schema.sql`.
4. Run the script.
5. Confirm Realtime is enabled for `rooms`, `room_players`, `messages`, and `game_state`.

The migration creates:

- `players`
- `rooms`
- `room_settings`
- `room_players`
- `messages`
- `game_state`
- `room_events`
- `achievements`
- `player_achievements`
- `game_results`

Current RLS policies are permissive guest-mode policies so the frontend can work before authentication exists. Tighten these policies when Supabase Auth is added.

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

For Supabase-backed deployment, add these Vercel Environment Variables before deploying:

```bash
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

If those variables are not set, the deployed app remains in localStorage fallback mode.

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
- Optional Supabase room creation, room joining, room membership, ready status, realtime chat, lobby synchronization, room updates, and presence
- Supabase Broadcast hook for emoji reactions and future typing/video-signaling events

## Important Disclaimer

This app is for private social play only. No real money or betting is supported.

## Future Supabase Notes

Next backend phases should add:

1. Supabase Auth for private family/friends sign-in.
2. Strong RLS policies tied to authenticated users and room membership.
3. Friends database and invite permissions.
4. Chat moderation and message delete/edit rules.
5. Game state validation on the server side.
6. Leaderboard and achievement writes from verified game results.

## Future WebRTC Notes

Real video is not connected yet. Later work should add:

- WebRTC signalling through Supabase Realtime
- Camera/mic stream permissions
- Peer connection lifecycle
- STUN/TURN server configuration
- Mute/camera state sync
- Cleanup on leave room and browser close
