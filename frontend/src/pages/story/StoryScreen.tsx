import { useState, useEffect } from 'react'

import { BackButton } from '@/components/ui/BackButton'
import { ScreenMain, ScreenShell } from '@/components/ui/layout'
import { useTranslation } from '@/i18n/useTranslation'
import { useHapticsStore } from '@/stores/haptics.store'
import { StoryBookCard, type ChapterData } from './components/StoryBookCard'

interface StoryScreenProps {
  onBack?: () => void
  onPlay?: () => void
}

export function StoryScreen({ onBack, onPlay }: StoryScreenProps) {
  const { t } = useTranslation()
  const hapticsEnabled = useHapticsStore((state) => state.enabled)
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Scroll to top whenever chapter changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    const mainEl = document.getElementById('main-content')
    if (mainEl) mainEl.scrollTop = 0
  }, [currentChapterIndex])

  const storyData = t.story
  const chapters: ChapterData[] = storyData.chapters
  const currentChapter = chapters[currentChapterIndex]
  const totalChapters = chapters.length

  const triggerHaptic = () => {
    if (!hapticsEnabled || typeof navigator === 'undefined' || !('vibrate' in navigator)) return
    try {
      navigator.vibrate(20)
    } catch {}
  }

  const handleNext = () => {
    triggerHaptic()
    setCurrentChapterIndex((current) => Math.min(current + 1, totalChapters - 1))
  }

  const handlePrev = () => {
    triggerHaptic()
    setCurrentChapterIndex((current) => Math.max(current - 1, 0))
  }

  const handleChapterSelect = (index: number) => {
    if (isTransitioning || index === currentChapterIndex) return
    triggerHaptic()
    setCurrentChapterIndex(index)
  }

  return (
    <ScreenShell className="overflow-x-hidden">
      <ScreenMain bottomPadding="pb-24" gap={false}>
        <header className="relative mx-auto flex w-full max-w-5xl items-center justify-between px-2 pt-3 pb-3 sm:px-4 sm:pt-5 sm:pb-4">
          <div className="absolute left-2 top-3 z-10 sm:left-4 sm:top-4">
            <BackButton onBack={onBack} iconOnly />
          </div>
          <div className="w-full px-10 text-center sm:px-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">
              {storyData.eyebrow}
            </p>
            <h1 className="mt-0.5 text-xl font-bold leading-tight tracking-tight text-foreground sm:text-2xl md:text-3xl">
              {storyData.title}
            </h1>
            <p className="mx-auto mt-1 max-w-2xl text-xs font-medium leading-relaxed text-muted-foreground sm:text-sm sm:leading-6">
              {storyData.subtitle}
            </p>
          </div>
        </header>

        <section className="mx-auto w-full max-w-5xl px-2 sm:px-4">
          <div
            role="tablist"
            aria-label={storyData.title}
            className="mb-4 overflow-x-auto pb-2 pt-1 no-scrollbar sm:mb-5"
          >
            <div className="flex w-full min-w-max items-center justify-center gap-2">
              {chapters.map((chapter, index) => {
                const isActive = index === currentChapterIndex
                return (
                  <button
                    key={chapter.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={storyData.chapterCount(chapter.id, totalChapters)}
                    disabled={isTransitioning}
                    onClick={() => handleChapterSelect(index)}
                    className={`min-h-11 min-w-11 rounded-full border px-4 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-wait disabled:opacity-60 ${
                      isActive
                        ? 'border-brand bg-brand text-brand-foreground'
                        : 'border-border-subtle bg-surface-raised text-muted-foreground hover:border-brand/40 hover:text-foreground'
                    }`}
                  >
                    {chapter.id}
                  </button>
                )
              })}
            </div>
          </div>

          {currentChapter ? (
            <StoryBookCard
              chapter={currentChapter}
              totalChapters={totalChapters}
              isFirstChapter={currentChapterIndex === 0}
              isLastChapter={currentChapterIndex === totalChapters - 1}
              onNext={handleNext}
              onPrev={handlePrev}
              onPlay={() => {
                triggerHaptic()
                onPlay?.()
              }}
              onBusyChange={setIsTransitioning}
              prevLabel={storyData.prevChapter}
              nextLabel={storyData.nextChapter}
              beginJourneyLabel={storyData.beginJourney}
            />
          ) : null}
        </section>
      </ScreenMain>
    </ScreenShell>
  )
}
