function IconWifi() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12.55a11 11 0 0114.08 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1.42 9a16 16 0 0121.16 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.53 16.11a6 6 0 016.95 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="20" x2="12.01" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

import { useTranslation } from '@/i18n/useTranslation'

export function OfflineNotice() {
  const { t } = useTranslation()
  return (
    <div
      className="mx-4 flex items-start gap-3 rounded-[var(--radius-xl)] px-4 py-3"
      style={{
        background: 'oklch(0.58 0.11 230 / 0.08)',
        border: '1px solid oklch(0.58 0.11 230 / 0.18)',
      }}
      role="status"
    >
      <span className="mt-0.5 shrink-0" style={{ color: 'var(--ma-active)' }}>
        <IconWifi />
      </span>
      <p className="text-[13px] leading-relaxed" style={{ color: 'var(--ma-fg-muted)' }}>
        {t.leaderboard.offlineNotice}
      </p>
    </div>
  )
}
