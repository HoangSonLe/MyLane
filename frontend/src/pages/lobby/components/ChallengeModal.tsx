import { useCallback, useEffect, useRef, useState } from 'react'
import { ModalBackdrop } from '@/components/ui/ModalBackdrop'
import { matchInviteService } from '@/services/match-invite/match-invite.service'
import { GameId } from '@/configs/enum'
import type { Friend } from '@/services/lobby/lobby.interface'
import {
  IconSwords,
  IconCheck,
  IconCategoryNumber,
  IconCategoryAlphabet,
  IconCategoryGrid,
  IconCategorySequence,
  IconCategoryColor,
  IconDiffEasy,
  IconDiffMedium,
  IconDiffHard,
  IconDiffSuperHard,
  IconTrophy16,
  IconTarget16,
} from '@/components/ui/icons'
import { useTranslation } from '@/i18n/useTranslation'

interface Props {
  friend: Friend | null
  show: boolean
  onClose: () => void
  onAccepted: (roomCode: string) => void
}

const CATEGORY_OPTIONS = [
  { id: GameId.NUMBER, iconComponent: IconCategoryNumber, label: 'Number Memory', desc: 'Nhớ chuỗi chữ số ngẫu nhiên' },
  { id: GameId.ALPHABET, iconComponent: IconCategoryAlphabet, label: 'Alphabet Memory', desc: 'Nhớ chuỗi chữ cái xuất hiện nhanh' },
  { id: GameId.GRID, iconComponent: IconCategoryGrid, label: 'Grid Memory', desc: 'Nhớ vị trí ma trận lưới phát sáng' },
  { id: GameId.SEQUENCE, iconComponent: IconCategorySequence, label: 'Sequence Memory', desc: 'Nhớ thứ tự phím sáng nhịp điệu' },
  { id: GameId.COLOR, iconComponent: IconCategoryColor, label: 'Color Memory', desc: 'Nhớ chuỗi màu sắc và điểm khác biệt' },
]

export function ChallengeModal({ friend, show, onClose, onAccepted }: Props) {
  const { t } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState<GameId>(GameId.NUMBER)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('medium')
  const [selectedMode, setSelectedMode] = useState<string>('versus_ranked')
  const [isSending, setIsSending] = useState(false)
  const [inviteState, setInviteState] = useState<{ inviteId: string; roomCode: string } | null>(null)
  const [countdown, setCountdown] = useState(30)
  const [declineReason, setDeclineReason] = useState<string | null>(null)
  const onAcceptedRef = useRef(onAccepted)
  const onCloseRef = useRef(onClose)

  useEffect(() => { onAcceptedRef.current = onAccepted }, [onAccepted])
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  const handleCancel = useCallback(async () => {
    if (inviteState) {
      await matchInviteService.cancelChallengeInvite(inviteState.inviteId, inviteState.roomCode)
      setInviteState(null)
    }
    onCloseRef.current()
  }, [inviteState])

  const DIFFICULTY_OPTIONS = [
    { id: 'easy', icon: IconDiffEasy, label: t.challenge?.easy || 'Dễ', color: 'var(--ma-success)' },
    { id: 'medium', icon: IconDiffMedium, label: t.challenge?.medium || 'Trung Bình', color: 'var(--ma-brand)' },
    { id: 'hard', icon: IconDiffHard, label: t.challenge?.hard || 'Khó', color: 'var(--ma-danger)' },
    { id: 'super_hard', icon: IconDiffSuperHard, label: t.challenge?.superHard || 'Siêu Khó', color: '#f59e0b' },
  ]

  const MODE_OPTIONS = [
    { id: 'versus_ranked', label: t.challenge?.rankedMode || '🏆 Đấu Xếp Hạng (+/- Elo)' },
    { id: 'versus_unranked', label: t.challenge?.unrankedMode || '🎯 Đấu Thường (Luyện tập)' },
  ]

  // 30s Countdown timer when waiting for opponent
  useEffect(() => {
    if (!inviteState) return
    setCountdown(30)
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          handleCancel()
          setDeclineReason(t.challenge?.inviteTimeout || 'Lời mời thách đấu đã hết thời gian chờ (30s).')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [handleCancel, inviteState, t.challenge?.inviteTimeout])

  // Realtime subscription & 2s Polling for challenger waiting for opponent's response
  useEffect(() => {
    if (!inviteState?.inviteId) return

    const handleResponse = (status: string, roomCode: string) => {
      if (status === 'accepted') {
        onAcceptedRef.current(roomCode)
        onCloseRef.current()
      } else if (status === 'declined') {
        setInviteState(null)
        const opponentName = friend?.name || 'Opponent'
        setDeclineReason(
          t.challenge?.inviteDeclined
            ? t.challenge.inviteDeclined(opponentName)
            : `${opponentName} đã từ chối lời mời thách đấu.`
        )
      } else if (status === 'expired') {
        setInviteState(null)
        setDeclineReason(t.challenge?.inviteTimeout || 'Lời mời thách đấu đã hết thời gian chờ (30s).')
      }
    }

    // 1. Realtime listener
    const unsubscribe = matchInviteService.subscribeToInviteResponse(
      inviteState.inviteId,
      (status, roomCode) => handleResponse(status, roomCode)
    )

    // 2. Active 2-second fast polling backup
    const pollInterval = setInterval(() => {
      void matchInviteService.checkInviteStatus(inviteState.inviteId)
        .then((resp) => {
          if (resp && resp.status !== 'pending') handleResponse(resp.status, resp.roomCode)
        })
        .catch(() => {})
    }, 2000)

    return () => {
      unsubscribe()
      clearInterval(pollInterval)
    }
  }, [friend, inviteState, t.challenge])

  if (!show || !friend) return null

  const handleSendInvite = async () => {
    setIsSending(true)
    setDeclineReason(null)
    try {
      const result = await matchInviteService.sendChallengeInvite(
        friend.id,
        selectedCategory,
        selectedDifficulty,
        selectedMode
      )
      setInviteState(result)
    } catch {
      setDeclineReason(t.challenge?.inviteFailed || 'Không thể gửi lời mời thách đấu. Vui lòng thử lại.')
    } finally {
      setIsSending(false)
    }
  }

  const activeCategoryMeta = CATEGORY_OPTIONS.find((c) => c.id === selectedCategory)

  return (
    <ModalBackdrop show={show} onClose={inviteState ? undefined : handleCancel}>
      <div
        className="w-full max-w-sm sm:max-w-md max-h-[85vh] flex flex-col overflow-hidden p-4 sm:p-5 transition-all animate-in fade-in zoom-in-95 duration-200"
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
          <div className="flex items-center gap-2" style={{ color: 'var(--ma-brand)' }}>
            <IconSwords />
            <h3 className="text-[16px] font-bold text-[var(--ma-fg)]">
              {t.challenge?.setupTitle || 'Cài Đặt & Thách Đấu 1v1'}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ma-surface)] text-[var(--ma-fg-subtle)] hover:text-[var(--ma-fg)] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Target Friend Card */}
        <div
          className="mt-3 flex items-center gap-3 p-2.5 rounded-xl shrink-0"
          style={{ background: 'var(--ma-surface)', border: '1px solid var(--ma-border-subtle)' }}
        >
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl font-bold text-white shadow-sm"
            style={{ background: 'var(--ma-brand)' }}
          >
            {friend.name[0]?.toUpperCase() || 'F'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-[var(--ma-fg)] truncate">{friend.name}</p>
            <p className="text-[11px] text-[var(--ma-fg-subtle)]">@{friend.handle} • {friend.elo} Elo</p>
          </div>
        </div>

        {/* Decline alert notification */}
        {declineReason && (
          <div className="mt-2 p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] font-medium text-center">
            {declineReason}
          </div>
        )}

        {/* State A: Selecting Game Configuration & Sending */}
        {!inviteState ? (
          <div className="mt-3 flex-1 overflow-y-auto flex flex-col gap-3 pr-0.5">
            {/* 1. Select Game Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[var(--ma-fg-subtle)]">
                {t.challenge?.selectCategory || '1. Chọn môn thi đấu:'}
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {CATEGORY_OPTIONS.map((cat) => {
                  const isSelected = selectedCategory === cat.id
                  const IconComp = cat.iconComponent
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className="flex items-center gap-2.5 text-left rounded-xl px-3 py-2 text-[12px] font-semibold transition-all"
                      style={{
                        background: isSelected ? 'var(--ma-brand-soft)' : 'var(--ma-surface)',
                        border: isSelected ? '1.5px solid var(--ma-brand)' : '1px solid var(--ma-border-subtle)',
                        color: isSelected ? 'var(--ma-brand)' : 'var(--ma-fg)',
                      }}
                    >
                      {/* Selection Radio Circle */}
                      <span
                        className="shrink-0 flex h-4 w-4 items-center justify-center rounded-full transition-all"
                        style={{
                          border: `2px solid ${isSelected ? 'var(--ma-brand)' : 'var(--ma-border)'}`,
                          background: isSelected ? 'var(--ma-brand)' : 'transparent',
                          color: '#fff',
                        }}
                      >
                        {isSelected && <IconCheck />}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 font-bold">
                          <span style={{ color: isSelected ? 'var(--ma-brand)' : 'var(--ma-fg-subtle)' }}>
                            <IconComp width={16} height={16} />
                          </span>
                          <span>{cat.label}</span>
                        </div>
                        <p className="text-[10px] font-normal opacity-80 mt-0.5 truncate">{cat.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 2. Select Difficulty */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[var(--ma-fg-subtle)]">
                {t.challenge?.selectDifficulty || '2. Chọn độ khó:'}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {DIFFICULTY_OPTIONS.map((diff) => {
                  const isSelected = selectedDifficulty === diff.id
                  const DiffIcon = diff.icon
                  return (
                    <button
                      key={diff.id}
                      type="button"
                      onClick={() => setSelectedDifficulty(diff.id)}
                      className="rounded-xl px-3 py-2 text-[12px] font-semibold transition-all flex items-center justify-center gap-1.5"
                      style={{
                        background: isSelected ? 'var(--ma-brand-soft)' : 'var(--ma-surface)',
                        border: isSelected ? '1.5px solid var(--ma-brand)' : '1px solid var(--ma-border-subtle)',
                        color: isSelected ? 'var(--ma-brand)' : 'var(--ma-fg)',
                      }}
                    >
                      <span style={{ color: diff.color }}>
                        <DiffIcon width={14} height={14} />
                      </span>
                      <span>{diff.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 3. Select Mode */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[var(--ma-fg-subtle)]">
                {t.challenge?.selectMode || '3. Chế độ thi đấu:'}
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {MODE_OPTIONS.map((mode) => {
                  const isSelected = selectedMode === mode.id
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setSelectedMode(mode.id)}
                      className="rounded-xl px-3 py-2 text-[12px] font-semibold transition-all text-left flex items-center gap-2.5"
                      style={{
                        background: isSelected ? 'var(--ma-brand-soft)' : 'var(--ma-surface)',
                        border: isSelected ? '1.5px solid var(--ma-brand)' : '1px solid var(--ma-border-subtle)',
                        color: isSelected ? 'var(--ma-brand)' : 'var(--ma-fg)',
                      }}
                    >
                      {/* Selection Radio Circle */}
                      <span
                        className="shrink-0 flex h-4 w-4 items-center justify-center rounded-full transition-all"
                        style={{
                          border: `2px solid ${isSelected ? 'var(--ma-brand)' : 'var(--ma-border)'}`,
                          background: isSelected ? 'var(--ma-brand)' : 'transparent',
                          color: '#fff',
                        }}
                      >
                        {isSelected && <IconCheck />}
                      </span>
                      <span>{mode.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Summary preview */}
            <div className="p-2.5 rounded-xl text-[11px]" style={{ background: 'var(--ma-surface)', border: '1px solid var(--ma-border-subtle)', color: 'var(--ma-fg-muted)' }}>
              {t.challenge?.challengeSummary
                ? t.challenge.challengeSummary(friend.name, activeCategoryMeta?.label || '', selectedDifficulty.toUpperCase())
                : `🎯 Bạn sẽ thách đấu ${friend.name} môn ${activeCategoryMeta?.label} (${selectedDifficulty.toUpperCase()}).`}
            </div>

            <div className="mt-2 flex gap-2 shrink-0 pb-1">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 rounded-xl py-2.5 text-[13px] font-semibold transition-colors"
                style={{ background: 'var(--ma-surface)', border: '1px solid var(--ma-border)', color: 'var(--ma-fg-subtle)' }}
              >
                {t.challenge?.cancel || 'Hủy'}
              </button>
              <button
                type="button"
                disabled={isSending}
                onClick={handleSendInvite}
                className="flex-1 rounded-xl py-2.5 text-[13px] font-bold text-white transition-opacity disabled:opacity-50 flex items-center justify-center gap-1.5"
                style={{ background: 'var(--ma-brand)' }}
              >
                <IconSwords className="w-4 h-4" />
                <span>{isSending ? (t.challenge?.sending || 'Đang gửi...') : (t.challenge?.sendInvite?.replace('⚔️ ', '') || 'Gửi Lời Mời')}</span>
              </button>
            </div>
          </div>
        ) : (
          /* State B: Waiting for opponent response with 30s countdown */
          <div className="mt-4 flex flex-col items-center gap-3 py-6 text-center">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[var(--ma-brand-soft)] text-[var(--ma-brand)] text-[20px]">
              <span className="animate-spin">⏳</span>
            </div>
            <div>
              <p className="text-[14px] font-bold text-[var(--ma-fg)]">
                {t.challenge?.waitingOpponent ? t.challenge.waitingOpponent(friend.name) : `Đang chờ ${friend.name} chấp nhận...`}
              </p>
              <p className="text-[12px] text-[var(--ma-fg-subtle)] mt-1">
                {t.challenge?.timeRemaining || 'Thời gian chờ còn lại:'} <span className="font-bold text-[var(--ma-brand)]">{countdown}s</span>
              </p>
            </div>

            <button
              type="button"
              onClick={handleCancel}
              className="mt-3 rounded-xl px-5 py-2 text-[12px] font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors"
            >
              {t.challenge?.cancelInvite || 'Hủy Lời Mời'}
            </button>
          </div>
        )}
      </div>
    </ModalBackdrop>
  )
}
