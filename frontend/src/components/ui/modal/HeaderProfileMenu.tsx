import { useEffect, useRef } from 'react'
import { IconUser, IconBell, IconSearch, IconSettings, IconLogOut } from '@/components/ui/icons'
import { useTranslation } from '@/i18n/useTranslation'

interface Props {
  visible: boolean
  unreadCount: number
  isGuest: boolean
  onClose: () => void
  onNavigateProfile: () => void
  onAddFriend: () => void
  onNotifications: () => void
  onNavigateSettings?: () => void
  onLogOut?: () => void
}

export function HeaderProfileMenu({
  visible,
  unreadCount,
  isGuest,
  onClose,
  onNavigateProfile,
  onAddFriend,
  onNotifications,
  onNavigateSettings,
  onLogOut,
}: Props) {
  const { t } = useTranslation()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (visible) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [visible, onClose])

  if (!visible) return null

  return (
    <div
      ref={menuRef}
      className="absolute top-14 right-4 z-50 w-56 overflow-hidden rounded-2xl p-1.5 shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-150"
      style={{
        background: 'var(--ma-surface-raised)',
        border: '1px solid var(--ma-border)',
        boxShadow: 'var(--ma-shadow-xl)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div className="flex flex-col gap-0.5">
        {/* 1. Profile */}
        <button
          type="button"
          onClick={() => {
            onClose()
            onNavigateProfile()
          }}
          className="flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-semibold text-[var(--ma-fg)] transition-colors hover:bg-[var(--ma-surface)]"
        >
          <div className="flex items-center gap-2.5">
            <span style={{ color: 'var(--ma-brand)' }}>
              <IconUser />
            </span>
            <span>{t.headerMenu?.profile || 'Hồ sơ cá nhân'}</span>
          </div>
        </button>

        {!isGuest && (
          <>
            {/* 2. Notifications Center */}
            <button
              type="button"
              onClick={() => {
                onClose()
                onNotifications()
              }}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-semibold text-[var(--ma-fg)] transition-colors hover:bg-[var(--ma-surface)]"
            >
              <div className="flex items-center gap-2.5">
                <span style={{ color: 'var(--ma-brand)' }}>
                  <IconBell width={18} height={18} />
                </span>
                <span>{t.headerMenu?.notifications || 'Thông báo'}</span>
              </div>
              {unreadCount > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* 3. Find & Add Friends */}
            <button
              type="button"
              onClick={() => {
                onClose()
                onAddFriend()
              }}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-semibold text-[var(--ma-fg)] transition-colors hover:bg-[var(--ma-surface)]"
            >
              <div className="flex items-center gap-2.5">
                <span style={{ color: 'var(--ma-brand)' }}>
                  <IconSearch width={18} height={18} />
                </span>
                <span>{t.headerMenu?.findFriends || 'Tìm & Kết bạn'}</span>
              </div>
            </button>
          </>
        )}

        {/* 4. Settings */}
        {onNavigateSettings && (
          <button
            type="button"
            onClick={() => {
              onClose()
              onNavigateSettings()
            }}
            className="flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-semibold text-[var(--ma-fg)] transition-colors hover:bg-[var(--ma-surface)]"
          >
            <div className="flex items-center gap-2.5">
              <span style={{ color: 'var(--ma-fg-subtle)' }}>
                <IconSettings width={18} height={18} />
              </span>
              <span>{t.headerMenu?.settings || 'Cài đặt'}</span>
            </div>
          </button>
        )}

        {/* 5. Logout */}
        {onLogOut && (
          <>
            <div className="my-1 h-[1px] bg-[var(--ma-border)]" aria-hidden="true" />
            <button
              type="button"
              onClick={() => {
                onClose()
                onLogOut()
              }}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-semibold text-[var(--ma-danger)] transition-colors hover:bg-[oklch(0.62_0.19_22/0.1)]"
            >
              <div className="flex items-center gap-2.5">
                <span>
                  <IconLogOut width={18} height={18} />
                </span>
                <span>{t.settings?.logOut || 'Đăng xuất'}</span>
              </div>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
