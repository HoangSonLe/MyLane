import { ScreenHeaderWithBack, ScreenHeaderAction } from '@/components/ui/layout'
import { IconInfoCircle } from '@/components/ui/icons'
import { useTranslation } from '@/i18n/useTranslation'

function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
        stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

export function ProfileHeader({
  skeleton,
  onBack,
  onSettings,
  onOpenScoringRules,
}: {
  skeleton?: boolean
  onBack?: () => void
  onSettings?: () => void
  onOpenScoringRules?: () => void
}) {
  const { t } = useTranslation()
  return (
    <ScreenHeaderWithBack
      skeleton={skeleton}
      onBack={onBack}
      title={t.profile.title}
      titleSkeletonWidth="4rem"
      trailing={
        <div className="flex items-center gap-1.5">
          <ScreenHeaderAction
            skeleton={skeleton}
            onClick={onOpenScoringRules}
            ariaLabel={t.scoringRulesModal?.viewFullRules || 'Thông tin tính điểm'}
            icon={<IconInfoCircle size={18} />}
          />
          <ScreenHeaderAction
            skeleton={skeleton}
            onClick={onSettings}
            ariaLabel={t.profile.settings}
            icon={<IconSettings />}
          />
        </div>
      }
    />
  )
}
