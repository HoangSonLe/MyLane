import { IconSwords } from '@/components/ui/icons'
import { IconLoader } from './icons'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { Card } from '@/components/ui/card'

import type { PlayerSlot } from '@/services/versus-room/versus-room.interface'
import { PlayerSlotCard } from './PlayerSlotCard'
import { RoomCodeBar } from './RoomCodeBar'

/**
 * `mode`/`category` and `onShareCode` were dropped from the original props —
 * they were declared but never read in the render body (dead), found while
 * extracting this component to its own file. `code`/`link` are now threaded
 * in as props instead of the component reaching into module-scope mock
 * constants directly, matching `RoomCodeBar`'s own already-prop-driven API.
 */
export function ReadyRoomView({
  skeleton,
  host,
  opponent,
  isHost,
  opponentJoined,
  onStart,
  code,
  link,
}: {
  skeleton?: boolean
  host: PlayerSlot
  opponent: PlayerSlot | null
  isHost: boolean
  opponentJoined: boolean
  onStart?: () => void
  code: string
  link: string
}) {
  const bothReady = opponentJoined && (opponent?.ready ?? false) && host.ready
  const canStart = isHost && opponentJoined && bothReady

  return (
    <div className="flex flex-col gap-4">
      {/* Players */}
      <div className="flex flex-col gap-2">
        <SectionLabel label="Players" />
        <div className="flex flex-col gap-2 px-4">
          <PlayerSlotCard slot={host} isHost skeleton={skeleton} />
          <PlayerSlotCard
            slot={opponent ?? undefined}
            isEmpty={!opponentJoined}
            skeleton={skeleton}
          />
        </div>
      </div>

      {/* Room code share */}
      {!skeleton && (
        <div className="flex flex-col gap-2">
          <SectionLabel label="Invite" />
          <RoomCodeBar code={code} link={link} />
        </div>
      )}
      {skeleton && (
        <div className="flex flex-col gap-2">
          <div className="skeleton mx-4" style={{ height: '0.75rem', width: '4rem', borderRadius: 'var(--radius-sm)' }} />
          <div className="skeleton mx-4" style={{ height: '3.5rem', borderRadius: 'var(--radius-2xl)' }} />
        </div>
      )}

      {/* Waiting indicator when host but opponent hasn't joined */}
      {!skeleton && isHost && !opponentJoined && (
        <Card className="mx-4 flex items-center gap-2.5" border="subtle" padding="0.875rem 1rem">
          <span style={{ color: 'var(--ma-fg-muted)' }} aria-live="polite">
            <IconLoader />
          </span>
          <p className="text-[13px]" style={{ color: 'var(--ma-fg-muted)' }}>
            Waiting for opponent to join…
          </p>
        </Card>
      )}

      {/* Start button — host only */}
      {isHost && (
        <div className="px-4">
          <button
            type="button"
            onClick={onStart}
            disabled={!canStart}
            className={[
              'flex h-14 w-full items-center justify-center gap-2.5',
              'text-[15px] font-semibold',
              'transition-transform duration-[var(--ma-duration-micro)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
              !canStart ? 'opacity-40 cursor-not-allowed' : 'active:scale-[0.97]',
            ].join(' ')}
            style={{
              borderRadius: 'var(--radius-2xl)',
              background: !skeleton ? 'var(--ma-brand)' : 'transparent',
              color: 'var(--ma-brand-fg)',
              boxShadow: canStart ? '0 4px 24px oklch(0.78 0.16 75 / 0.28)' : 'none',
            }}
            aria-label={canStart ? 'Start the match' : 'Waiting for both players to be ready'}
          >
            {skeleton ? null : (
              <>
                <span style={{ color: 'var(--ma-brand-fg)' }}>
                  <IconSwords />
                </span>
                {canStart ? 'Start Match' : opponentJoined ? 'Waiting for ready…' : 'Waiting for opponent…'}
              </>
            )}
          </button>
          {!skeleton && isHost && opponentJoined && !canStart && (
            <p
              className="mt-2 text-center text-[11px]"
              style={{ color: 'var(--ma-fg-subtle)' }}
              aria-live="polite"
            >
              Both players must be ready to start.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
