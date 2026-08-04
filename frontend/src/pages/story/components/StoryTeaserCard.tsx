import { useTranslation } from '@/i18n/useTranslation'

export function StoryTeaserCard({ onOpen }: { onOpen?: () => void }) {
  const { t } = useTranslation()

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group mx-4 grid min-h-28 grid-cols-[minmax(0,1fr)_6.5rem] overflow-hidden rounded-3xl border border-border-subtle bg-surface-raised text-left shadow-sm transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transform-none"
    >
      <span className="flex min-w-0 flex-col justify-center p-4">
        <span className="text-[10px] font-bold tracking-[0.16em] text-brand">
          {t.story.eyebrow}
        </span>
        <span className="mt-1 text-base font-bold leading-tight text-foreground">
          {t.story.title}
        </span>
        <span className="mt-2 text-xs font-semibold text-brand">
          {t.story.readStory} <span aria-hidden="true">→</span>
        </span>
      </span>

      <span className="relative h-full min-h-28 overflow-hidden" aria-hidden="true">
        <img
          src="/story/brain-reset-v2-01.png"
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transform-none"
        />
        <span className="absolute inset-0 bg-gradient-to-r from-surface-raised/40 to-transparent" />
      </span>
    </button>
  )
}
