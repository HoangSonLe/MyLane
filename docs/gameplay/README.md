# Gameplay Documentation

## Purpose

This directory is the source of truth for game mechanics: rules, difficulty curves, scoring formulas, and win/lose conditions for each game in My Lane.

Per [`AGENTS.md`](../../AGENTS.md), rules, difficulty, score formulas, and win/lose conditions defined here must never change without an explicit request.

**Primary source:** [`MY_LANE_GAME_DESIGN.md`](../../MY_LANE_GAME_DESIGN.md) (repo root) — the full Game Design Document, v1.1. This directory restructures that document into the per-topic layout `AGENTS.md`/`CLAUDE.md` expect; the GDD remains the canonical detailed reference.

---

## Games (Version 1)

The Game Design Document ([`MY_LANE_GAME_DESIGN.md`](../../MY_LANE_GAME_DESIGN.md)) defines 3 of the 5 Version 1 games. Sequence Memory and Color Memory have no entry in that root document but are confirmed original core games, on equal footing with the other 3 (see the note on each one's page):

- [Number Memory](number-memory.md) — remember and re-enter a sequence of digits
- [Alphabet Memory](alphabet-memory.md) — remember and re-enter a sequence of digits + letters
- [Grid Memory](grid-memory.md) — remember numbered positions on a grid, tap back in ascending order (a.k.a. "Chimpanzee Memory")
- [Sequence Memory](sequence-memory.md) — remember the order grid tiles flash in, tap them back in that order. **Confirmed original game for this project**, not present in the root GDD.
- [Color Memory](color-memory.md) — Simon-style: remember the order colored tiles flash in, tap them back in that order; both sequence length and color count grow with level. **Original game for this project**, not present in the root GDD.

---

## Shared Systems

These rules apply across all 5 games and must stay consistent between them.

### Accounts

- Login required for full features (Versus, saved records, Elo, friends, leaderboard).
- Supported login: Google, Discord, Email/Password.
- **Guest mode**: Solo Practice only, no server-side save, no Versus.
- Per-account data: username (unique), avatar, per-category Elo (Number/Alphabet/Grid/Sequence/Color) + overall Elo, best score per category+mode, highest level reached per category, total games/wins/losses/draws, friends list, last ~100 matches history.
- Highest level reached per category is also surfaced live during a round (Gameplay HUD "Best" stat, logged-in players only) — see [`docs/ui/screen-interface-spec.md`](../ui/screen-interface-spec.md#gameplay).

### Game Modes

| Mode | Description | Affects Elo? | Saved to records/leaderboard? |
|---|---|---|---|
| Solo Practice | Free practice, no pressure. Can reveal the answer after each round. | No | No |
| Solo Ranked | Solo play for rank/records. | No | Yes |
| Versus Ranked | 1v1, same category + mode, shared seed. Faster correct player wins. | Yes | Yes |
| Versus Unranked | 1v1 for fun. | No | No |

Versus match creation: invite a friend directly, create a room (Public/Private), browse available public rooms, Quick Join, or Quick Match (Elo-based).

Versus rounds start automatically from the shared server `start_at` and continue to the next round after each player's result transition. There is no per-player “Start round” button inside `VersusGameplayScreen`; the primary action is answering the puzzle.

Versus correct, wrong, and timeout feedback stays inline in the gameplay screen. No blocking wrong-answer or timeout popup appears between rounds.

During a Versus match, both players' server-owned correct-round score and completed-round progress remain visible in the compact HUD and refresh while the match is in progress.

When a participant forfeits an active Versus match, the server immediately finalizes the match. The remaining player is notified, transitions automatically to Result, and sees the server-owned outcome plus both players' round scores.

### Distinction: Quick Match vs. Quick Join

| Feature | Quick Match (Tìm trận nhanh) | Quick Join (Tham gia ngay) |
|---|---|---|
| **Purpose** | Elo-based matchmaking for Ranked play | Instant entry into open custom Public rooms |
| **Queue** | Goes through Matchmaking Queue (Elo ±100 -> ±300) | Direct room entry (No Elo queue) |
| **Mode** | Versus Ranked | Versus Ranked / Unranked (depending on room) |
| **Flow** | Navigates to `MatchmakingScreen` countdown | Navigates directly to `VersusRoomScreen` |

### Room Creation & Management Rules

1. **Room Privacy (Public vs Private)**:
   - **Public Room (Công khai)**: Displayed in the "Available Rooms" (Phòng khả dụng) list in the Lobby so any online player can browse and join directly.
   - **Private Room (Riêng tư)**: Hidden from the public available rooms list; requires entering a 6-digit Room Code or clicking a direct invite link to join.
   - Room Privacy can be set upon creation and toggled by the Host inside the room.

2. **Host Transfer & Leave Confirmation (Chuyển giao quyền Chủ phòng)**:
   - **Leave Confirmation Modal**: If the Room Host attempts to leave the room, a confirmation modal pops up warning that leaving will transfer host privileges or destroy the room.
   - **Host Transfer**: Upon the Host confirming leave, ownership/Host role is automatically transferred to the next remaining player in the room.
   - **Room Destruction**: If the last remaining player leaves, the room is automatically closed and destroyed.

3. **Available Public Rooms List (Danh sách phòng khả dụng)**:
   - Displayed in the Lobby showing real-time active Public rooms.
   - Shows Host name, game category, mode, current player count (`1/2`), and a "Join" button for instant entry.

4. **Quick Join (Tham gia ngay)**:
   - Players can click "Quick Join" to instantly match into the first available open Public room without having to manually create a new room, search room codes, or wait in an Elo queue.

5. **Match Challenge Invitations & Mute Rules (Nhận lời mời thách đấu & Tắt thông báo lời mời)**:
   - **Incoming Challenge Notification**: When receiving a match invite from another player, a floating toast/modal pops up displaying inviter name, Elo, game category, and action buttons (`Accept`, `Decline`, `Mute`).
   - **Accept**: Instantly joins the room and moves player to `VersusRoomScreen`.
   - **Decline**: Dismisses the challenge notification.
   - **Mute Player Invites (Tắt nhận lời mời)**: Option to mute incoming challenge invitations from a specific player for **5 minutes**, **15 minutes**, **30 minutes**, or **until the end of current session**. Subsequent invites from muted users within the duration are silently suppressed.

6. **Public Friend Profile Popup (Popup xem thông tin cá nhân công khai của bạn bè)**:
   - **Clicking a Friend**: Clicking any friend row in the Lobby or social list opens a modal displaying their public profile stats: Avatar, Name, Handle, Presence status, Overall Elo rating, games played, win rate %, and game category records.
   - **Actions**: Allows issuing a direct **Challenge** or toggling **Mute Invites** directly from the profile modal.

7. **Haptic Vibration Feedback (Phản hồi rung khi tương tác đáp án)**:
   - **Tactile Response**: Every answer button tap or grid tile interaction across all 5 memory game modes (Sequence, Grid, Number, Color, Alphabet) triggers an instant light haptic vibration pulse (`navigator.vibrate(12)`). Correct sequence and wrong answer inputs trigger distinct success and error vibration patterns.
   - **Settings Toggle**: Players can freely toggle vibration feedback ON or OFF at any time via **Settings > Game > Haptic Feedback**.

8. **Web Audio Sound Effects (Âm thanh hiệu ứng khi tương tác đáp án)**:
   - **Audio Synthesizer**: Every answer button tap or grid tile selection plays a zero-latency Web Audio API sound effect (short tap tone for answer clicks, ascending chord for correct answers, descending buzz for wrong answers).
   - **Settings Toggle**: Players can freely toggle sound effects ON or OFF at any time via **Settings > Game > Sound Effects**.

### Matchmaking (Quick Match)

1. **Simultaneous Queue Pairing**: Both players MUST be actively searching in the Matchmaking Queue (`MatchmakingScreen`, `matchmaking_queue` table) at the same time.
2. Matches online players in the same game category with overlapping Elo search windows.
3. Initial Elo window: **±100** (e.g. `1287 — 1487 Elo`).
4. If no match after **10s**, widen by **±50**; repeat every 10s up to **±300** max.
5. Max wait: **60s**, then "no opponent found," giving options to "Create Host Room" or "Retry Queue".
6. Realtime WebSocket notifications automatically trigger on both devices as soon as a queue match is formed.
7. Leaving or canceling queue automatically removes the player's active queue entry (`leaveQueue`).

### Scoring Formula (Ranked games only)

```
Final Score = (Base Score + Speed Bonus) × Difficulty Multiplier × Perfect Bonus × Completion Multiplier
```

- **Base Score** = `100 × n × (n - 1)`, where `n` = highest number of consecutive correct items reached in the round.
- **Speed Bonus** = `max(0, TimeLimit - TimeTaken) × speed coefficient`. Speed coefficient by game: Number Memory **8**/s, Alphabet Memory **10**/s, Grid Memory **12**/s, Sequence Memory **9**/s, Color Memory **9**/s (Sequence and Color coefficients not in the root GDD, confirmed for this project — see [sequence-memory.md](sequence-memory.md) and [color-memory.md](color-memory.md)).
- **Difficulty Multiplier**: Easy ×1.0, Medium ×1.3, Hard ×1.7, Super Hard ×2.2.
- **Perfect Bonus**: ×1.25 if zero mistakes in the whole game, else ×1.0.
- **Completion Multiplier**: ×1.0 if the game/level was completed, ×0.6 if failed partway.
- Final score is rounded to the nearest integer.

### Elo System

Standard chess-style Elo, calculated **only** for Versus Ranked matches.

```
E_A = 1 / (1 + 10^((R_B - R_A) / 400))
R_A_new = R_A + K × (S_A - E_A)
```

`S_A` = 1 win / 0.5 draw / 0 loss. K-factor by current Elo: <1200 → K=40, 1200–1599 → K=32, 1600–1999 → K=24, ≥2000 → K=16.

- Each game category has its own Elo, plus a weighted-average overall Elo.
- Starting Elo: **1000**. Floor: **100** (never goes lower).

### Leaderboard & Records

- Boards: Global All-time (by best score and by Elo, per category), Weekly (resets weekly), Monthly (resets monthly), Friends-only, Top 100 per category.
- Only **Ranked** games count toward records/leaderboard.
- Recorded per player: best score per category+mode, date achieved, highest level reached, current + peak Elo, total games, Versus win rate, last ~100 matches (viewable in detail).

### Endless Mode

Unlocks after a player completes **Level 10** in any category.

- Number/Alphabet Memory: sequence length starts at 16, +1 every 3 consecutive wins.
- Grid Memory: after the 10×10 grid, `beginCount` +2 every 3 wins; larger grids (11×11+) deferred to a later version.
- Has its own leaderboard (ranked by highest item count / `beginCount` reached).
- Solo only (Practice + Ranked) — no Versus Endless in Version 1.

### Onboarding

- First open: choose "Play now (Guest)" or "Log in."
- One-time, 3-step, skippable tutorial per game family (view pattern → pattern hides → re-enter in order). Confirmed trigger point: the first time a player picks that game family in Game Select, immediately before that game's first Gameplay session — not a fixed step right after Login. See [`docs/ui/screen-inventory-and-flow.md`](../ui/screen-inventory-and-flow.md#tutorial-3-bước).
- On Guest → account conversion: offer to merge local best score/level (keep the higher value). Versus and Elo only start once an account exists.

### Out of scope for Version 1

Daily/Weekly Challenge, Achievement/Badge system, Season or Elo soft-reset, cosmetics/shop.

### Proposed Future Gameplay Improvements (Difficulty Enhancements)

Ideas to enhance the impact and meaningfulness of Difficulty Mode selection in future versions:

1. **Preview & Flash Tempo**: Vary pattern display speed based on difficulty (e.g. Easy has slower flash/viewing duration ~0.8s, Super Hard uses faster tempo ~0.35s) to heighten processing speed demands.
2. **Pattern & Position Complexity**: High difficulties (Hard / Super Hard) feature higher spatial dispersion (tiles scattered at grid corners) or less predictable sequence jumps.
3. **Risk & Reward Scaling**: Increase score multiplier and Elo reward scaling for Super Hard (e.g., ×3.0+ multiplier) to strongly incentivize high-risk plays.
4. **Extreme / Hardcore Mechanics**:
   - **Visual Distractors**: Random color tinting / font rotation (15°–45°), expanded charsets (case-sensitive `A-z` or special symbols `@#$%`).
   - **Dynamic Grid & Traps**: Flipped/mirror layouts during Answering phase, or decoy trap tiles.
   - **Variable Tempo & Ghost Flashes**: Non-uniform flash durations (0.15s vs 0.7s) and subtle decoy flashes.
   - **Reverse Recall**: Reverse order entry requirement (Backwards Memory Span).
5. **Difficulty-Based Sequence Length Scaling (Versus)**: Allow room difficulty in Versus mode to scale base sequence/item lengths (e.g., Easy = base length, Super Hard = base length +3 to +4 items), letting competitive players experience longer, higher-intensity puzzles right from Round 1.





---

## Technical Rules for Implementation

- Versus matches **must** share one server-generated `seed` so both players get an identical puzzle.
- Viewing/Answering countdowns must be server-controlled (or use a tamper-resistant timer) — never trust client-side timing alone.
- Basic anti-cheat: rate-limit input speed, flag abnormal/bot-like input patterns.
- Guest config/progress lives in `localStorage`; synced to the server on login.
- Reconnect window during Versus: **60 seconds** (GDD §11 says 45–60s, §17 sets it at 60s) — treat 60s as the value unless a decision changes it. Timeout while disconnected counts as a loss.
- All tunable numbers (timers, win-streak counts, score coefficients, K-factor, etc.) must be configurable (server-side config), never hard-coded into core logic.

Source: [`MY_LANE_GAME_DESIGN.md`](../../MY_LANE_GAME_DESIGN.md) §§3–11, §17.
