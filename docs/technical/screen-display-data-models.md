# Screen Display Data Models

Tài liệu này định nghĩa các model dữ liệu dùng để hiển thị cho từng màn hình của My Lane.

Mục tiêu là tách rõ:
- dữ liệu miền nghiệp vụ (backend / game state)
- dữ liệu hiển thị (view model / screen model)
- dữ liệu tạm thời phục vụ loading, empty, error, offline

Các model bên dưới được viết theo hướng TypeScript để Claude và team có thể map trực tiếp sang `interface`/`type` trong frontend.

## Đọc nhanh

Nếu bạn muốn review nhanh, chỉ cần nhìn 4 ý này trước:

1. `ScreenStatusMeta` là lớp trạng thái chung cho mọi màn. Nó cho biết màn đang `loading`, `ready`, `empty`, `error`, hay `offline`.
2. `PlayerIdentity`, `GameStatsSummary`, `GameCatalogItem`, `RoomSummary`, `MatchSummary` là các primitive dùng lại ở nhiều màn.
3. Mỗi màn có một `...ScreenModel` riêng để gom dữ liệu render cho đúng ngữ cảnh.
4. Nếu một field chưa có trong source docs, nó được để `optional` hoặc ghi rõ là chưa chốt để tránh invent requirement.

Luồng review đề xuất:
- Bắt đầu từ `Shared primitives`
- Xem `Screen view models` cho màn bạn đang quan tâm
- Kết lại bằng `Data handoff notes` để hiểu dữ liệu đi từ đâu sang đâu

## Bảng tra nhanh model

| Model | Dùng cho màn nào | Ý nghĩa là gì | Hiển thị gì |
|---|---|---|---|
| `ScreenStatusMeta` | Mọi màn | Trạng thái render chung của screen | Loading, ready, empty, error, offline + retry/title/message |
| `PlayerIdentity` | Home, Lobby, Room, Profile, Result, Leaderboard, Gameplay Versus | Danh tính hiển thị của người chơi | Username, avatar, guest/auth state, badge |
| `GameStatsSummary` | Home, Game Select, Profile, Result | Tóm tắt thành tích theo game | Best score, highest level, current/peak Elo |
| `GameCatalogItem` | Game Select | 1 card game trong danh sách chọn game | Tên game, mô tả, lock state, stats |
| `ModeOption` | Game Select | 1 option mode mà player có thể chọn | Label, điều kiện account, ranked/versus flags |
| `FriendSummary` | Lobby, Profile | 1 người bạn trong social list | Online/offline, game đang chơi, nút invite |
| `LeaderboardRow` | Leaderboard | 1 dòng trong bảng xếp hạng | Rank, player, score/elo, highlight self |
| `MatchSummary` | Profile, match detail sau này | 1 trận đã diễn ra | Kết quả, game, thời gian, score, Elo delta |
| `RoomSummary` | Lobby, Versus Room | 1 phòng Versus đang chờ hoặc ready | Host, slot người chơi, code/link, ready state |
| `RoundTimingInfo` | Gameplay | Trạng thái vòng chơi và timer | Phase, remaining time, round number, streak |
| `ResultBreakdownItem` | Result | 1 dòng trong breakdown điểm | Tên thành phần, giá trị, mức nhấn mạnh |
| `LandingScreenModel` | Landing / First Run | Model cho màn vào app đầu tiên | CTA guest/login, brand title, guest note |
| `LoginScreenModel` | Login / Auth | Model cho xác thực tài khoản | Provider buttons, email form, merge prompt |
| `HomeScreenModel` | Home | Model cho màn quay lại chơi | Player, continue playing, shortcuts |
| `LobbyScreenModel` | Lobby | Model cho hub social/multiplayer | Quick Match, friends, room summary, shortcuts |
| `VersusRoomScreenModel` | Versus Room / Create Room / Join Room | Model cho tạo/join phòng | Form create/join, room ready state |
| `GameSelectScreenModel` | Game Select | Model cho chọn game, mode, difficulty | Game cards, mode selector, difficulty, locked state |
| `GameplayScreenModel` | Gameplay | Model khung chung cho màn chơi | Game id, mode, round timing, score, feedback |
| `VersusGameplayScreenModel` | Versus Gameplay / 1v1 Match | Model mở rộng cho trận đối kháng realtime | Player vs player, shared seed, opponent state, reconnect |
| `ResultScreenModel` | Result | Model cho màn kết quả | Final score, breakdown, Elo delta, new record |
| `ProfileScreenModel` | Profile | Model cho hồ sơ người chơi | Summary stats, per-game stats, friends, history |
| `SettingsScreenModel` | Settings | Model cho cấu hình app | Account connections, toggles, logout |
| `LeaderboardScreenModel` | Leaderboard | Model cho bảng xếp hạng | Board filter, category filter, rows, pinned self |
| `DialogModel` | Dialog | Model cho overlay quyết định đơn lẻ | Title, message, confirm/cancel, tone |

Nếu bạn chỉ muốn review rất nhanh, đọc cột “Dùng cho màn nào” và “Hiển thị gì” trước. Cột “Ý nghĩa là gì” giải thích ngắn tại sao model này tồn tại.

## Ví dụ data mẫu

### LandingScreenModel

```ts
const landingScreenModel: LandingScreenModel = {
  status: { state: 'ready' },
  brandTitle: 'My Lane',
  primaryActionLabel: 'Play Now',
  secondaryActionLabel: 'Log In',
  guestNote: 'Guest chỉ được chơi Solo Practice.'
}
```

### LoginScreenModel

```ts
const loginScreenModel: LoginScreenModel = {
  status: { state: 'ready' },
  providers: [
    { id: 'google', label: 'Continue with Google', enabled: true },
    { id: 'discord', label: 'Continue with Discord', enabled: true },
    { id: 'email', label: 'Email / Password', enabled: true },
  ],
  guestContinueLabel: 'Continue as Guest',
  mergeGuestPrompt: {
    title: 'Merge guest progress?',
    message: 'Keep the higher best score and highest level when converting the guest account.',
    keepHigherValueLabel: 'Keep higher value',
  },
}
```

### HomeScreenModel

```ts
const homeScreenModel: HomeScreenModel = {
  status: { state: 'ready' },
  player: { id: 'u1', username: 'Alex', authState: 'authenticated', isGuest: false },
  continuePlaying: {
    gameId: 'sequence',
    gameTitle: 'Sequence Memory',
    modeLabel: 'Solo Ranked',
    lastScore: 1420,
    lastLevel: 8,
    progressLabel: 'Level 8 · 74% complete',
  },
  shortcuts: [
    { id: 'lobby', label: 'Lobby', enabled: true },
    { id: 'profile', label: 'Profile', enabled: true },
    { id: 'settings', label: 'Settings', enabled: true },
    { id: 'leaderboard', label: 'Leaderboard', enabled: true },
  ],
}
```

### LobbyScreenModel

```ts
const lobbyScreenModel: LobbyScreenModel = {
  status: { state: 'ready' },
  player: { id: 'u1', username: 'Alex', authState: 'authenticated', isGuest: false, badgeLabel: 'Elo 1240' },
  quickMatch: {
    label: 'Quick Match',
    description: 'Find the closest opponent by Elo.',
    enabled: true,
  },
  friends: [
    { id: 'f1', username: 'Mina', online: true, currentGame: 'Grid Memory', currentMode: 'Versus Ranked', inviteEnabled: true },
    { id: 'f2', username: 'Ken', online: false, inviteEnabled: false },
  ],
  roomSummary: undefined,
  shortcuts: [
    { id: 'profile', label: 'Profile', enabled: true },
    { id: 'leaderboard', label: 'Leaderboard', enabled: true },
    { id: 'settings', label: 'Settings', enabled: true },
  ],
}
```

### VersusRoomScreenModel

```ts
const versusRoomScreenModel: VersusRoomScreenModel = {
  status: { state: 'ready' },
  player: { id: 'u1', username: 'Alex', authState: 'authenticated', isGuest: false },
  mode: 'versus-ranked',
  selectedGameId: 'grid',
  createRoomForm: {
    categoryOptions: [
      { id: 'number', label: 'Number Memory' },
      { id: 'alphabet', label: 'Alphabet Memory' },
      { id: 'grid', label: 'Grid Memory' },
      { id: 'sequence', label: 'Sequence Memory' },
    ],
    roomName: 'Friday duel',
    visibility: 'invite-only',
    submitLabel: 'Create Room',
  },
  joinRoomForm: {
    roomCode: 'A7K2Q',
    roomLink: 'https://gameboard.app/?room=A7K2Q',
    submitLabel: 'Join Room',
  },
  readyRoom: {
    roomId: 'room-1001',
    roomCode: 'A7K2Q',
    gameId: 'grid',
    mode: 'versus-ranked',
    visibility: 'invite-only',
    host: { id: 'u1', username: 'Alex', authState: 'authenticated', isGuest: false },
    players: [
      { player: { id: 'u1', username: 'Alex', authState: 'authenticated', isGuest: false }, ready: true, connectionState: 'connected' },
      { player: { id: 'u2', username: 'Mina', authState: 'authenticated', isGuest: false }, ready: false, connectionState: 'waiting' },
    ],
    canStart: false,
    isFull: true,
  },
}
```

### GameSelectScreenModel

```ts
const gameSelectScreenModel: GameSelectScreenModel = {
  status: { state: 'ready' },
  player: { id: 'u1', username: 'Alex', authState: 'authenticated', isGuest: false },
  entryPoint: 'home',
  modeOptions: [
    { id: 'solo-practice', label: 'Solo Practice', requiresAccount: false, isRanked: false, isVersus: false },
    { id: 'solo-ranked', label: 'Solo Ranked', requiresAccount: true, isRanked: true, isVersus: false },
    { id: 'versus-ranked', label: 'Versus Ranked', requiresAccount: true, isRanked: true, isVersus: true },
    { id: 'versus-unranked', label: 'Versus Unranked', requiresAccount: true, isRanked: false, isVersus: true },
  ],
  difficultyOptions: [
    { id: 'easy', label: 'Easy' },
    { id: 'medium', label: 'Medium' },
    { id: 'hard', label: 'Hard' },
    { id: 'super-hard', label: 'Super Hard' },
  ],
  games: [
    { id: 'number', title: 'Number Memory', description: 'Recall digit sequences.', unlocked: true, stats: { bestScore: 1240, highestLevel: 9, currentElo: 1220 } },
    { id: 'alphabet', title: 'Alphabet Memory', description: 'Recall letter sequences.', unlocked: true, stats: { bestScore: 1180, highestLevel: 8, currentElo: 1190 } },
    { id: 'grid', title: 'Grid Memory', description: 'Recall tile positions in order.', unlocked: true, stats: { bestScore: 1310, highestLevel: 10, currentElo: 1305 } },
    { id: 'sequence', title: 'Sequence Memory', description: 'Recall the flashing order.', unlocked: true, stats: { bestScore: 1420, highestLevel: 10, currentElo: 1410 } },
  ],
  selectedGameId: 'sequence',
  selectedModeId: 'solo-ranked',
  selectedDifficultyId: 'hard',
}
```

### GameplayScreenModel

```ts
const gameplayScreenModel: GameplayScreenModel = {
  status: { state: 'ready' },
  gameId: 'sequence',
  mode: 'solo-ranked',
  difficulty: 'hard',
  round: {
    phaseLabel: 'answering',
    timeRemainingMs: 14200,
    roundNumber: 8,
    totalRounds: 12,
    streak: 3,
  },
  score: 1240,
  level: 8,
  boardLabel: 'Sequence grid',
  isPaused: false,
  feedback: { kind: 'neutral', message: 'Watch the next pattern carefully.' },
}
```

### VersusGameplayScreenModel

```ts
const versusGameplayScreenModel: VersusGameplayScreenModel = {
  status: { state: 'ready' },
  gameId: 'grid',
  mode: 'versus-ranked',
  round: {
    phaseLabel: 'answering',
    timeRemainingMs: 8200,
    roundNumber: 5,
    totalRounds: 10,
    streak: 2,
  },
  score: 980,
  level: 5,
  boardLabel: 'Grid board',
  isPaused: false,
  feedback: { kind: 'success', message: 'Correct answer locked in.' },
  player: { id: 'u1', username: 'Alex', authState: 'authenticated', isGuest: false },
  opponent: { id: 'u2', username: 'Mina', authState: 'authenticated', isGuest: false },
  sharedSeed: 'seed-xyz-1001',
  opponentState: 'answered',
  reconnectCountdownMs: undefined,
  matchProgress: {
    currentRound: 5,
    totalRounds: 10,
    playerRoundsCompleted: 4,
    opponentRoundsCompleted: 3,
    sharedTimerLabel: '08.2s left',
  },
}
```

### ResultScreenModel

```ts
const resultScreenModel: ResultScreenModel = {
  status: { state: 'ready' },
  player: { id: 'u1', username: 'Alex', authState: 'authenticated', isGuest: false },
  gameId: 'sequence',
  mode: 'solo-ranked',
  resultTitle: 'New Record!',
  finalScore: 1420,
  scoreBreakdown: [
    { label: 'Base score', value: 820, emphasis: 'medium' },
    { label: 'Speed bonus', value: 180, emphasis: 'medium' },
    { label: 'Difficulty multiplier', value: 'x1.7', emphasis: 'low' },
    { label: 'Perfect bonus', value: 'x1.25', emphasis: 'low' },
    { label: 'Completion multiplier', value: 'x1.0', emphasis: 'low' },
  ],
  newRecord: { type: 'best-score', label: 'Best score updated' },
  nextPrimaryActionLabel: 'Play Again',
  detailLinkLabel: 'View match detail',
}
```

### ProfileScreenModel

```ts
const profileScreenModel: ProfileScreenModel = {
  status: { state: 'ready' },
  player: { id: 'u1', username: 'Alex', authState: 'authenticated', isGuest: false, badgeLabel: 'Level 12' },
  summaryStats: { totalGames: 182, wins: 96, losses: 73, draws: 13, overallElo: 1288 },
  perGameStats: [
    { gameId: 'number', title: 'Number Memory', summary: { bestScore: 1240, highestLevel: 9, currentElo: 1220, peakElo: 1248 } },
    { gameId: 'alphabet', title: 'Alphabet Memory', summary: { bestScore: 1180, highestLevel: 8, currentElo: 1190, peakElo: 1210 } },
  ],
  friends: [
    { id: 'f1', username: 'Mina', online: true, inviteEnabled: true },
    { id: 'f2', username: 'Ken', online: false, inviteEnabled: false },
  ],
  matchHistory: [
    { id: 'm1', mode: 'versus-ranked', gameId: 'grid', resultLabel: 'Win', createdAt: '2026-07-31T10:10:00Z', score: 980, eloDelta: 24 },
    { id: 'm2', mode: 'solo-ranked', gameId: 'sequence', resultLabel: 'New best score', createdAt: '2026-07-31T09:20:00Z', score: 1420 },
  ],
  editProfileActionLabel: 'Edit Profile',
}
```

### SettingsScreenModel

```ts
const settingsScreenModel: SettingsScreenModel = {
  status: { state: 'ready' },
  player: { id: 'u1', username: 'Alex', authState: 'authenticated', isGuest: false },
  accountConnections: [
    { provider: 'google', connected: true, label: 'Google account' },
    { provider: 'discord', connected: false, label: 'Discord account' },
    { provider: 'email', connected: true, label: 'Email / Password' },
  ],
  toggles: [
    { id: 'sound', label: 'Sound', value: true, description: 'Enable game sounds' },
    { id: 'haptics', label: 'Haptics', value: true, description: 'Vibrate on feedback' },
  ],
  logoutActionLabel: 'Log out',
}
```

### LeaderboardScreenModel

```ts
const leaderboardScreenModel: LeaderboardScreenModel = {
  status: { state: 'ready' },
  player: { id: 'u1', username: 'Alex', authState: 'authenticated', isGuest: false },
  boardId: 'global-elo',
  categoryId: 'grid',
  boardOptions: [
    { id: 'global-score', label: 'Global Score' },
    { id: 'global-elo', label: 'Global Elo' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'friends', label: 'Friends' },
    { id: 'top-100', label: 'Top 100' },
    { id: 'endless', label: 'Endless' },
  ],
  categoryOptions: [
    { id: 'number', label: 'Number Memory' },
    { id: 'alphabet', label: 'Alphabet Memory' },
    { id: 'grid', label: 'Grid Memory' },
    { id: 'sequence', label: 'Sequence Memory' },
  ],
  rows: [
    { rank: 1, player: { id: 'u9', username: 'Nova', authState: 'authenticated', isGuest: false }, elo: 1540, highlightSelf: false },
    { rank: 2, player: { id: 'u1', username: 'Alex', authState: 'authenticated', isGuest: false }, elo: 1288, highlightSelf: true, trendLabel: '+24' },
  ],
  pinnedSelfRow: { rank: 2, player: { id: 'u1', username: 'Alex', authState: 'authenticated', isGuest: false }, elo: 1288, highlightSelf: true, trendLabel: '+24' },
  emptyMessage: undefined,
}
```

### DialogModel

```ts
const dialogModel: DialogModel = {
  status: { state: 'ready' },
  title: 'Merge guest progress?',
  message: 'Keep the higher best score and highest level when converting the guest account.',
  confirmLabel: 'Keep higher value',
  cancelLabel: 'Cancel',
  tone: 'warning',
}
```

## Nguyên tắc

1. Đây là display model, không phải persistence model.
2. Một screen có thể nhận dữ liệu từ nhiều nguồn, nhưng view model phải gom lại thành một cấu trúc dễ render.
3. Trường nào chưa có trong source docs thì phải ghi rõ là `optional` hoặc `unknown` để không invent thêm requirement.
4. Các state như loading/empty/error/offline là một phần của view model, không phải component phụ tách rời.

## Shared primitives

```ts
type ScreenState = 'loading' | 'ready' | 'empty' | 'error' | 'offline'
type AuthState = 'guest' | 'authenticated'
type VisibilityState = 'public' | 'private' | 'invite-only'
type GameMode = 'solo-practice' | 'solo-ranked' | 'versus-ranked' | 'versus-unranked'
type VersusMode = 'versus-ranked' | 'versus-unranked'
type GameId = 'number' | 'alphabet' | 'grid' | 'sequence'
type BoardId = 'global-score' | 'global-elo' | 'weekly' | 'monthly' | 'friends' | 'top-100' | 'endless'
type ConnectionState = 'connected' | 'disconnected' | 'reconnecting' | 'waiting' | 'answered' | 'locked-in'
```

```ts
interface ScreenStatusMeta {
  state: ScreenState
  title?: string
  message?: string
  retryLabel?: string
  canContinuePrimaryAction?: boolean
}
```

```ts
interface PlayerIdentity {
  id: string
  username: string
  avatarUrl?: string
  authState: AuthState
  isGuest: boolean
  badgeLabel?: string
}
```

```ts
interface GameStatsSummary {
  bestScore?: number
  highestLevel?: number
  currentElo?: number
  peakElo?: number
}
```

```ts
interface GameCatalogItem {
  id: GameId
  title: string
  description: string
  unlocked: boolean
  categoryLabel?: string
  stats?: GameStatsSummary
}
```

```ts
interface ModeOption {
  id: GameMode
  label: string
  requiresAccount: boolean
  isRanked: boolean
  isVersus: boolean
  description?: string
  lockedReason?: string
}
```

```ts
interface FriendSummary {
  id: string
  username: string
  avatarUrl?: string
  online: boolean
  currentGame?: string
  currentMode?: string
  inviteEnabled?: boolean
}
```

```ts
interface LeaderboardRow {
  rank: number
  player: PlayerIdentity
  score?: number
  elo?: number
  highlightSelf: boolean
  trendLabel?: string
}
```

```ts
interface MatchSummary {
  id: string
  mode: GameMode
  gameId: GameId
  resultLabel: string
  createdAt: string
  endedAt?: string
  score?: number
  eloDelta?: number
}
```

```ts
interface RoomSummary {
  roomId: string
  roomCode?: string
  roomLink?: string
  gameId?: GameId
  mode?: VersusMode
  visibility?: VisibilityState
  host: PlayerIdentity
  players: Array<{
    player: PlayerIdentity
    ready: boolean
    connectionState: ConnectionState
  }>
  canStart: boolean
  isFull: boolean
}
```

```ts
interface RoundTimingInfo {
  phaseLabel: 'viewing' | 'answering' | 'result' | 'waiting'
  timeRemainingMs?: number
  roundNumber?: number
  totalRounds?: number
  streak?: number
}
```

```ts
interface ResultBreakdownItem {
  label: string
  value: string | number
  emphasis?: 'low' | 'medium' | 'high'
}
```

## Screen view models

### Landing / First Run

```ts
interface LandingScreenModel {
  status: ScreenStatusMeta
  brandTitle: string
  primaryActionLabel: string
  secondaryActionLabel: string
  guestNote?: string
}
```

Data source:
- No authenticated user data required.
- Optional: session check, feature flags, or cached guest progress indicator.

### Login / Auth

```ts
interface LoginScreenModel {
  status: ScreenStatusMeta
  providers: Array<{
    id: 'google' | 'discord' | 'email'
    label: string
    enabled: boolean
  }>
  emailLogin?: {
    email?: string
    password?: string
  }
  guestContinueLabel: string
  mergeGuestPrompt?: {
    title: string
    message: string
    keepHigherValueLabel: string
  }
}
```

Data source:
- Auth provider availability.
- Guest conversion prompt from local storage + server account merge check.

### Home

```ts
interface HomeScreenModel {
  status: ScreenStatusMeta
  player: PlayerIdentity
  continuePlaying?: {
    gameId: GameId
    gameTitle: string
    modeLabel: string
    lastScore?: number
    lastLevel?: number
    progressLabel?: string
  }
  shortcuts: Array<{
    id: 'lobby' | 'profile' | 'settings' | 'leaderboard'
    label: string
    enabled: boolean
  }>
}
```

Data source:
- Auth/session state.
- Last played session from local cache or server.

### Lobby

```ts
interface LobbyScreenModel {
  status: ScreenStatusMeta
  player: PlayerIdentity
  quickMatch: {
    label: string
    description: string
    enabled: boolean
  }
  friends: FriendSummary[]
  roomSummary?: RoomSummary
  shortcuts: Array<{
    id: 'profile' | 'leaderboard' | 'settings'
    label: string
    enabled: boolean
  }>
}
```

Data source:
- Friends list.
- Lobby/room service.
- Current player Elo or category context.

### Versus Room / Create Room / Join Room

```ts
interface VersusRoomScreenModel {
  status: ScreenStatusMeta
  player: PlayerIdentity
  mode: VersusMode
  selectedGameId?: GameId
  createRoomForm: {
    categoryOptions: Array<{ id: GameId; label: string }>
    roomName?: string
    visibility: VisibilityState
    submitLabel: string
  }
  joinRoomForm: {
    roomCode?: string
    roomLink?: string
    submitLabel: string
  }
  readyRoom?: RoomSummary
}
```

Data source:
- Selected versus mode.
- Room state from server/SignalR.
- Shared room code/link.

### Game Select

```ts
interface GameSelectScreenModel {
  status: ScreenStatusMeta
  player: PlayerIdentity
  entryPoint: 'home' | 'lobby'
  modeOptions: ModeOption[]
  difficultyOptions: Array<{
    id: 'easy' | 'medium' | 'hard' | 'super-hard'
    label: string
  }>
  games: GameCatalogItem[]
  selectedGameId?: GameId
  selectedModeId?: GameMode
  selectedDifficultyId?: 'easy' | 'medium' | 'hard' | 'super-hard'
}
```

Data source:
- Game catalog.
- Per-game stats and lock state.
- Current account state.

### Gameplay

```ts
interface GameplayScreenModel {
  status: ScreenStatusMeta
  gameId: GameId
  mode: GameMode
  difficulty?: 'easy' | 'medium' | 'hard' | 'super-hard'
  round: RoundTimingInfo
  score?: number
  level?: number
  boardLabel?: string
  isPaused?: boolean
  feedback?: {
    kind: 'success' | 'error' | 'neutral'
    message: string
  }
}
```

Data source:
- Current round seed and timer.
- Current level/round progression.
- Gameplay feedback events.

### Versus Gameplay / 1v1 Match

```ts
interface VersusGameplayScreenModel extends GameplayScreenModel {
  player: PlayerIdentity
  opponent: PlayerIdentity
  sharedSeed: string
  opponentState: ConnectionState
  reconnectCountdownMs?: number
  matchProgress?: {
    currentRound: number
    totalRounds?: number
    playerRoundsCompleted?: number
    opponentRoundsCompleted?: number
    sharedTimerLabel?: string
  }
}
```

Data source:
- Shared seed from server.
- Opponent presence from realtime channel.
- Reconnect window from gameplay rules.

### Result

```ts
interface ResultScreenModel {
  status: ScreenStatusMeta
  player: PlayerIdentity
  gameId: GameId
  mode: GameMode
  resultTitle: string
  finalScore?: number
  scoreBreakdown?: ResultBreakdownItem[]
  eloDelta?: number
  outcome?: 'win' | 'loss' | 'draw'
  finishReason?: 'completed' | 'forfeit' | 'disconnect'
  versusComparison?: {
    playerName: string
    opponentName: string
    playerScore: number
    opponentScore: number
    totalRounds: number
  }
  newRecord?: {
    type: 'best-score' | 'highest-level'
    label: string
  }
  nextPrimaryActionLabel: string
  detailLinkLabel?: string
}
```

Data source:
- Submitted round result.
- Ranked formula breakdown.
- Best score / highest level comparison.
- Server-finalized Versus room (`winner_id`, `finish_reason`, host/guest score) for opponent-forfeit notification and the head-to-head comparison.

### Profile

```ts
interface ProfileScreenModel {
  status: ScreenStatusMeta
  player: PlayerIdentity
  summaryStats: {
    totalGames: number
    wins: number
    losses: number
    draws: number
    overallElo?: number
  }
  perGameStats: Array<{
    gameId: GameId
    title: string
    summary: GameStatsSummary
  }>
  friends: FriendSummary[]
  matchHistory: MatchSummary[]
  editProfileActionLabel: string
}
```

Data source:
- Player profile service.
- Match history service.
- Friend list.

### Settings

```ts
interface SettingsScreenModel {
  status: ScreenStatusMeta
  player: PlayerIdentity
  accountConnections: Array<{
    provider: 'google' | 'discord' | 'email'
    connected: boolean
    label: string
  }>
  toggles: Array<{
    id: string
    label: string
    value: boolean
    description?: string
    loading?: boolean
  }>
  logoutActionLabel: string
}
```

Data source:
- Account links.
- User preferences from local or server settings.

### Leaderboard

```ts
interface LeaderboardScreenModel {
  status: ScreenStatusMeta
  player: PlayerIdentity
  boardId: BoardId
  categoryId?: GameId
  boardOptions: Array<{
    id: BoardId
    label: string
  }>
  categoryOptions: Array<{
    id: GameId
    label: string
  }>
  rows: LeaderboardRow[]
  pinnedSelfRow?: LeaderboardRow
  emptyMessage?: string
}
```

Data source:
- Leaderboard service.
- Current player rank if authenticated.

### Dialog

```ts
interface DialogModel {
  status: ScreenStatusMeta
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  tone?: 'neutral' | 'warning' | 'danger'
}
```

Data source:
- Caller screen context.
- No standalone API required.

## Giải thích chi tiết từng model

### Shared primitives

- `ScreenState`: chuẩn trạng thái chung để mọi màn dùng cùng logic render. `ready` là trạng thái chính, các trạng thái còn lại chỉ là ngoại lệ hiển thị.
- `AuthState`: cho biết người chơi đang là guest hay đã đăng nhập. Model này rất quan trọng vì nhiều màn có hành vi khác nhau theo auth.
- `VisibilityState`: dùng cho phòng Versus để tách public/private/invite-only mà không cần invent thêm logic ở từng màn. Lưu ý: gameplay docs chỉ mô tả chia sẻ room bằng code/link, chưa xác nhận khái niệm public/private — xem `Missing in source documentation`.
- `GameMode`: 4 khóa riêng biệt (`solo-practice`, `solo-ranked`, `versus-ranked`, `versus-unranked`) dùng cho mọi chỗ cần biết chính xác đang ở nhánh nào — `ModeOption.id`, `GameSelectScreenModel.selectedModeId`, `GameplayScreenModel.mode`, `ResultScreenModel.mode`, `MatchSummary.mode`. Trước đây file dùng `SoloMode | VersusMode` riêng rẽ, nhưng cả hai đều có giá trị `'ranked'` nên không phân biệt được Solo Ranked với Versus Ranked (đã gây trùng `id` trong ví dụ `modeOptions`). `MatchSummary.mode` vốn đã tự khai báo đúng 4 khóa này inline; `GameMode` chuẩn hóa phần còn lại của file theo đúng pattern đó và giờ `MatchSummary` cũng reuse type này thay vì lặp lại union.
- `VersusMode`: tập con của `GameMode` chỉ còn `'versus-ranked' | 'versus-unranked'`, dùng riêng cho `RoomSummary.mode` và `VersusRoomScreenModel.mode` vì phòng Versus chỉ có hai nhánh này.
- `GameId`: khóa chuẩn để liên kết Home, Game Select, Gameplay, Result, Profile, và Leaderboard mà không lệch tên game.
- `BoardId`: cho màn Leaderboard chọn board type mà không phải hard-code label trong UI.
- `ConnectionState`: dùng chung cho room state và in-match state để hiển thị đúng đối thủ đang connected, waiting hay reconnecting.
- `ScreenStatusMeta`: lớp trạng thái phụ trợ của mọi màn. Nó không thay thế data chính mà chỉ nói màn đó đang ở chế độ nào và có nút retry/continue hay không.
- `PlayerIdentity`: mô tả người chơi ở mức hiển thị tối thiểu. Đây là base record cho avatar, username, guest label, và các chỗ cần nhận diện người chơi.
- `GameStatsSummary`: gom các chỉ số theo game để Home, Game Select, Profile và Result không phải tự hiểu nhiều trường rải rác.
- `GameCatalogItem`: 1 card game trên Game Select. Nó chứa toàn bộ thông tin render card, từ mô tả tới stats và lock state.
- `ModeOption`: 1 option cho selector mode. Model này rất quan trọng vì mỗi mode có điều kiện mở khác nhau.
- `FriendSummary`: 1 dòng bạn bè trong Lobby hoặc Profile. Nó đủ thông tin để show online state và nút invite.
- `LeaderboardRow`: 1 dòng ranking. `highlightSelf` giúp pin người chơi hiện tại mà không cần logic đặc biệt ở view.
- `MatchSummary`: 1 ván đã kết thúc hoặc 1 record trong lịch sử. Đây là model nhẹ cho Profile và match detail.
- `RoomSummary`: 1 phòng Versus ở trạng thái ready/in-progress. Nó gom host, danh sách người chơi, trạng thái ready, và thông tin room code/link.
- `RoundTimingInfo`: dữ liệu thời gian của gameplay. Mỗi màn gameplay chỉ cần đọc model này để biết phase, timer, round và streak.
- `ResultBreakdownItem`: 1 dòng trong score breakdown. Dùng chung cho ranked result để render base score, speed bonus, multiplier, và bonus khác.

### Landing / First Run

- `LandingScreenModel`: chỉ cần vài trường tối thiểu vì màn này không phụ thuộc người dùng đã đăng nhập hay chưa.
- `status`: nói màn có đang load session check hay đang lỗi asset không.
- `brandTitle`: giữ tiêu đề màn hiển thị đúng product name mà không hard-code trong component.
- `primaryActionLabel` / `secondaryActionLabel`: giúp v0/frontend đổi copy dễ hơn khi cần thử CTA khác.
- `guestNote`: dùng để nhắc guest chỉ ở solo practice, tránh người dùng đoán sai quyền hạn.

### Login / Auth

- `LoginScreenModel`: gom tất cả input và provider của màn auth vào một model duy nhất.
- `providers`: cho phép UI bật/tắt Google, Discord, Email theo môi trường mà không đổi layout.
- `emailLogin`: giữ state của form email/password mà không trộn với provider buttons.
- `guestContinueLabel`: cho phép màn login có đường quay lại guest một cách rõ ràng.
- `mergeGuestPrompt`: chỉ xuất hiện khi guest đang chuyển sang account thật; đây là prompt quan trọng vì nó quyết định data merge.

### Home

- `HomeScreenModel`: đại diện cho landing screen sau đăng nhập, nơi primary action là quay lại chơi.
- `player`: để hiển thị greeting, guest/auth label, và avatar.
- `continuePlaying`: khối hero chính của Home; nếu có game dở thì UI sẽ dẫn thẳng vào lượt gần nhất.
- `shortcuts`: tách các entry point phụ như Lobby/Profile/Settings/Leaderboard để Home không bị dashboard hóa.

### Lobby

- `LobbyScreenModel`: tập trung vào social/multiplayer entry.
- `quickMatch`: card chính cho luồng vào trận nhanh.
- `friends`: danh sách online friend để invite mà không cần query thêm ở view.
- `roomSummary`: cho phép Lobby hiển thị phòng gần đây hoặc trạng thái phòng hiện tại nếu player đã có room context.
- `shortcuts`: giữ các entry phụ sang profile/leaderboard/settings mà không phá primary focus của Lobby.

### Versus Room / Create Room / Join Room

- `VersusRoomScreenModel`: model trung gian giữa ý định chơi Versus và trận đấu thực sự.
- `mode`: khóa logic ranked/unranked để form biết phải hiển thị gì.
- `selectedGameId`: dùng khi phòng đã gắn với game cụ thể hoặc khi room flow cần preselect một game.
- `createRoomForm`: chứa toàn bộ field cần cho flow tạo phòng.
- `joinRoomForm`: chứa toàn bộ field cần cho flow nhập code/link.
- `readyRoom`: dữ liệu phòng đã sẵn sàng, thường là state host chờ đối thủ hoặc host bấm start.

### Game Select

- `GameSelectScreenModel`: model chọn game/mode/difficulty trong một màn duy nhất.
- `entryPoint`: cho UI biết người chơi đến từ Home hay Lobby, từ đó quyết định back target và copy phù hợp.
- `modeOptions`: selector mode, gồm cả lock state và lý do bị khóa.
- `difficultyOptions`: selector độ khó, tách riêng để không trộn với mode.
- `games`: 5 game card chính với stats và trạng thái mở khóa.
- `selectedGameId` / `selectedModeId` / `selectedDifficultyId`: state tạm để UI giữ lựa chọn hiện tại trước khi start.

### Gameplay

- `GameplayScreenModel`: lớp data chung cho tất cả game trong shared template.
- `gameId`: xác định game nào đang chạy để render board/input đúng loại.
- `mode`: quyết định UI có dùng solo/ranked/versus rule hay không.
- `difficulty`: carry từ Game Select sang để HUD hiển thị đúng độ khó và Result tính đúng difficulty multiplier; trước đây field này bị thiếu dù `Data handoff notes` đã nói rõ phải carry difficulty sang Gameplay.
- `round`: dữ liệu thời gian, phase, streak và round number; đây là lõi của gameplay display.
- `score` / `level`: các chỉ số chính mà player cần thấy trong lúc chơi.
- `boardLabel`: nhãn phụ để giải thích board đang là gì mà không thêm nhiều text.
- `isPaused`: giữ trạng thái overlay/pause mà không cần model riêng.
- `feedback`: một lớp feedback nhẹ cho input đúng/sai/trạng thái hoàn thành.

### Versus Gameplay / 1v1 Match

- `VersusGameplayScreenModel`: mở rộng gameplay chung để phục vụ realtime PvP.
- `player` / `opponent`: hai identity cần hiển thị đồng thời trong cùng trận.
- `sharedSeed`: key hiển thị/diagnostic cho biết cả hai đang chơi cùng một đề.
- `opponentState`: giúp UI phản hồi ngay trạng thái đối thủ mà không cần suy luận từ timer.
- `reconnectCountdownMs`: cho trạng thái mất kết nối trong cửa sổ reconnect.
- `matchProgress`: gom tiến độ nhiều round để UI biết đang ở round nào, hai người chơi đã hoàn thành bao nhiêu round và còn bao nhiêu round.

### Result

- `ResultScreenModel`: model cho màn kết quả, nơi cần vừa thưởng vừa kéo player sang lượt kế tiếp.
- `resultTitle`: tiêu đề lớn của kết quả, có thể là win/lose/complete tùy mode.
- `finalScore`: điểm cuối cùng để render hero score.
- `scoreBreakdown`: breakdown chi tiết cho ranked games; không cần cho mode không xếp hạng.
- `eloDelta`: chỉ xuất hiện cho Versus Ranked — theo `MY_LANE_GAME_DESIGN.md` §8 và `docs/gameplay/README.md` (đã đồng bộ), chỉ Versus Ranked mới ảnh hưởng Elo. Solo Ranked có best score/leaderboard riêng nhưng không có Elo.
- `outcome` / `finishReason`: outcome và lý do kết thúc do server chốt; `forfeit` trên máy người còn lại kích hoạt thông báo và điều hướng tự động tới Result.
- `versusComparison`: snapshot gọn của hai người chơi và tỷ số round, dùng cho card so sánh trong kết quả Versus; không thay thế score breakdown cá nhân.
- `newRecord`: thông báo nếu vừa phá best score hoặc highest level.
- `nextPrimaryActionLabel`: giúp màn Result linh hoạt giữa Play Again và các CTA khác mà không sửa layout.
- `detailLinkLabel`: nhãn ngắn cho link xem chi tiết trận.

### Profile

- `ProfileScreenModel`: model của trang danh tính + tiến bộ + lịch sử.
- `summaryStats`: số liệu tổng hợp để player biết tổng thể hành trình của mình.
- `perGameStats`: breakdown theo game để profile không phải build từng card riêng lẻ ở view.
- `friends`: hiển thị social layer ngay trong profile thay vì tách sang màn khác.
- `matchHistory`: lịch sử các trận gần đây, đủ nhẹ để load nhanh nhưng đủ đầy để drill-down.
- `editProfileActionLabel`: `screen-interface-spec.md` chốt Edit Profile là primary action của màn này; model trước đây thiếu field cho action đó.

### Settings

- `SettingsScreenModel`: model cho màn cấu hình, trong đó account connection và toggle là hai nhóm khác nhau.
- `accountConnections`: các phương thức login đã liên kết, rất quan trọng để quản lý tài khoản.
- `toggles`: các option cấu hình có thể bật/tắt, để sau này thêm preference mới mà không phải đổi layout.
- `logoutActionLabel`: tách hành động logout thành copy rõ ràng để UI không phải tự đoán.

### Leaderboard

- `LeaderboardScreenModel`: model cho mọi biến thể ranking board.
- `boardId`: xác định board hiện tại là global/weekly/monthly/friends/top100/endless.
- `categoryId`: nếu board cần lọc theo game category, field này cho phép UI biết đang xem game nào.
- `boardOptions`: danh sách tab/filter board.
- `categoryOptions`: danh sách filter theo game.
- `rows`: dữ liệu xếp hạng thực tế để render list.
- `pinnedSelfRow`: giúp pin row của chính người chơi mà không cần các rule phụ phức tạp ở component.
- `emptyMessage`: để leaderboards trống vẫn có lời giải thích rõ.

### Dialog

- `DialogModel`: model tối giản cho overlay quyết định đơn lẻ.
- `title` / `message`: nội dung chính, không cần data phức tạp.
- `confirmLabel` / `cancelLabel`: copy nút để dialog có thể dùng lại cho nhiều tình huống.
- `tone`: cho biết dialog là neutral, warning hay danger mà không đổi cấu trúc component.

## Cách đọc file này theo từng tác vụ

- Khi làm Home/Lobby/Game Select, xem các model tương ứng và `ScreenStatusMeta` trước.
- Khi làm Gameplay/Versus, ưu tiên `RoundTimingInfo`, `GameplayScreenModel`, và `VersusGameplayScreenModel`.
- Khi làm Result/Profile/Leaderboard, chú ý các model summary vì đây là nơi dùng nhiều aggregation.
- Khi chưa chắc field nào có được phép tồn tại, hãy đối chiếu mục `Missing in source documentation` ở cuối file trước khi thêm.

## Data handoff notes

- `Landing` → `Home`: only auth/session result is needed.
- `Home` → `Game Select`: carry `player`, `continuePlaying`, and the selected entry point.
- `Lobby` → `Versus Room`: carry `player`, selected mode, and any room invite context.
- `Game Select` → `Gameplay`: carry game id, mode, difficulty, and tutorial state.
- `Gameplay` → `Result`: carry round outcome, score, ranking breakdown, and best-record comparison.
- `Profile` → `Match Detail` (if added later): carry a `MatchSummary.id` or a full `MatchSummary` snapshot.

## Missing in source documentation

These items are still not fully specified in the source docs and should remain optional until product/gameplay confirms them:

- Exact settings toggles beyond account management and logout.
- Exact fields of friend presence and invite metadata.
- Exact room schema for share code vs share link if both are supported.
- Exact visual treatment of tutorial progress data.
- Exact match-detail screen model, if a dedicated route is added later.
- Room `visibility` (`public` / `private` / `invite-only`): `docs/gameplay/README.md` and `MY_LANE_GAME_DESIGN.md` only describe sharing a room by code/link — no public/private room concept is confirmed. `VisibilityState` and `createRoomForm.visibility` here are provisional examples, not a confirmed requirement.

## Resolved source-doc conflicts

- **Solo Ranked và Elo** (đã fix 2026-07-31): `docs/gameplay/README.md` bảng Game Modes từng ghi Solo Ranked "Affects Elo? Yes (Solo Elo)", mâu thuẫn với chính mục Elo System của file đó và với nguồn canonical `MY_LANE_GAME_DESIGN.md` §8 (chỉ Versus Ranked mới ảnh hưởng Elo — Elo cần đối thủ có rating để tính, solo không có đối thủ). Đã sửa bảng Game Modes thành "No" cho Solo Ranked; các ví dụ trong file này (`ResultScreenModel`, `ProfileScreenModel.matchHistory`) đã bỏ `eloDelta` khỏi các match/result `solo-ranked`, chỉ giữ `eloDelta` cho `versus-ranked`.
