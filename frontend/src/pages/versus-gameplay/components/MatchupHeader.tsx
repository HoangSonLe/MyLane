import { Phase, GameId, OpponentStatus, RoundMode } from '@/configs/enum'
import { getGameLabels } from '@/services/gameplay/gameplay-screen.types'
import { useTranslation } from '@/i18n/useTranslation'

const OPP_COLOR: Record<OpponentStatus, string> = {
  [OpponentStatus.CONNECTED]:    'var(--ma-progress)',
  [OpponentStatus.DISCONNECTED]: 'var(--ma-danger)',
  [OpponentStatus.ANSWERED]:     'var(--ma-success)',
  [OpponentStatus.LOCKED_IN]:    'var(--ma-brand)',
  [OpponentStatus.WAITING]:      'var(--ma-fg-muted)',
  [OpponentStatus.RECONNECTING]: 'var(--ma-warning)',
}

function RoundProgress({
  completed,
  total,
  color,
  label,
  align = 'start',
}: {
  completed: number
  total: number
  color: string
  label: string
  align?: 'start' | 'end'
}) {
  const safeCompleted = Math.min(Math.max(completed, 0), total)

  return (
    <div className="flex w-full flex-col gap-1" aria-label={label}>
      <div className="flex w-full gap-1" aria-hidden="true">
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            className="h-1 flex-1 rounded-full transition-colors"
            style={{ background: index < safeCompleted ? color : 'var(--ma-border)' }}
          />
        ))}
      </div>
      <span
        className={`text-[9px] font-semibold tabular-nums ${align === 'end' ? 'self-end' : 'self-start'}`}
        style={{ color: 'var(--ma-fg-subtle)' }}
      >
        {label}
      </span>
    </div>
  )
}

export function MatchupHeader({
  playerName, playerScore,
  opponentName, opponentScore,
  playerRoundsCompleted, opponentRoundsCompleted,
  opponentStatus,
  round, totalRounds,
  timer, maxTimer,
  phase,
  gameType,
  roundMode,
}: {
  playerName: string; playerScore: number
  opponentName: string; opponentScore: number
  playerRoundsCompleted: number; opponentRoundsCompleted: number
  opponentStatus: OpponentStatus
  round: number; totalRounds: number
  timer: number; maxTimer: number
  phase: Phase
  gameType: GameId
  roundMode: RoundMode
}) {
  const { t } = useTranslation()
  const gameLabels = getGameLabels(t)
  const OPP_LABEL: Record<OpponentStatus, string> = {
    [OpponentStatus.CONNECTED]:    t.versusGameplay.oppConnected,
    [OpponentStatus.DISCONNECTED]: t.versusGameplay.oppDisconnected,
    [OpponentStatus.ANSWERED]:     t.versusGameplay.oppAnswered,
    [OpponentStatus.LOCKED_IN]:    t.versusGameplay.oppLockedIn,
    [OpponentStatus.WAITING]:      t.versusGameplay.oppWaiting,
    [OpponentStatus.RECONNECTING]: t.versusGameplay.oppReconnecting,
  }
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
      aria-label={t.versusGameplay.matchHeaderAria}
    >
      {/* Top row: game + round label */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{ borderColor: 'var(--ma-border)' }}
      >
        <span className="text-[11px] font-semibold tracking-wide" style={{ color: 'var(--ma-fg-muted)' }}>
          {gameLabels[gameType]}
        </span>
        <span
          className="text-[11px] font-bold tabular-nums"
          style={{ color: 'var(--ma-fg-subtle)' }}
        >
          {t.versusGameplay.roundOf(round, totalRounds)}
        </span>
        <span
          className="text-[11px] font-semibold rounded-lg px-2 py-0.5"
          style={{
            background: roundMode === RoundMode.VERSUS_RANKED ? 'oklch(0.76 0.14 74 / 0.12)' : 'var(--ma-surface-raised)',
            color: roundMode === RoundMode.VERSUS_RANKED ? 'var(--ma-brand)' : 'var(--ma-fg-muted)',
          }}
        >
          {roundMode === RoundMode.VERSUS_RANKED ? t.versusGameplay.ranked : t.versusGameplay.unranked}
        </span>
      </div>

      {/* Player vs opponent row */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        {/* Player */}
        <div
          className="flex flex-1 flex-col items-start gap-0.5 min-w-0 p-2 rounded-xl transition-all"
          style={{
            background: isAnswering ? 'oklch(0.76 0.14 74 / 0.12)' : 'transparent',
            border: isAnswering ? '2px solid var(--ma-brand)' : '1.5px solid transparent',
            boxShadow: isAnswering ? '0 0 12px oklch(0.76 0.14 74 / 0.20)' : 'none',
          }}
        >
          <div className="flex items-center gap-1.5 w-full">
            <span
              className="text-[10px] font-medium uppercase tracking-widest"
              style={{ color: 'var(--ma-fg-subtle)' }}
            >
              {t.versusGameplay.you}
            </span>
            {isAnswering && (
              <span
                className="flex items-center text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full animate-pulse whitespace-nowrap"
                style={{ background: 'var(--ma-brand)', color: 'var(--ma-brand-fg)' }}
              >
                {t.versusGameplay.yourTurnBadge}
              </span>
            )}
          </div>
          <span
            className="text-[15px] font-extrabold truncate max-w-[90px] transition-colors"
            style={{ color: isAnswering ? 'var(--ma-brand)' : 'var(--ma-fg)' }}
          >
            {playerName}
          </span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-[20px] font-bold tabular-nums leading-none" style={{ color: 'var(--ma-progress)' }}>
              {playerScore}
            </span>
            <span className="text-[10px] font-semibold tabular-nums" style={{ color: 'var(--ma-fg-subtle)' }}>
              /{totalRounds}
            </span>
          </div>
          <RoundProgress
            completed={playerRoundsCompleted}
            total={totalRounds}
            color="var(--ma-brand)"
            label={t.versusGameplay.roundOf(playerRoundsCompleted, totalRounds)}
          />
        </div>

        {/* Centre: timer ring or VS badge */}
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          {isAnswering ? (
            <div
              className="relative flex h-12 w-12 items-center justify-center"
              aria-label={t.versusGameplay.timerRemainingAria(timer)}
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
              {t.versusGameplay.vsLabel}
            </div>
          )}
        </div>

        {/* Opponent */}
        {(() => {
          const isOppDone = opponentStatus === OpponentStatus.ANSWERED || opponentStatus === OpponentStatus.LOCKED_IN
          const isOppActive = isAnswering && !isOppDone && !isOppGone
          const oppNameColor = isOppDone
            ? 'var(--ma-success)'
            : isOppActive
            ? 'var(--ma-brand)'
            : isOppGone
            ? 'var(--ma-fg-muted)'
            : 'var(--ma-fg)'

          return (
            <div
              className="flex flex-1 flex-col items-end gap-0.5 min-w-0 p-2 rounded-xl transition-all"
              style={{
                background: isOppActive ? 'oklch(0.76 0.14 74 / 0.08)' : isOppDone ? 'oklch(0.70 0.15 145 / 0.08)' : 'transparent',
                border: isOppActive ? '1.5px solid var(--ma-brand)' : isOppDone ? '1.5px solid var(--ma-success)' : '1.5px solid transparent',
              }}
            >
              <div className="flex items-center gap-1.5 justify-end w-full">
                {isOppDone && (
                  <span
                    className="flex items-center text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full whitespace-nowrap"
                    style={{ background: 'oklch(0.70 0.15 145 / 0.20)', color: 'var(--ma-success)' }}
                  >
                    ✓ Đã nộp
                  </span>
                )}
                {isOppActive && (
                  <span
                    className="flex items-center text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full animate-pulse whitespace-nowrap"
                    style={{ background: 'var(--ma-brand-soft)', color: 'var(--ma-brand)' }}
                  >
                    ● Đang nhập
                  </span>
                )}
                <span
                  className="text-[10px] font-medium uppercase tracking-widest"
                  style={{ color: 'var(--ma-fg-subtle)' }}
                >
                  {t.versusGameplay.opponent}
                </span>
              </div>
              <span
                className="text-[15px] font-extrabold truncate max-w-[90px] transition-colors"
                style={{ color: oppNameColor }}
              >
                {opponentName}
              </span>
              <div className="flex w-full flex-col items-end gap-1">
                <div className="flex items-baseline gap-0.5">
                  <span
                    className="text-[20px] font-bold tabular-nums leading-none"
                    style={{ color: isOppGone ? 'var(--ma-fg-subtle)' : 'var(--ma-progress)' }}
                  >
                    {opponentScore}
                  </span>
                  <span className="text-[10px] font-semibold tabular-nums" style={{ color: 'var(--ma-fg-subtle)' }}>
                    /{totalRounds}
                  </span>
                </div>
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: oppColor }}
                >
                  {oppLabel}
                </span>
                <RoundProgress
                  completed={opponentRoundsCompleted}
                  total={totalRounds}
                  color={isOppGone ? 'var(--ma-fg-subtle)' : 'var(--ma-brand)'}
                  label={t.versusGameplay.roundOf(opponentRoundsCompleted, totalRounds)}
                  align="end"
                />
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
