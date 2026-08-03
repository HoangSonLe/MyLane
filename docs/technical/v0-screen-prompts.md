# v0 Screen Prompts

Content-only prompts for [v0.dev](https://v0.dev), one per screen in the [screen inventory](../ui/screen-inventory-and-flow.md).

These assume the base UI / design system already exists in the v0 project (Step 1 of [`ai-workflow.md`](ai-workflow.md) is done). Each prompt below intentionally **omits color, typography, spacing, and any other visual-style direction** — v0 should reuse what already exists. This is the per-screen version of [Step 7 - Future Screens](ai-prompts.md#step-7---future-screens).

Paste one block at a time into v0. Each block is self-contained.

Facts come from [`docs/ui/screen-inventory-and-flow.md`](../ui/screen-inventory-and-flow.md), [`docs/gameplay/README.md`](../gameplay/README.md), and the per-game files in [`docs/gameplay/`](../gameplay/). Where source docs don't define something, it's marked `(not specified in source docs)` instead of invented — resolve those before/while using the prompt if they matter for this screen.

---

## 1. Landing / First Run

```text
Build the Landing / First Run screen for a mobile-first memory training web app.

Reuse the existing components and layout patterns already in this project. Do not introduce new colors, typography, spacing, or button/card styles — content and structure only.

Purpose: first screen a new visitor sees, before any account context exists.

User goal: decide how to start.

Primary action: "Play Now" (starts a Guest session).

Secondary action: "Log In".

Required components:
- Brand/logo area
- Primary CTA: Play Now (Guest)
- Secondary CTA: Log In

Data shown: none (no user/session data exists yet).

States: Normal, Loading (checking for an existing session), Offline (show retry).

Navigation:
- Play Now → Home (as Guest)
- Log In → Login / Auth screen

Notes: no tutorial step happens on this screen — the tutorial is deferred to the first time a player picks a game (see Game Select / Gameplay prompts).
```

---

## 2. Login / Auth

```text
Build the Login / Auth screen for a mobile-first memory training web app.

Reuse the existing components and layout patterns already in this project. Do not introduce new colors, typography, spacing, or button/card styles — content and structure only.

Purpose: authenticate an account. Login is required for Versus, saved records, Elo, friends, and leaderboard.

User goal: log in with as little friction as possible.

Primary action: choose a login method.

Required components:
- Google login button
- Discord login button
- Email/Password form (email field, password field, submit button)
- Link back to "Continue as Guest"
- Inline error message area

Secondary action: back to Landing / continue as Guest.

Data shown: none until submit.

States: Normal, Loading (auth in progress), Error (invalid credentials or OAuth failure — allow retry), Offline.

Navigation:
- Success → Home
- If this login was triggered by a Guest converting to an account, success leads to a Dialog offering to merge local best score/level with the server's (keep the higher value), then Home.
```

---

## 3. Home

```text
Build the Home screen for a mobile-first memory training web app.

Reuse the existing components and layout patterns already in this project. Do not introduce new colors, typography, spacing, or button/card styles — content and structure only.

Purpose: encourage another play session. This is NOT a stats dashboard — do not center the layout on statistics.

User goal: get back into a game quickly.

Primary action: Play (goes to Game Select, or resumes the last played game/mode if one exists).

Secondary actions:
- Go to Lobby (separate screen for Versus/social — this is a deliberate navigation choice, not automatic)
- Go to Profile
- Go to Settings
- Go to Leaderboard

Required components:
- Header (greeting, username or "Guest" label)
- Primary Play CTA
- "Continue playing" highlight for the last played game/mode, if any
- Entry points (buttons/icons) to Lobby, Profile, Settings, Leaderboard

Data shown: last played game + mode (if any), Guest vs logged-in state.

States: Normal, Loading (fetching last-played state), Empty (first-ever session, no last-played game — show a generic "start playing" prompt instead), Offline (Guest is fine; Versus/Lobby entry should indicate it needs login/network).

Navigation:
- Play → Game Select
- Lobby button → Lobby
- Profile / Settings / Leaderboard → respective screens
```

---

## 4. Lobby

```text
Build the Lobby screen for a mobile-first memory training web app.

Reuse the existing components and layout patterns already in this project. Do not introduce new colors, typography, spacing, or button/card styles — content and structure only.

Purpose: central hub for social and multiplayer flows. Reached from Home via a dedicated button — it is NOT the default landing screen after login.

User goal: start a Versus flow, create a room, join a room, or manage friends.

Primary action: "Quick Match" (fastest path into a Versus session).

Secondary actions:
- Create room
- Join room
- Invite a friend
- View online friends
- Go to Profile / Leaderboard / Settings

Required components:
- Header
- Primary "Quick Match" CTA
- Secondary CTAs for Create Room and Join Room
- Online friends list with invite action
- Entry points to Profile / Leaderboard / Settings
- Back to Home

Data shown: online friends list, player's current Elo/category context if relevant, room shortcuts or recent room state if available.

States: Normal, Loading (fetching friends list or room state), Empty (no friends yet — explain how to add friends), Error (failed to load friends or room data), Offline / logged-out (Lobby and Versus require an account — show explanation and a Log In CTA instead of the full hub).

Navigation:
- Quick Match → Matchmaking Queue
- Create room → Versus Room / Create Room screen
- Join room → Versus Room / Join Room screen
- Back → Home
```

---

## 4b. Versus Room / Create Room / Join Room

```text
Build the Versus Room screen for a mobile-first memory training web app.

Reuse the existing components and layout patterns already in this project. Do not introduce new colors, typography, spacing, or button/card styles — content and structure only.

Purpose: let the player create a Versus room, join a room by code/link, or review a ready room before starting.

User goal: set up a 1v1 match quickly and clearly.

Primary action: create a room / join a room / start the ready room, depending on the room state.

Required components:
- Header with back to Lobby
- Mode summary card (Versus Ranked or Versus Unranked)
- Create room form: game category selector, optional room name, room visibility or invite/share field if needed, create button
- Join room form: room code or room link input, join button
- Ready room state: host, player 1 and player 2 slots, ready indicator, start button for host, share code/link action
- Inline error area for invalid code, room full, or connection issue

Data shown: selected game category, selected mode, room code/link, host name, opponent slot state, ready state.

States: Normal, Loading (creating/joining/fetching room state), Empty (no room yet — show create/join choices), Error (invalid code, room full, or room expired), Offline / logged-out.

Navigation:
- Create room → Ready room state
- Join room → Ready room state
- Host start → Gameplay
- Back → Lobby
```

---

---

## 5. Game Select

```text
Build the Game Select screen for a mobile-first memory training web app.

Reuse the existing components and layout patterns already in this project. Do not introduce new colors, typography, spacing, or button/card styles — content and structure only.

Purpose: let the player choose a game and a mode.

User goal: pick which game to play and under which mode, then start.

Primary action: select a game, confirm mode, start.

Required components:
- 5 game cards: Number Memory, Alphabet Memory, Grid Memory, Sequence Memory, Color Memory
- Mode selector: Solo Practice, Solo Ranked, Versus Ranked, Versus Unranked
- Difficulty selector: Easy, Medium, Hard, Super Hard
- Back navigation to Home or Lobby (depending on entry point)

Secondary content per game card (optional): player's current Elo for that category, best score, highest level reached.

Data shown: per-category Elo, best score, highest level (if logged in).

States: Normal, Loading, Offline / logged-out (Versus Ranked, Versus Unranked, and Solo Ranked should indicate they require an account; only Solo Practice is available to Guests).

Navigation:
- Solo Practice / Solo Ranked → Gameplay (first pick of a given game triggers a 3-step skippable tutorial for that game family right before Gameplay starts)
- Versus Ranked / Versus Unranked → Versus Room / Quick Match, then Matchmaking Queue, then Gameplay
```

---

## 6. Gameplay

```text
Build the Gameplay screen for a mobile-first memory training web app. This is a single shared template that hosts 5 game sub-types — build the shared shell plus the 5 input variants below.

Reuse the existing components and layout patterns already in this project. Do not introduce new colors, typography, spacing, or button/card styles — content and structure only.

Purpose: support gameplay only. Do not add features unrelated to the current round.

User goal: watch the pattern during the Viewing phase, then reproduce it during the Answering phase.

Primary action: input the answer during the Answering phase.

Secondary action: Pause for Solo, or minimal in-match controls for Versus if the source docs require them.

Required shared components:
- Phase indicator (Viewing vs Answering)
- Countdown timer
- Current level / round indicator
- Correct/wrong feedback per input (tile or key flashes)
- Pause button

Game-specific input areas (same shell, different board/input):
- Number Memory: numeric keypad, 3x3 layout
- Alphabet Memory: QWERTY keyboard, 4-row layout
- Grid Memory: grid of numbered tiles; player taps them back in ascending order
- Sequence Memory: 3x3 grid of blank tiles that flash one at a time in the Viewing phase; player taps them back in the order they flashed
- Color Memory: a growing set of colored tiles that flash one at a time; player taps the colors back in order

Versus-specific shell notes:
- Show both players' names or avatars in a compact top bar or side-by-side header.
- Show a shared timer or round timer clearly.
- Show the opponent status: connected, disconnected, answered, locked-in, or waiting.
- Keep the board dominant; the matchup UI should stay minimal.
- If the player disconnects, show a reconnect state instead of the normal round UI.

Data shown: current level, time remaining, round streak.

States: Normal (Viewing phase / Answering phase are two visual states of Normal), Loading (loading the round/seed), Error (connection lost during a Versus match), Offline (Solo continues locally; Versus is not available).

Navigation:
- Pause → Pause Overlay, with Resume / Reset / Settings (Solo only) / Quit
- Round/level completion loops back into Gameplay for the next round
- Game/level finished → Result
```

---

## 6b. Versus Gameplay / 1v1 Match

```text
Build the Versus Gameplay / 1v1 Match screen for a mobile-first memory training web app.

Reuse the existing components and layout patterns already in this project. Do not introduce new colors, typography, spacing, or button/card styles — content and structure only.

Purpose: support a real-time 1v1 memory match with shared seed and speed-based competition.

User goal: understand the shared round quickly, answer accurately, and see whether the opponent is ahead, behind, or disconnected.

Primary action: answer the round input as fast and accurately as possible.

Required components:
- Compact player-vs-player header with both players' names or avatars
- Shared timer / round progress indicator
- Minimal round status text
- Opponent state indicator: connected, disconnected, answered, locked-in, waiting, or reconnecting
- Game board or input area for the current memory game
- Small feedback area for correct/wrong/complete states
- Quit action; pause only if the source docs allow it for this mode

Data shown: player 1, player 2, round state, timer, shared seed round indicator, reconnect countdown if disconnected.

States: Normal, Loading (waiting for seed or opponent), Waiting for opponent, Reconnecting, Error (disconnect or opponent timeout), Result transition.

Navigation:
- Round complete → next round in the same match, or Result when the match ends
- Quit → Lobby or room screen depending on entry point
- Disconnect timeout → loss state / Result
```

---

## 7. Result

```text
Build the Result screen for a mobile-first memory training web app.

Reuse the existing components and layout patterns already in this project. Do not introduce new colors, typography, spacing, or button/card styles — content and structure only.

Purpose: celebrate progress and encourage another round.

User goal: see how the round went and decide what to do next.

Primary action: Play Again — replays the SAME game and mode just played (not Game Select).

Secondary actions: Back to Home (or Lobby, if entered from a Versus match), View Detail.

Required components:
- Final score
- Score breakdown for Ranked games: base score, speed bonus, difficulty multiplier, perfect bonus, completion multiplier (only when the mode is Ranked)
- Elo change (Versus Ranked only)
- New record indicator, if the player's best score or level was just beaten
- Play Again button
- Home button
- View Detail link

Data shown: score, Elo delta (if applicable), previous best vs new best, level reached.

States: Normal, Loading (submitting score/Elo to the server), Error (save failed — allow retry), Offline / Guest (explain that Guest scores are not saved server-side; only Solo Practice reveals answers, other modes don't apply here).

Navigation:
- Play Again → Gameplay, same game + mode
- Home → Home (or Lobby if this was a Versus match)
- View Detail → match detail (see Profile match history)
```

---

## 8. Profile

```text
Build the Profile screen for a mobile-first memory training web app.

Reuse the existing components and layout patterns already in this project. Do not introduce new colors, typography, spacing, or button/card styles — content and structure only.

Purpose: show identity, progress, and history.

User goal: review who they are and how they're doing.

Primary action: Edit Profile.

Secondary actions: open a match from history for detail, go to Settings.

Required components:
- Avatar
- Username
- Per-category Elo (Number / Alphabet / Grid / Sequence Memory) + overall Elo
- Best score per category + mode
- Highest level reached per category
- Total games / wins / losses / draws
- Friends list
- Match history list (last ~100 matches)

Data shown: as listed above, from the player's account.

States: Normal, Loading, Empty (Guest account — no server-side history; explain why and offer a Log In CTA), Error, Offline.

Navigation:
- Edit Profile → edit form
- Match row → match detail (Dialog)
- Back → Home
```

---

## 9. Settings

```text
Build the Settings screen for a mobile-first memory training web app.

Reuse the existing components and layout patterns already in this project. Do not introduce new colors, typography, spacing, or button/card styles — content and structure only.

Purpose: configuration only. Never mix in gameplay actions or content.

User goal: adjust app configuration.

Primary action: change/save a setting.

Required components (confirmed by source docs):
- Log out action
- Account/login management (linked login methods)

Components not yet defined in source docs (mark as placeholders, do not invent behavior for them): audio toggle, haptic feedback toggle, and any other preference toggles. Treat these as generic on/off rows until confirmed.

Secondary action: back to Home.

States: Normal, Loading, Error (failed to save a setting), Offline (some settings may not sync until reconnected).

Navigation: Back → Home. Log out → Landing / First Run.
```

---

## 10. Leaderboard

```text
Build the Leaderboard screen for a mobile-first memory training web app.

Reuse the existing components and layout patterns already in this project. Do not introduce new colors, typography, spacing, or button/card styles — content and structure only.

Purpose: comparison. Never hide the player's own rank, even if they're outside the visible range.

User goal: see how they rank against others.

Primary action: switch board/category/time-range.

Required components:
- Board type tabs/filters: Global All-time (by score and by Elo, per category), Weekly (resets weekly), Monthly (resets monthly), Friends-only, Top 100 per category, Endless (separate board)
- Category filter: Number / Alphabet / Grid / Sequence Memory
- Ranked list: rank, avatar, username, score or Elo
- Player's own row, pinned or highlighted even when outside the visible top range

Secondary action: tap a player's row to view their profile (read-only).

Data shown: rank, username, avatar, score or Elo per the selected board.

States: Normal, Loading, Empty (no ranked games yet on this board), Error, Offline / logged-out (Guest can view but has no personal rank to pin — explain why).

Navigation: Back → Home or Lobby. Player row → read-only profile view.
```

---

## 11. Dialog

```text
Build a generic Dialog component for a mobile-first memory training web app. This is a reusable overlay, not a dedicated screen/route.

Reuse the existing components and layout patterns already in this project. Do not introduce new colors, typography, spacing, or button/card styles — content and structure only.

Purpose: handle exactly one decision at a time. Never present multiple unrelated choices in the same dialog.

User goal: confirm or cancel a single decision.

Required components:
- Title
- Single message/body
- One primary button (confirm)
- One secondary button (cancel/dismiss)

Example instances this component needs to support (content varies, structure stays the same):
- Guest → account conversion: offer to merge local best score/level with the server's (keep the higher value)
- Quit confirmation from the Pause Overlay
- Reset confirmation mid-round

States: Normal. A confirm action may show a brief disabled/loading state on its button while submitting.

Navigation: closes back to whatever screen invoked it.
```
