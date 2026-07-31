import { Phase, GameId, OpponentStatus, RoundMode } from '@/configs/enum'

const GAME_LABELS: Record<GameId, string> = {
  [GameId.NUMBER]:   'Number Memory',
  [GameId.ALPHABET]: 'Alphabet Memory',
  [GameId.GRID]:     'Grid Memory',
  [GameId.SEQUENCE]: 'Sequence Memory',
}

const OPP_LABEL: Record<OpponentStatus, string> = {
  [OpponentStatus.CONNECTED]:    'Connected',
  [OpponentStatus.DISCONNECTED]: 'Disconnected',
  [OpponentStatus.ANSWERED]:     'Answered',
  [OpponentStatus.LOCKED_IN]:    'Locked in',
  [OpponentStatus.WAITING]:      'Waiting…',
  [OpponentStatus.RECONNECTING]: 'Reconnecting…',
}

const OPP_COLOR: Record<OpponentStatus, string> = {
  [OpponentStatus.CONNECTED]:    'var(--ma-progress)',
  [OpponentStatus.DISCONNECTED]: 'var(--ma-danger)',
  [OpponentStatus.ANSWERED]:     'var(--ma-success)',
  [OpponentStatus.LOCKED_IN]:    'var(--ma-brand)',
  [OpponentStatus.WAITING]:      'var(--ma-fg-muted)',
  [OpponentStatus.RECONNECTING]: 'var(--ma-warning)',
}

export function MatchupHeader({
  playerName, playerScore,
  opponentName, opponentScore,
  opponentStatus,
  round, totalRounds,
  timer, maxTimer,
  phase,
  gameType,
  roundMode,
}: {
  playerName: string; playerScore: number
  opponentName: string; opponentScore: number
  opponentStatus: OpponentStatus
  round: number; totalRounds: number
  timer: number; maxTimer: number
  phase: Phase
  gameType: GameId
  roundMode: RoundMode
}) {
  const timerColor = timer <= 5 ? 'var(--ma-danger)' : 'var(--ma-progress)'
  const r     = 13
  const circ  = 2 * Math.PI * r
  const pct   = Math.max(0, timer / maxTimer)
  const offset = circ * (1 - pct)

  const isAnswering = phase === Phase.ANSWERING
  const oppColor    = OPP_COLOR[opponentStatus]
  const oppLabel    = OPP_LABEL[opponentStatus]
  const isOppGone   = opponentStatus === OpponentStatus.DISCONNECTED || opponentStatus === OpponentStatus.RECONNECTING

  return (
    <div
      className="mx-4 mt-2 rounded-2xl overflow-hidden"
      style={{ background: 'var(--ma-surface)', border: '1px solid var(--ma-border)', boxShadow: 'var(--ma-shadow-sm)' }}
      aria-label="Versus match header"
    >
      {/* Top row: game + round label */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{ borderColor: 'var(--ma-border)' }}
      >
        <span className="text-[11px] font-semibold tracking-wide" style={{ color: 'var(--ma-fg-muted)' }}>
          {GAME_LABELS[gameType]}
        </span>
        <span
          className="text-[11px] font-bold tabular-nums"
          style={{ color: 'var(--ma-fg-subtle)' }}
        >
          Round {round} / {totalRounds}
        </span>
        <span
          className="text-[11px] font-semibold rounded-lg px-2 py-0.5"
          style={{
            background: roundMode === RoundMode.VERSUS_RANKED ? 'oklch(0.76 0.14 74 / 0.12)' : 'var(--ma-surface-raised)',
            color: roundMode === RoundMode.VERSUS_RANKED ? 'var(--ma-brand)' : 'var(--ma-fg-muted)',
          }}
        >
          {roundMode === RoundMode.VERSUS_RANKED ? 'Ranked' : 'Unranked'}
        </span>
      </div>

      {/* Player vs opponent row */}
      <div className="flex items-center gap-2 px-4 py-3">
        {/* Player */}
        <div className="flex flex-1 flex-col items-start gap-0.5 min-w-0">
          <span
            className="text-[10px] font-medium uppercase tracking-widest"
            style={{ color: 'var(--ma-fg-subtle)' }}
          >
            You
          </span>
          <span
            className="text-[15px] font-bold truncate max-w-[80px]"
            style={{ color: 'var(--ma-fg)' }}
          >
            {playerName}
          </span>
          <span
            className="text-[20px] font-bold tabular-nums leading-none"
            style={{ color: 'var(--ma-progress)' }}
          >
            {playerScore}
          </span>
        </div>

        {/* Centre: timer ring or VS badge */}
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          {isAnswering ? (
            <div
              className="relative flex h-12 w-12 items-center justify-center"
              aria-label={`${timer}s remaining`}
            >
              <svg width="48" height="48" viewBox="0 0 32 32" className="-rotate-90" aria-hidden="true">
                <circle cx="16" cy="16" r={r} strokeWidth="2.5" fill="none" stroke="var(--ma-border)" />
                <circle
                  cx="16" cy="16" r={r} strokeWidth="2.5" fill="none"
                  stroke={timerColor}
                  strokeDasharray={circ}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
                />
              </svg>
              <span
                className="absolute text-[13px] font-bold tabular-nums"
                style={{ color: timerColor }}
              >
                {timer}
              </span>
            </div>
          ) : (
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-[12px] font-bold"
              style={{
                background: 'var(--ma-surface-raised)',
                color: 'var(--ma-fg-muted)',
                border: '1px solid var(--ma-border)',
              }}
            >
              VS
            </div>
          )}
        </div>

        {/* Opponent */}
        <div className="flex flex-1 flex-col items-end gap-0.5 min-w-0">
          <span
            className="text-[10px] font-medium uppercase tracking-widest"
            style={{ color: 'var(--ma-fg-subtle)' }}
          >
            Opponent
          </span>
          <span
            className="text-[15px] font-bold truncate max-w-[80px]"
            style={{ color: isOppGone ? 'var(--ma-fg-muted)' : 'var(--ma-fg)' }}
          >
            {opponentName}
          </span>
          <div className="flex flex-col items-end gap-0.5">
            <span
              className="text-[20px] font-bold tabular-nums leading-none"
              style={{ color: isOppGone ? 'var(--ma-fg-subtle)' : 'var(--ma-progress)' }}
            >
              {opponentScore}
            </span>
            <span
              className="text-[10px] font-semibold"
              style={{ color: oppColor }}
            >
              {oppLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
