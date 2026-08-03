import { useState } from 'react'
import { ModalBackdrop } from '@/components/ui/ModalBackdrop'
import { FriendProfileModal } from '@/pages/lobby/components/FriendProfileModal'
import { lobbyService } from '@/services/lobby/lobby.service'
import type { Friend } from '@/services/lobby/lobby.interface'
import { IconSearch } from '@/components/ui/icons'
import { useTranslation } from '@/i18n/useTranslation'

interface Props {
  visible: boolean
  onClose: () => void
  onFriendAdded?: () => void
}

export function AddFriendModal({ visible, onClose, onFriendAdded }: Props) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Friend[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [selectedProfileUser, setSelectedProfileUser] = useState<Friend | null>(null)

  if (!visible) return null

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const found = await lobbyService.searchUsers(query)
      setResults(found)
    } finally {
      setIsSearching(false)
    }
  }

  async function handleAdd(friendId: string) {
    const ok = await lobbyService.addFriend(friendId)
    if (ok) {
      setAddedIds((prev) => new Set(prev).add(friendId))
      onFriendAdded?.()
    }
  }

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
                <IconSearch width={20} height={20} />
              </span>
              <h2 className="text-[16px] sm:text-[18px] font-bold text-[var(--ma-fg)] truncate">
                {t.addFriendModal?.title || 'Tìm bạn bè & Kết bạn'}
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

          {/* Search input form */}
          <form onSubmit={handleSearch} className="mt-3 sm:mt-4 flex gap-2 shrink-0">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.addFriendModal?.searchPlaceholder || 'Tên hoặc handle (vd: alex)...'}
              className="min-w-0 flex-1 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 text-[13px] sm:text-[14px] outline-none transition-colors"
              style={{
                background: 'var(--ma-surface)',
                border: '1px solid var(--ma-border)',
                color: 'var(--ma-fg)',
              }}
            />
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="shrink-0 rounded-xl px-3.5 py-2 sm:px-4 sm:py-2.5 text-[12px] sm:text-[13px] font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ background: 'var(--ma-brand)' }}
            >
              {isSearching ? (t.addFriendModal?.searching || '...') : (t.addFriendModal?.searchBtn || 'Tìm')}
            </button>
          </form>

          {/* Search Results List */}
          <div className="mt-3 sm:mt-4 flex-1 overflow-y-auto flex flex-col gap-2 pr-0.5">
            {results.length === 0 && !isSearching && (
              <p className="py-8 text-center text-[12px] sm:text-[13px] text-[var(--ma-fg-subtle)]">
                {query ? (t.addFriendModal?.noResults || 'Không tìm thấy người chơi nào.') : (t.addFriendModal?.searchPrompt || 'Nhập tên hoặc handle để tìm người chơi.')}
              </p>
            )}

            {results.map((user) => {
              const isSentJustNow = addedIds.has(user.id)
              const isPendingSent = isSentJustNow || user.friendshipStatus === 'pending_sent'
              const isAccepted = user.friendshipStatus === 'accepted'
              const isPendingReceived = user.friendshipStatus === 'pending_received'
              const isDisabled = isPendingSent || isAccepted || isPendingReceived

              let btnText = t.addFriendModal?.addBtn || '+ Kết bạn'
              if (isAccepted) btnText = t.addFriendModal?.friendsStatus || '✓ Bạn bè'
              else if (isPendingSent) btnText = t.addFriendModal?.pendingSent || '⏳ Đang chờ xác nhận'
              else if (isPendingReceived) btnText = t.addFriendModal?.pendingReceived || '📩 Đã gửi lời mời'

              return (
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

                  {/* Add friend button */}
                  <button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleAdd(user.id)}
                    className="shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] sm:text-[12px] font-medium transition-all"
                    style={{
                      background: isDisabled ? 'var(--ma-surface-raised)' : 'var(--ma-brand)',
                      color: isDisabled ? 'var(--ma-fg-subtle)' : '#fff',
                      border: isDisabled ? '1px solid var(--ma-border)' : 'none',
                    }}
                  >
                    {btnText}
                  </button>
                </div>
              )
            })}
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
