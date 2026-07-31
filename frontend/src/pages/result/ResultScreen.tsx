import { useState } from 'react'

import { StatePill } from './components/StatePill'
import { ScoreHero } from './components/ScoreHero'
import { NewRecordBadge } from './components/NewRecordBadge'
import { EloChangeCard } from './components/EloChangeCard'
import { RankedBreakdownCard } from './components/RankedBreakdownCard'
import { BestComparison } from './components/BestComparison'
import { GuestNotice } from './components/GuestNotice'
import { SavingOverlay } from './components/SavingOverlay'
import { SaveErrorCard } from './components/SaveErrorCard'
import { PrimaryButton } from './components/PrimaryButton'
import { SecondaryActions } from './components/SecondaryActions'
import { MOCK_RESULTS, MOCK_VERSUS } from '@/services/result/result.mock'
import { ScreenState, EntryPoint, ModeId } from '@/configs/enum'
import type { ResultData } from '@/services/result/result.interface'

interface Props {
  entryPoint?: EntryPoint
  onPlayAgain?: () => void
  onHome?: () => void
  onViewDetail?: () => void
}

// ─── Main component ───────────────────────────────────────────────
export function ResultScreen({
  entryPoint = EntryPoint.HOME,
  onPlayAgain,
  onHome,
  onViewDetail,
}: Props) {
  const [screenState, setScreenState] = useState<ScreenState>(ScreenState.NORMAL)
  const [showVersus, setShowVersus] = useState(false)
  const [retrying, setRetrying] = useState(false)

  const data: ResultData =
    showVersus
      ? MOCK_VERSUS
      : MOCK_RESULTS[screenState]

  const isLoading = screenState === ScreenState.LOADING
  const isError   = screenState === ScreenState.ERROR
  const isGuest   = screenState === ScreenState.GUEST
  const isVersus  = data.mode === ModeId.VERSUS_RANKED || data.mode === ModeId.VERSUS_UNRANKED

  const effectiveEntryPoint: EntryPoint = isVersus ? EntryPoint.LOBBY : entryPoint

  function handleRetry() {
    setRetrying(true)
    // Simulate retry — resets to normal after 1.5 s
    setTimeout(() => {
      setRetrying(false)
      setScreenState(ScreenState.NORMAL)
    }, 1500)
  }

  return (
    <div
      className="relative flex min-h-dvh flex-col"
      style={{ background: 'var(--ma-bg)' }}
    >
      <main
        id="main-content"
        className="flex flex-1 flex-col gap-5 pb-28 pt-20"
      >
        {/* Score hero */}
        <ScoreHero skeleton={false} data={data} />

        {/* Divider */}
        <div
          className="mx-4"
          style={{ height: '1px', background: 'var(--ma-border-subtle)' }}
          aria-hidden="true"
        />

        {/* ── Conditional status blocks ── */}

        {/* Guest notice */}
        {isGuest && <GuestNotice />}

        {/* Saving indicator */}
        {isLoading && <SavingOverlay />}

        {/* Save error */}
        {(isError || retrying) && (
          <SaveErrorCard onRetry={retrying ? undefined : handleRetry} />
        )}

        {/* New record badge */}
        {!isGuest && data.isNewRecord && <NewRecordBadge data={data} />}

        {/* Elo change — Versus Ranked only */}
        {!isGuest && <EloChangeCard data={data} />}

        {/* Score breakdown — Ranked modes only */}
        {!isGuest && <RankedBreakdownCard data={data} />}

        {/* Previous best comparison */}
        {!isGuest && <BestComparison data={data} />}

        {/* ── Actions ── */}
        <div className="flex flex-col gap-3 mt-auto">
          <PrimaryButton onClick={onPlayAgain} isVersus={isVersus} />
          <SecondaryActions
            entryPoint={effectiveEntryPoint}
            onHome={onHome}
            onViewDetail={onViewDetail}
          />
        </div>
      </main>

      {/* Prototype state pill */}
      <StatePill
        current={screenState}
        onChange={setScreenState}
        showVersus={showVersus}
        onToggleVersus={() => setShowVersus((v) => !v)}
      />
    </div>
  )
}
