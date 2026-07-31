interface NavItem {
  id: string
  label: string
  icon: (active: boolean) => React.ReactNode
}

const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 12L12 3l9 9"
          stroke="currentColor"
          strokeWidth={active ? '2' : '1.75'}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9"
          stroke="currentColor"
          strokeWidth={active ? '2' : '1.75'}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'play',
    label: 'Play',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle
          cx="12" cy="12" r="9"
          stroke="currentColor"
          strokeWidth={active ? '2' : '1.75'}
        />
        <path
          d="M10 8.5l5 3.5-5 3.5V8.5z"
          fill="currentColor"
          strokeWidth="0"
        />
      </svg>
    ),
  },
  {
    id: 'stats',
    label: 'Stats',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="14" width="4" height="6" rx="1"
          stroke="currentColor" strokeWidth={active ? '2' : '1.75'}
        />
        <rect x="10" y="9" width="4" height="11" rx="1"
          stroke="currentColor" strokeWidth={active ? '2' : '1.75'}
        />
        <rect x="16" y="4" width="4" height="16" rx="1"
          stroke="currentColor" strokeWidth={active ? '2' : '1.75'}
        />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="3"
          stroke="currentColor" strokeWidth={active ? '2' : '1.75'}
        />
        <path
          d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
          stroke="currentColor"
          strokeWidth={active ? '2' : '1.75'}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
]

interface BottomNavBarProps {
  active?: string
  onNavigate?: (id: string) => void
}

export function BottomNavBar({ active = 'settings', onNavigate }: BottomNavBarProps) {
  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-1/2 w-full max-w-sm -translate-x-1/2"
      style={{
        background: 'var(--ma-surface)',
        borderTop: '1px solid var(--ma-border-subtle)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = item.id === active
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate?.(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={[
                'flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 rounded-xl',
                'transition-colors duration-[var(--ma-duration-micro)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
                isActive
                  ? 'text-[var(--ma-fg)]'
                  : 'text-[var(--ma-fg-subtle)]',
              ].join(' ')}
            >
              <span
                className={[
                  'mb-0.5 h-1.5 w-1.5 rounded-full transition-all duration-[var(--ma-duration-base)]',
                  isActive
                    ? 'bg-[var(--ma-brand)] opacity-100 scale-100'
                    : 'bg-transparent opacity-0 scale-50',
                ].join(' ')}
                aria-hidden="true"
              />
              {item.icon(isActive)}
              <span
                className={[
                  'text-[10px] leading-none tracking-wide transition-all duration-[var(--ma-duration-micro)]',
                  isActive ? 'font-semibold text-[var(--ma-fg)]' : 'font-medium',
                ].join(' ')}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
