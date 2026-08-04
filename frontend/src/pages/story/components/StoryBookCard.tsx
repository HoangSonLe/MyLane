import { useCallback, useEffect, useRef, useState } from 'react'
import type { AnimationEvent } from 'react'

import { Button } from '@/components/ui/button'

const TRANSITION_FALLBACK_MS = 480

type TransitionPhase = 'idle' | 'out-next' | 'out-prev' | 'in-next' | 'in-prev'

export interface ChapterData {
  id: number
  tag: string
  title: string
  subtitle: string
  image?: string
  content: string[]
  takeaway: string
}

interface StoryBookCardProps {
  chapter: ChapterData
  totalChapters: number
  isLastChapter: boolean
  isFirstChapter: boolean
  onNext: () => void
  onPrev: () => void
  onPlay: () => void
  onBusyChange: (isBusy: boolean) => void
  prevLabel: string
  nextLabel: string
  beginJourneyLabel: string
}

export function StoryBookCard({
  chapter,
  totalChapters,
  isLastChapter,
  isFirstChapter,
  onNext,
  onPrev,
  onPlay,
  onBusyChange,
  prevLabel,
  nextLabel,
  beginJourneyLabel,
}: StoryBookCardProps) {
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>('idle')
  const phaseHandledRef = useRef(false)
  const isBusy = transitionPhase !== 'idle'

  const advanceTransition = useCallback(() => {
    if (phaseHandledRef.current || transitionPhase === 'idle') return
    phaseHandledRef.current = true

    if (transitionPhase === 'out-next') {
      onNext()
      phaseHandledRef.current = false
      setTransitionPhase('in-next')
      return
    }

    if (transitionPhase === 'out-prev') {
      onPrev()
      phaseHandledRef.current = false
      setTransitionPhase('in-prev')
      return
    }

    setTransitionPhase('idle')
    onBusyChange(false)
  }, [onBusyChange, onNext, onPrev, transitionPhase])

  const startTransition = (direction: 'next' | 'prev') => {
    if (isBusy) return

    const isBlocked = direction === 'next' ? isLastChapter : isFirstChapter
    if (isBlocked) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (direction === 'next') onNext()
      else onPrev()
      return
    }

    phaseHandledRef.current = false
    onBusyChange(true)
    setTransitionPhase(direction === 'next' ? 'out-next' : 'out-prev')
  }

  const handleAnimationEnd = (event: AnimationEvent<HTMLElement>) => {
    if (event.currentTarget !== event.target) return
    advanceTransition()
  }

  useEffect(() => {
    if (transitionPhase === 'idle') return
    const fallbackId = window.setTimeout(advanceTransition, TRANSITION_FALLBACK_MS)
    return () => window.clearTimeout(fallbackId)
  }, [advanceTransition, transitionPhase])

  useEffect(
    () => () => {
      onBusyChange(false)
    },
    [onBusyChange],
  )

  const transitionClass =
    transitionPhase === 'idle'
      ? ''
      : `story-card-transition story-card-transition--${transitionPhase}`

  return (
    <article
      aria-busy={isBusy}
      aria-live="polite"
      onAnimationEnd={handleAnimationEnd}
      className={`relative isolate mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-border-subtle bg-surface-raised shadow-xl ${transitionClass}`}
    >
      <div className="grid min-w-0 md:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]">
        <div className="relative aspect-[16/10] min-h-0 overflow-hidden bg-surface md:aspect-auto md:min-h-[32rem]">
          {chapter.image ? (
            <img
              src={chapter.image}
              alt={chapter.title}
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
            />
          ) : null}

          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-black/15"
            aria-hidden="true"
          />

          <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-4 sm:p-5">
            <span className="rounded-full bg-black/55 px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-white backdrop-blur-sm">
              {chapter.tag}
            </span>
            <span className="rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {chapter.id} / {totalChapters}
            </span>
          </div>

          <p className="absolute inset-x-0 bottom-0 p-4 text-sm font-medium leading-snug text-white sm:p-5">
            {chapter.subtitle}
          </p>
        </div>

        <div className="flex min-w-0 flex-col p-4 sm:p-6 md:p-8">
          <div className="min-w-0 flex-1">
            <h2 className="break-words text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
              {chapter.title}
            </h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
              {chapter.subtitle}
            </p>

            <div className="mt-6 space-y-4 text-[15px] leading-7 text-foreground/90">
              {chapter.content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-brand/20 bg-brand/8 p-4">
              <div className="flex gap-3">
                <span
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-foreground"
                  aria-hidden="true"
                >
                  →
                </span>
                <p className="text-sm font-semibold leading-6 text-foreground">
                  {chapter.takeaway}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border-subtle pt-5 sm:grid-cols-[auto_1fr_auto]">
            <Button
              variant="surface"
              size="app-11"
              onClick={() => startTransition('prev')}
              disabled={isFirstChapter || isBusy}
              className="w-full min-w-0 justify-center px-3 text-xs sm:w-auto sm:px-4"
            >
              <span aria-hidden="true">←</span>
              <span className="truncate">{prevLabel}</span>
            </Button>

            <span className="hidden self-center text-center text-xs font-medium text-muted-foreground sm:block">
              {chapter.id} / {totalChapters}
            </span>

            {isLastChapter ? (
              <Button
                variant="brand"
                size="app-11"
                onClick={onPlay}
                disabled={isBusy}
                className="w-full min-w-0 justify-center px-3 text-xs font-bold sm:w-auto sm:px-5"
              >
                <span className="truncate">{beginJourneyLabel}</span>
                <span aria-hidden="true">→</span>
              </Button>
            ) : (
              <Button
                variant="brand"
                size="app-11"
                onClick={() => startTransition('next')}
                disabled={isBusy}
                className="w-full min-w-0 justify-center px-3 text-xs font-bold sm:w-auto sm:px-5"
              >
                <span className="truncate">{nextLabel}</span>
                <span aria-hidden="true">→</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
