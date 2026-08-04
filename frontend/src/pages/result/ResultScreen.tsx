import { useCallback, useEffect, useRef, useState } from 'react'

import { ScreenShell, ScreenMain } from '@/components/ui/layout'
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
import { VersusComparisonCard } from './components/VersusComparisonCard'
import { Toast } from '@/components/ui/Toast'
import { ScoringRulesModal, type ScoringSectionId } from '@/components/ui/modal/ScoringRulesModal'
import { resultService } from '@/services/result/result.service'
import { computeScore } from '@/services/gameplay/game-rules'
import { getGameLabels, getModeLabels } from '@/services/gameplay/gameplay-screen.types'
import { EntryPoint, ModeId } from '@/configs/enum'
import type { GameResultInput, ResultData } from '@/services/result/result.interface'
import { useAuthStore } from '@/stores/auth.store'
import { useTranslation } from '@/i18n/useTranslation'

interface Props {
  /** Raw tallies from the just-finished Gameplay session — null shouldn't happen via real navigation. */
  result: GameResultInput | null
  entryPoint?: EntryPoint
  onPlayAgain?: () => void
  onHome?: () => void
  onViewDetail?: () => void
  onLogIn?: () => void
  onNavigate?: (screen: string) => void
}

const PLACEHOLDER: ResultData = {
  game: '', mode: ModeId.SOLO_PRACTICE, modeLabel: '', score: 0, levelReached: 0,
  previousBestScore: null, previousBestLevel: null, isNewRecord: false,
}

// ─── Main component ───────────────────────────────────────────────
export function ResultScreen({
  result,
  entryPoint = EntryPoint.HOME,
  onPlayAgain,
  onHome,
  onViewDetail,
  onLogIn,
  onNavigate,
}: Props) {
  const user = useAuthStore((s) => s.user)
  const isGuest = user?.isGuest ?? true
  const { t } = useTranslation()
  const gameLabels = getGameLabels(t)
  const modeLabels = getModeLabels(t)

  const [data, setData] = useState<ResultData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(result !== null)
  const [syncError, setSyncError] = useState(false)
  const opponentForfeited = result?.finishReason === 'forfeit' && result.outcome === 'win'
  const [showForfeitToast, setShowForfeitToast] = useState(opponentForfeited)

  const [scoringRulesModalState, setScoringRulesModalState] = useState<{
    open: boolean
    section: ScoringSectionId | null
  }>({ open: false, section: null })

  const handleOpenScoringRules = useCallback((section?: ScoringSectionId) => {
    setScoringRulesModalState({ open: true, section: section ?? null })
  }, [])

  // Submitting mutates server-side stats (bestScore/highestLevel), so unlike
  // a plain fetch it can't just tolerate StrictMode's double-invoke of
  // mount effects — a second POST would compute "previous best" against
  // the first POST's already-updated value. This ref makes the automatic
  // first submission per `result` instance fire exactly once; the retry
  // button below still calls `submit` directly, bypassing this guard.
  const submittedForRef = useRef<GameResultInput | null>(null)

  const submit = useCallback(async () => {
    if (!result) { setIsSubmitting(false); return }
    setIsSubmitting(true)
    setSyncError(false)
    try {
      setData(await resultService.submitResult(result))
    } catch {
      // docs/ui/screen-interface-spec.md § Result Error: "vẫn hiện điểm số
      // local" — fall back to the same formula, computed client-side.
      const isRanked = result.mode === ModeId.SOLO_RANKED || result.mode === ModeId.VERSUS_RANKED
      const breakdown = computeScore({ ...result, isRanked })
      setData({
        game: gameLabels[result.game],
        mode: result.mode,
        modeLabel: modeLabels[result.mode],
        score: breakdown.score,
        levelReached: result.levelReached,
        previousBestScore: null,
        previousBestLevel: null,
        isNewRecord: false,
        rankedBreakdown: isRanked ? breakdown : undefined,
      })
      setSyncError(true)
    } finally {
      setIsSubmitting(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  useEffect(() => {
    if (!result) {
      setData(null)
      setIsSubmitting(false)
      return
    }
    if (submittedForRef.current === result) return
    submittedForRef.current = result
    submit()
  }, [result, submit])

  useEffect(() => {
    setShowForfeitToast(opponentForfeited)
    if (!opponentForfeited) return
    const timer = window.setTimeout(() => setShowForfeitToast(false), 4500)
    return () => window.clearTimeout(timer)
  }, [opponentForfeited])

  const isVersus = data?.mode === ModeId.VERSUS_RANKED || data?.mode === ModeId.VERSUS_UNRANKED
  const effectiveEntryPoint: EntryPoint = isVersus ? EntryPoint.LOBBY : entryPoint

  return (
    <ScreenShell>
      <Toast
        visible={showForfeitToast}
        variant="success"
        message={t.result.opponentForfeited}
        onClose={() => setShowForfeitToast(false)}
      />
      <ScoringRulesModal
        visible={scoringRulesModalState.open}
        highlightSection={scoringRulesModalState.section}
        onClose={() => setScoringRulesModalState({ open: false, section: null })}
      />
      <ScreenMain bottomPadding="pb-28" topPadding="none" className="pt-20">
        {/* Score hero */}
        <ScoreHero
          skeleton={isSubmitting}
          data={data ?? PLACEHOLDER}
          onOpenScoringRules={handleOpenScoringRules}
        />

        {/* Divider */}
        <div
          className="mx-4"
          style={{ height: '1px', background: 'var(--ma-border-subtle)' }}
          aria-hidden="true"
        />

        {result?.versusComparison && (
          <VersusComparisonCard
            comparison={result.versusComparison}
            outcome={result.outcome}
            finishReason={result.finishReason}
          />
        )}

        {/* ── Conditional status blocks ── */}

        {/* Saving indicator */}
        {isSubmitting && <SavingOverlay />}

        {/* Save error — score above is still the local fallback, not blocked */}
        {!isSubmitting && syncError && <SaveErrorCard onRetry={submit} />}

        {/* Guest notice — nothing is being saved */}
        {!isSubmitting && isGuest && (
          <GuestNotice onLogIn={onLogIn ?? (() => onNavigate?.('login'))} />
        )}

        {!isSubmitting && data && !isGuest && (
          <>
            {data.isNewRecord && <NewRecordBadge data={data} />}
            <EloChangeCard data={data} onOpenScoringRules={handleOpenScoringRules} />
            <RankedBreakdownCard data={data} onOpenScoringRules={handleOpenScoringRules} />
            <BestComparison data={data} />
          </>
        )}

        {/* ── Actions ── */}
        <div className="flex flex-col gap-3 mt-auto">
          <PrimaryButton onClick={onPlayAgain} isVersus={!!isVersus} />
          <SecondaryActions
            entryPoint={effectiveEntryPoint}
            onHome={onHome}
            onViewDetail={onViewDetail}
          />
        </div>
      </ScreenMain>
    </ScreenShell>
  )
}
