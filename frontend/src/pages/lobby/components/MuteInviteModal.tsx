import { useState } from 'react'
import { useTranslation } from '@/i18n/useTranslation'
import { ModalBackdrop } from '@/components/ui/ModalBackdrop'
import type { MuteDurationOption } from '@/stores/invite-mute.store'

interface MuteInviteModalProps {
  inviterName: string
  inviterHandle: string
  show: boolean
  onClose: () => void
  onConfirmMute: (inviterHandle: string, option: MuteDurationOption, durationLabel: string) => void
  className?: string
}

function IconBellOff() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13.73 21a2 2 0 01-3.46 0M18.63 13A17.89 17.89 0 0118 8M6.26 6.26A5.86 5.86 0 006 8c0 7-3 9-3 9h14M1 1l22 22" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function MuteInviteModal({
  inviterName,
  inviterHandle,
  show,
  onClose,
  onConfirmMute,
  className = 'z-[85]',
}: MuteInviteModalProps) {
  const { t } = useTranslation()
  const [selectedOption, setSelectedOption] = useState<MuteDurationOption>('15m')

  if (!show) return null

  const options: { id: MuteDurationOption; label: string }[] = [
    { id: '5m', label: t.lobby.mute5m },
    { id: '15m', label: t.lobby.mute15m },
    { id: '30m', label: t.lobby.mute30m },
    { id: 'session', label: t.lobby.muteSession },
  ]

  const handleConfirm = () => {
    const selectedLabel = options.find((o) => o.id === selectedOption)?.label ?? ''
    onConfirmMute(inviterHandle, selectedOption, selectedLabel)
    onClose()
  }

  return (
    <ModalBackdrop show={show} onClose={onClose} className={className}>
      <div
        className="flex w-full max-w-xs flex-col items-center gap-4 rounded-3xl p-6 text-center shadow-2xl"
        style={{
          background: 'var(--ma-surface)',
          border: '1px solid var(--ma-border)',
        }}
      >
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{
            background: 'oklch(0.62 0.19 22 / 0.10)',
            color: 'var(--ma-danger)',
          }}
        >
          <IconBellOff />
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-[16px] font-bold" style={{ color: 'var(--ma-fg)' }}>
            {t.lobby.muteTitle}
          </h3>
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--ma-fg-muted)' }}>
            {t.lobby.muteDesc(inviterName)}
          </p>
        </div>

        {/* Options grid */}
        <div className="grid grid-cols-2 gap-2 w-full mt-1">
          {options.map((opt) => {
            const isSelected = selectedOption === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedOption(opt.id)}
                className="flex items-center justify-center rounded-xl py-2.5 text-[12px] font-semibold transition-all"
                style={{
                  background: isSelected ? 'var(--ma-active)' : 'var(--ma-surface-raised)',
                  border: `1px solid ${isSelected ? 'var(--ma-active)' : 'var(--ma-border)'}`,
                  color: isSelected ? '#fff' : 'var(--ma-fg-muted)',
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex w-full gap-2.5 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex flex-1 items-center justify-center rounded-xl py-2.5 text-[13px] font-semibold transition-transform active:scale-95"
            style={{
              background: 'var(--ma-surface-raised)',
              border: '1px solid var(--ma-border)',
              color: 'var(--ma-fg)',
            }}
          >
            {t.common.close}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex flex-1 items-center justify-center rounded-xl py-2.5 text-[13px] font-semibold transition-transform active:scale-95"
            style={{
              background: 'oklch(0.62 0.19 22 / 0.10)',
              border: '1px solid oklch(0.62 0.19 22 / 0.25)',
              color: 'var(--ma-danger)',
            }}
          >
            {t.lobby.confirmMute}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  )
}
