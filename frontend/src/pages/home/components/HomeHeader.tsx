import { IconUser } from '@/components/ui/icons'
import { ScreenHeader, ScreenHeaderAction } from '@/components/ui/layout'

interface HomeHeaderProps {
  skeleton?: boolean
  isGuest: boolean
  onProfile?: () => void
}

export function HomeHeader({ skeleton, isGuest, onProfile }: HomeHeaderProps) {
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <ScreenHeader>
      {/* Greeting */}
      {skeleton ? (
        <div className="flex flex-col gap-2">
          <div className="skeleton" style={{ height: '1.125rem', width: '7rem', borderRadius: 'var(--radius-sm)' }} />
          <div className="skeleton" style={{ height: '1.5rem', width: '10rem', borderRadius: 'var(--radius-sm)' }} />
        </div>
      ) : (
        <div>
          <p className="text-[12px] font-medium" style={{ color: 'var(--ma-fg-muted)' }}>
            {greeting}
          </p>
          <h1 className="text-[20px] font-bold leading-tight" style={{ color: 'var(--ma-fg)' }}>
            {isGuest ? 'Guest' : 'Alex'}
          </h1>
        </div>
      )}

      {/* Avatar chip */}
      <ScreenHeaderAction
        skeleton={skeleton}
        onClick={onProfile}
        ariaLabel="Go to profile"
        icon={
          <span aria-hidden="true" style={{ color: 'var(--ma-fg-muted)' }}>
            <IconUser />
          </span>
        }
      />
    </ScreenHeader>
  )
}
