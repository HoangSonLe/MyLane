import { IconDoorOpen, IconPlusCircle } from '@/components/ui/icons'

export function EmptyChoiceView({
  activeTab,
  onSetTab,
}: {
  activeTab: 'create' | 'join'
  onSetTab: (t: 'create' | 'join') => void
}) {
  return (
    <div className="flex gap-2 px-4">
      <button
        type="button"
        onClick={() => onSetTab('create')}
        aria-pressed={activeTab === 'create'}
        className={[
          'flex flex-1 items-center justify-center gap-2 py-2.5',
          'text-[13px] font-semibold',
          'transition-all duration-[var(--ma-duration-micro)] active:scale-95',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
        ].join(' ')}
        style={{
          borderRadius: 'var(--radius-xl)',
          background: activeTab === 'create' ? 'var(--ma-active)' : 'var(--ma-surface-raised)',
          border: `1px solid ${activeTab === 'create' ? 'var(--ma-active)' : 'var(--ma-border)'}`,
          color: activeTab === 'create' ? '#fff' : 'var(--ma-fg-muted)',
        }}
      >
        <IconPlusCircle />
        Create
      </button>
      <button
        type="button"
        onClick={() => onSetTab('join')}
        aria-pressed={activeTab === 'join'}
        className={[
          'flex flex-1 items-center justify-center gap-2 py-2.5',
          'text-[13px] font-semibold',
          'transition-all duration-[var(--ma-duration-micro)] active:scale-95',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
        ].join(' ')}
        style={{
          borderRadius: 'var(--radius-xl)',
          background: activeTab === 'join' ? 'var(--ma-active)' : 'var(--ma-surface-raised)',
          border: `1px solid ${activeTab === 'join' ? 'var(--ma-active)' : 'var(--ma-border)'}`,
          color: activeTab === 'join' ? '#fff' : 'var(--ma-fg-muted)',
        }}
      >
        <IconDoorOpen />
        Join
      </button>
    </div>
  )
}
