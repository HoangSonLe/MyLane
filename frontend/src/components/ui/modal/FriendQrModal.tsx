import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

import { ModalBackdrop } from '@/components/ui/ModalBackdrop'
import { SegmentedControl } from '@/components/ui/controls'
import { useTranslation } from '@/i18n/useTranslation'
import { createFriendLink, parseFriendCode } from '@/lib/utils/friend-code'
import { lobbyService } from '@/services/lobby/lobby.service'
import type { Friend } from '@/services/lobby/lobby.interface'
import { useAuthStore } from '@/stores/auth.store'

type FriendQrTab = 'scan' | 'mine'

interface ScannerHandle {
  start: () => Promise<void>
  stop: () => void
  destroy: () => void
}

function IconQr() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM15 14h2v2h-2zM19 14h2v4h-4v3h-3v-3M19 20h2v1h-2z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  )
}

export function FriendQrModal({
  visible,
  initialTab = 'scan',
  initialCode,
  onClose,
  onFriendAdded,
}: {
  visible: boolean
  initialTab?: FriendQrTab
  initialCode?: string
  onClose: () => void
  onFriendAdded?: () => void
}) {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<ScannerHandle | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<FriendQrTab>(initialTab)
  const [scanNonce, setScanNonce] = useState(0)
  const [cameraError, setCameraError] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [friend, setFriend] = useState<Friend | null>(null)
  const [isResolving, setIsResolving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [copied, setCopied] = useState(false)
  const [initialCodeConsumed, setInitialCodeConsumed] = useState(!initialCode)

  const ownLink = useMemo(() => user?.id ? createFriendLink(user.id) : '', [user?.id])

  const resolvePayload = useCallback(async (payload: string) => {
    const friendId = parseFriendCode(payload)
    if (!friendId) {
      setMessage(t.friendQr.invalidCode)
      return
    }
    if (friendId === user?.id) {
      setMessage(t.friendQr.selfCode)
      return
    }

    scannerRef.current?.stop()
    setIsResolving(true)
    setMessage(null)
    setFriend(null)
    try {
      const resolved = await lobbyService.getFriendById(friendId)
      if (!resolved) setMessage(t.friendQr.notFound)
      else setFriend(resolved)
    } catch {
      setMessage(t.friendQr.notFound)
    } finally {
      setIsResolving(false)
    }
  }, [t, user?.id])

  useEffect(() => {
    if (!visible) return
    setTab(initialTab)
    setMessage(null)
    setFriend(null)
    setCopied(false)
    setInitialCodeConsumed(!initialCode)
  }, [initialCode, initialTab, visible])

  useEffect(() => {
    if (!visible || !initialCode || initialCodeConsumed) return
    setTab('scan')
    setInitialCodeConsumed(true)
    void resolvePayload(initialCode)
  }, [initialCode, initialCodeConsumed, resolvePayload, visible])

  useEffect(() => {
    if (!visible || tab !== 'scan' || !initialCodeConsumed || friend || isResolving) return
    let disposed = false
    let scanner: ScannerHandle | null = null
    setCameraError(false)

    void import('qr-scanner')
      .then(async ({ default: QrScanner }) => {
        if (disposed || !videoRef.current) return
        scanner = new QrScanner(
          videoRef.current,
          (result) => void resolvePayload(result.data),
          {
            preferredCamera: 'environment',
            highlightScanRegion: true,
            highlightCodeOutline: true,
            returnDetailedScanResult: true,
          },
        )
        scannerRef.current = scanner
        await scanner.start()
      })
      .catch(() => {
        if (!disposed) setCameraError(true)
      })

    return () => {
      disposed = true
      scanner?.stop()
      scanner?.destroy()
      if (scannerRef.current === scanner) scannerRef.current = null
    }
  }, [friend, initialCodeConsumed, isResolving, resolvePayload, scanNonce, tab, visible])

  async function scanImage(file?: File) {
    if (!file) return
    setMessage(null)
    try {
      const { default: QrScanner } = await import('qr-scanner')
      const result = await QrScanner.scanImage(file, { returnDetailedScanResult: true })
      await resolvePayload(result.data)
    } catch {
      setMessage(t.friendQr.invalidCode)
    }
  }

  async function addFriend() {
    if (!friend || isSending) return
    setIsSending(true)
    try {
      const ok = await lobbyService.addFriend(friend.id)
      if (!ok) {
        setMessage(t.friendQr.sendError)
        return
      }
      setFriend({ ...friend, friendshipStatus: 'pending_sent' })
      onFriendAdded?.()
    } finally {
      setIsSending(false)
    }
  }

  function scanAgain() {
    setFriend(null)
    setMessage(null)
    setScanNonce((value) => value + 1)
  }

  if (!visible) return null

  const friendshipLabel = friend?.friendshipStatus === 'accepted'
    ? t.friendQr.alreadyFriends
    : friend?.friendshipStatus === 'pending_sent'
      ? t.friendQr.pendingSent
      : friend?.friendshipStatus === 'pending_received'
        ? t.friendQr.pendingReceived
        : null

  return (
    <ModalBackdrop show={visible} onClose={onClose} className="z-[80]">
      <div
        className="flex max-h-[90vh] w-full max-w-sm flex-col overflow-hidden rounded-[var(--radius-2xl)]"
        style={{ background: 'var(--ma-surface)', border: '1px solid var(--ma-border)', boxShadow: 'var(--ma-shadow-xl)' }}
      >
        <div className="flex items-center justify-between border-b border-[var(--ma-border-subtle)] px-4 py-3.5">
          <div className="flex items-center gap-2 text-[var(--ma-brand)]">
            <IconQr />
            <h2 className="text-[16px] font-bold text-[var(--ma-fg)]">{t.friendQr.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--ma-surface-raised)] text-[var(--ma-fg-muted)]" aria-label={t.common.close}>×</button>
        </div>

        <SegmentedControl
          options={[
            { id: 'scan', label: t.friendQr.scanTab },
            { id: 'mine', label: t.friendQr.myCodeTab },
          ]}
          value={tab}
          onChange={(next) => {
            setTab(next)
            setFriend(null)
            setMessage(null)
          }}
          ariaLabel={t.friendQr.title}
          className="py-3"
        />

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {tab === 'mine' ? (
            <div className="flex flex-col items-center gap-4 py-2 text-center">
              <div className="rounded-3xl bg-white p-4 shadow-sm">
                <QRCodeSVG value={ownLink} size={210} level="M" marginSize={2} title={t.friendQr.mineTitle} />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-[var(--ma-fg)]">{t.friendQr.mineTitle}</h3>
                <p className="mt-1 text-[12px] leading-relaxed text-[var(--ma-fg-subtle)]">{t.friendQr.mineDesc}</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(ownLink)
                  setCopied(true)
                }}
                className="h-11 w-full rounded-[var(--radius-xl)] bg-[var(--ma-brand)] px-4 text-[13px] font-semibold text-[var(--ma-brand-fg)] active:scale-[0.98]"
              >
                {copied ? t.friendQr.copied : t.friendQr.copyLink}
              </button>
            </div>
          ) : friend ? (
            <div className="flex flex-col gap-4 py-2">
              <div className="flex items-center gap-3 rounded-2xl bg-[var(--ma-surface-raised)] p-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[var(--ma-brand)] text-[18px] font-bold text-white">
                  {friend.avatarUrl ? <img src={friend.avatarUrl} alt="" className="h-full w-full object-cover" /> : friend.name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold text-[var(--ma-fg)]">{friend.name}</p>
                  <p className="truncate text-[12px] text-[var(--ma-fg-subtle)]">@{friend.handle}</p>
                  <p className="mt-1 text-[12px] font-semibold text-[var(--ma-brand)]">{friend.elo} Elo</p>
                </div>
              </div>
              {friendshipLabel ? (
                <div role="status" className="rounded-xl bg-[var(--ma-active-soft)] px-3 py-2.5 text-center text-[12px] font-semibold text-[var(--ma-active)]">{friendshipLabel}</div>
              ) : (
                <button type="button" onClick={() => void addFriend()} disabled={isSending} className="h-11 rounded-[var(--radius-xl)] bg-[var(--ma-brand)] px-4 text-[13px] font-semibold text-[var(--ma-brand-fg)] disabled:opacity-50">
                  {isSending ? t.friendQr.sending : t.friendQr.addFriend}
                </button>
              )}
              <button type="button" onClick={scanAgain} className="h-10 rounded-[var(--radius-xl)] border border-[var(--ma-border)] bg-[var(--ma-surface-raised)] text-[12px] font-semibold text-[var(--ma-fg-muted)]">{t.friendQr.scanAgain}</button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 py-2">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-black">
                <video ref={videoRef} muted playsInline className="h-full w-full object-cover" aria-label={t.friendQr.cameraHint} />
                {isResolving && <div className="absolute inset-0 flex items-center justify-center bg-black/65 text-[13px] font-semibold text-white">{t.friendQr.resolving}</div>}
                {cameraError && <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-[13px] leading-relaxed text-white">{t.friendQr.cameraDenied}</div>}
              </div>
              <p className="text-center text-[12px] text-[var(--ma-fg-subtle)]">{t.friendQr.cameraHint}</p>
              {message && <p role="alert" className="rounded-xl bg-[var(--ma-danger)]/10 px-3 py-2.5 text-center text-[12px] font-medium text-[var(--ma-danger)]">{message}</p>}
              <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={(event) => { void scanImage(event.target.files?.[0]); event.currentTarget.value = '' }} />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="h-11 rounded-[var(--radius-xl)] border border-[var(--ma-border)] bg-[var(--ma-surface-raised)] text-[13px] font-semibold text-[var(--ma-fg)]">{t.friendQr.chooseImage}</button>
            </div>
          )}
        </div>
      </div>
    </ModalBackdrop>
  )
}
