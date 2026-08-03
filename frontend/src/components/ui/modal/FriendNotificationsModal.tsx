import { useEffect, useState } from 'react'
import { ModalBackdrop } from '@/components/ui/ModalBackdrop'
import { FriendProfileModal } from '@/pages/lobby/components/FriendProfileModal'
import { lobbyService } from '@/services/lobby/lobby.service'
import type { Friend } from '@/services/lobby/lobby.interface'
import { IconBell, IconUserFriends, IconMegaphone } from '@/components/ui/icons'
import { useTranslation } from '@/i18n/useTranslation'

interface Props {
  visible: boolean
  onClose: () => void
  onUpdate: () => void
}

interface SystemNotification {
  id: string
  title: string
  desc: string
  time: string
  type: 'system' | 'invite'
}

const MOCK_SYSTEM_NOTIFS: SystemNotification[] = [
  {
    id: 's1',
    title: '🎮 Trận đấu 1v1',
    desc: 'Chào mừng bạn đến với hệ thống GameBoard 1v1!',
    time: 'Vừa xong',
    type: 'system',
  },
  {
    id: 's2',
    title: '🏆 Bảng xếp hạng Elo',
    desc: 'Bảng xếp hạng đã được cập nhật điểm Elo mới nhất.',
    time: '10 phút trước',
    type: 'system',
  },
]

export function FriendNotificationsModal({ visible, onClose, onUpdate }: Props) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'system' | 'requests'>('system')
  const [requests, setRequests] = useState<Friend[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProfileUser, setSelectedProfileUser] = useState<Friend | null>(null)

  useEffect(() => {
    if (visible) {
      loadData()
    }
  }, [visible])

  async function loadData() {
    setIsLoading(true)
    try {
      const reqs = await lobbyService.getIncomingFriendRequests()
      setRequests(reqs)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRespond(requesterId: string, accept: boolean) {
    const ok = await lobbyService.respondToFriendRequest(requesterId, accept)
    if (ok) {
      setRequests((prev) => prev.filter((r) => r.id !== requesterId))
      onUpdate()
    }
  }

  if (!visible) return null

  return (
    <>
      <ModalBackdrop show={visible} onClose={onClose}>
        <div
          className="w-full max-w-sm sm:max-w-md max-h-[85vh] flex flex-col overflow-hidden p-4 sm:p-5 transition-all"
          style={{
            borderRadius: 'var(--radius-2xl)',
            background: 'var(--ma-surface-raised)',
            border: '1px solid var(--ma-border)',
            boxShadow: 'var(--ma-shadow-xl)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 shrink-0" style={{ borderBottom: '1px solid var(--ma-border-subtle)' }}>
            <div className="flex items-center gap-2">
              <span style={{ color: 'var(--ma-brand)' }}>
                <IconBell width={20} height={20} />
              </span>
              <h2 className="text-[16px] sm:text-[18px] font-bold text-[var(--ma-fg)] truncate">
                {t.notificationsModal?.title || 'Trung Tâm Thông Báo'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--ma-surface)] text-[var(--ma-fg-subtle)] hover:text-[var(--ma-fg)] transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Navigation Tabs (Tab 1: System Notifications, Tab 2: Friend Requests) */}
          <div className="mt-3 flex rounded-xl p-1 gap-1 shrink-0" style={{ background: 'var(--ma-surface)', border: '1px solid var(--ma-border)' }}>
            <button
              type="button"
              onClick={() => setActiveTab('system')}
              className="flex-1 py-1.5 rounded-lg text-[12px] sm:text-[13px] font-semibold transition-all flex items-center justify-center gap-1.5"
              style={{
                background: activeTab === 'system' ? 'var(--ma-surface-raised)' : 'transparent',
                color: activeTab === 'system' ? 'var(--ma-brand)' : 'var(--ma-fg-subtle)',
                boxShadow: activeTab === 'system' ? 'var(--ma-shadow-xs)' : 'none',
              }}
            >
              <IconMegaphone width={16} height={16} />
              <span>{t.notificationsModal?.systemNotifsTab || 'Thông báo'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('requests')}
              className="flex-1 py-1.5 rounded-lg text-[12px] sm:text-[13px] font-semibold transition-all flex items-center justify-center gap-1.5"
              style={{
                background: activeTab === 'requests' ? 'var(--ma-surface-raised)' : 'transparent',
                color: activeTab === 'requests' ? 'var(--ma-brand)' : 'var(--ma-fg-subtle)',
                boxShadow: activeTab === 'requests' ? 'var(--ma-shadow-xs)' : 'none',
              }}
            >
              <IconUserFriends width={16} height={16} />
              <span>{t.notificationsModal?.friendRequestsTab || 'Lời mời kết bạn'}</span>
              {requests.length > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white bg-red-500">
                  {requests.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-3 sm:mt-4 flex-1 overflow-y-auto flex flex-col gap-2">
            {isLoading ? (
              <p className="py-8 text-center text-[12px] sm:text-[13px] text-[var(--ma-fg-subtle)]">
                {t.notificationsModal?.loading || 'Đang tải...'}
              </p>
            ) : activeTab === 'system' ? (
              MOCK_SYSTEM_NOTIFS.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-1 p-3 rounded-xl"
                  style={{ background: 'var(--ma-surface)', border: '1px solid var(--ma-border-subtle)' }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-bold text-[var(--ma-fg)]">{item.title}</p>
                    <span className="text-[10px] text-[var(--ma-fg-subtle)]">{item.time}</span>
                  </div>
                  <p className="text-[12px] text-[var(--ma-fg-muted)]">{item.desc}</p>
                </div>
              ))
            ) : requests.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center gap-2">
                <span style={{ color: 'var(--ma-fg-subtle)' }}>
                  <IconUserFriends width={28} height={28} />
                </span>
                <p className="text-[12px] sm:text-[13px] text-[var(--ma-fg-subtle)]">
                  {t.notificationsModal?.emptyRequests || 'Không có lời mời kết bạn nào đang chờ.'}
                </p>
              </div>
            ) : (
              requests.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl min-w-0"
                  style={{ background: 'var(--ma-surface)', border: '1px solid var(--ma-border-subtle)' }}
                >
                  {/* Clickable user info area */}
                  <div
                    className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer transition-opacity hover:opacity-80 active:opacity-60"
                    onClick={() => setSelectedProfileUser(user)}
                    title={t.addFriendModal?.clickProfileHint || 'Bấm để xem thông tin người chơi'}
                  >
                    <div
                      className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl font-bold text-[12px] sm:text-[13px] text-white"
                      style={{ background: 'var(--ma-brand)' }}
                    >
                      {user.name[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] sm:text-[14px] font-semibold text-[var(--ma-fg)] truncate hover:underline">{user.name}</p>
                      <p className="text-[11px] sm:text-[12px] text-[var(--ma-fg-subtle)] truncate">@{user.handle} • {user.elo} Elo</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRespond(user.id, true)}
                      className="rounded-lg px-2.5 py-1.5 text-[11px] sm:text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ background: 'var(--ma-brand)' }}
                    >
                      {t.notificationsModal?.acceptBtn || '✓ Đồng ý'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRespond(user.id, false)}
                      className="rounded-lg px-2 py-1.5 text-[11px] sm:text-[12px] font-medium transition-colors"
                      style={{ background: 'var(--ma-surface-raised)', color: 'var(--ma-fg-subtle)', border: '1px solid var(--ma-border)' }}
                    >
                      {t.notificationsModal?.declineBtn || '✕ Từ chối'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </ModalBackdrop>

      {/* User profile detail preview modal */}
      <FriendProfileModal
        friend={selectedProfileUser}
        show={!!selectedProfileUser}
        onClose={() => setSelectedProfileUser(null)}
      />
    </>
  )
}
