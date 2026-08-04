import { useState, useEffect, useMemo } from 'react'
import { ModalBackdrop } from '@/components/ui/ModalBackdrop'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { accessLogService, type AccessLogEntry, formatUserAgent } from '@/services/access-log/access-log.service'
import { Shield, Search, RefreshCw, User, Trash2, MapPin, ExternalLink, X, Cpu, Clock } from 'lucide-react'

/** Normalize Vietnamese text — remove diacritics for accent-insensitive search */
function normalizeText(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/\u0110/g, 'D')
    .toLowerCase()
}

type TimeFilter = 'all' | '1h' | '6h' | '24h' | '7d'
const TIME_FILTER_OPTIONS: { label: string; value: TimeFilter; ms: number | null }[] = [
  { label: 'Tất cả', value: 'all', ms: null },
  { label: '1 giờ', value: '1h', ms: 60 * 60 * 1000 },
  { label: '6 giờ', value: '6h', ms: 6 * 60 * 60 * 1000 },
  { label: '24 giờ', value: '24h', ms: 24 * 60 * 60 * 1000 },
  { label: '7 ngày', value: '7d', ms: 7 * 24 * 60 * 60 * 1000 },
]

interface AdminAccessLogsModalProps {
  isOpen: boolean
  onClose: () => void
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffSec < 60) return 'Vừa xong'
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`
  return `${Math.floor(diffSec / 86400)} ngày trước`
}

function formatFullTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0')
  const mins = date.getMinutes().toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${hours}:${mins} - ${day}/${month}/${year}`
}

/** Compute a fallback Machine Fingerprint ID for past log entries */
function getDisplayDeviceId(log: AccessLogEntry): string {
  if (log.device_id) return log.device_id

  const str = (log.user_agent || '') + (log.user_id || log.ip_address || log.user_name)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  const code = Math.abs(hash).toString(36).substring(0, 6).toUpperCase().padStart(6, '0')
  return `DEV-${code}`
}

export function AdminAccessLogsModal({ isOpen, onClose }: AdminAccessLogsModalProps) {
  const [logs, setLogs] = useState<AccessLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'user' | 'guest'>('all')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')

  // Shared ConfirmDialog state
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      const data = await accessLogService.getAccessLogs(150)
      setLogs(data)
    } catch (err) {
      console.error('Failed to load access logs:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchLogs()
    }
  }, [isOpen])

  const handleClearLogs = async () => {
    setIsClearing(true)
    try {
      await accessLogService.clearAccessLogs()
      setLogs([])
      setShowClearConfirm(false)
    } catch (err) {
      console.error('Failed to clear access logs:', err)
    } finally {
      setIsClearing(false)
    }
  }

  const filteredLogs = useMemo(() => {
    const now = Date.now()
    const timeMs = TIME_FILTER_OPTIONS.find((o) => o.value === timeFilter)?.ms ?? null
    const normalizedQuery = normalizeText(searchQuery.trim())

    return logs.filter((log) => {
      // Type filter
      if (filterType === 'user' && log.is_guest) return false
      if (filterType === 'guest' && !log.is_guest) return false

      // Time filter
      if (timeMs !== null) {
        const logTime = new Date(log.created_at).getTime()
        if (now - logTime > timeMs) return false
      }

      // Search filter — accent-insensitive (no diacritics needed)
      if (!normalizedQuery) return true
      const devId = getDisplayDeviceId(log)
      return (
        normalizeText(log.user_name).includes(normalizedQuery) ||
        (log.user_email && normalizeText(log.user_email).includes(normalizedQuery)) ||
        (log.location_name && normalizeText(log.location_name).includes(normalizedQuery)) ||
        (log.ip_address && log.ip_address.includes(normalizedQuery)) ||
        normalizeText(devId).includes(normalizedQuery) ||
        normalizeText(log.device_type).includes(normalizedQuery)
      )
    })
  }, [logs, filterType, timeFilter, searchQuery])

  const stats = useMemo(() => {
    const total = logs.length
    const users = logs.filter((l) => !l.is_guest).length
    const guests = logs.filter((l) => l.is_guest).length
    return { total, users, guests }
  }, [logs])

  if (!isOpen) return null

  return (
    <>
      <ModalBackdrop show={isOpen} onClose={onClose}>
        <div
          className="w-[calc(100vw-2rem)] sm:w-full sm:max-w-3xl max-h-[85vh] overflow-y-auto p-4 sm:p-5 transition-all relative"
          style={{
            borderRadius: 'var(--radius-2xl)',
            background: 'var(--ma-surface-raised)',
            border: '1px solid var(--ma-border)',
            boxShadow: 'var(--ma-shadow-xl)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Quick Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--ma-surface)] border border-[var(--ma-border)] text-[var(--ma-fg-subtle)] hover:text-[var(--ma-fg)] flex items-center justify-center transition-all z-10"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--ma-border-subtle)] pb-3 pr-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-[17px] text-[var(--ma-fg)] tracking-tight">
                      Nhật Ký Truy Cập & Vị Trí Tọa Độ
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      Admin Only
                    </span>
                  </div>
                  <p className="text-[12px] text-[var(--ma-fg-subtle)]">
                    Lịch sử truy cập, Mã máy thiết bị, Địa chỉ IP & Tọa độ vị trí địa lý
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={fetchLogs}
                  disabled={isLoading}
                  className="p-2 rounded-xl text-[var(--ma-fg-subtle)] hover:text-[var(--ma-fg)] hover:bg-[var(--ma-surface)] transition-all disabled:opacity-50"
                  title="Làm mới danh sách"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all"
                  title="Xóa lịch sử nhật ký"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Overview Stats Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-2xl bg-[var(--ma-surface)] border border-[var(--ma-border-subtle)] flex flex-col items-center text-center">
                <span className="text-[11px] font-medium text-[var(--ma-fg-subtle)]">Tổng lượt vào</span>
                <span className="text-xl font-black text-[var(--ma-brand)]">{stats.total}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--ma-surface)] border border-[var(--ma-border-subtle)] flex flex-col items-center text-center">
                <span className="text-[11px] font-medium text-[var(--ma-fg-subtle)]">Tài khoản</span>
                <span className="text-xl font-black text-emerald-500">{stats.users}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--ma-surface)] border border-[var(--ma-border-subtle)] flex flex-col items-center text-center">
                <span className="text-[11px] font-medium text-[var(--ma-fg-subtle)]">Khách vãng lai</span>
                <span className="text-xl font-black text-amber-500">{stats.guests}</span>
              </div>
            </div>

            {/* Controls: Search & Tabs */}
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ma-fg-subtle)] pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm tên (không dấu OK), mã máy DEV-..., IP..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[var(--ma-surface)] border border-[var(--ma-border-subtle)] text-[12px] text-[var(--ma-fg)] placeholder:[var(--ma-fg-subtle)] focus:outline-none focus:border-[var(--ma-brand)]"
                />
              </div>

              {/* Time filter */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--ma-surface)] border border-[var(--ma-border-subtle)] text-[11px] font-semibold shrink-0">
                <Clock className="w-3.5 h-3.5 text-[var(--ma-fg-subtle)] ml-1" />
                {TIME_FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTimeFilter(opt.value)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      timeFilter === opt.value ? 'bg-[var(--ma-brand)] text-white' : 'text-[var(--ma-fg-subtle)] hover:text-[var(--ma-fg)]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* User type tabs */}
            <div className="flex items-center gap-1 w-full overflow-x-auto">

              <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all text-[11px] font-semibold ${
                    filterType === 'all' ? 'bg-[var(--ma-brand)] text-white' : 'bg-[var(--ma-surface)] border border-[var(--ma-border-subtle)] text-[var(--ma-fg-subtle)] hover:text-[var(--ma-fg)]'
                  }`}
                >
                  Tất cả ({logs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('user')}
                  className={`px-3 py-1.5 rounded-lg transition-all text-[11px] font-semibold ${
                    filterType === 'user' ? 'bg-[var(--ma-brand)] text-white' : 'bg-[var(--ma-surface)] border border-[var(--ma-border-subtle)] text-[var(--ma-fg-subtle)] hover:text-[var(--ma-fg)]'
                  }`}
                >
                  Thành viên ({stats.users})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('guest')}
                  className={`px-3 py-1.5 rounded-lg transition-all text-[11px] font-semibold ${
                    filterType === 'guest' ? 'bg-[var(--ma-brand)] text-white' : 'bg-[var(--ma-surface)] border border-[var(--ma-border-subtle)] text-[var(--ma-fg-subtle)] hover:text-[var(--ma-fg)]'
                  }`}
                >
                  Khách ({stats.guests})
                </button>
            </div>

            {/* Log List Table */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {isLoading ? (
                <div className="py-12 text-center text-[13px] text-[var(--ma-fg-subtle)]">
                  Đang tải danh sách nhật ký vị trí...
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="py-12 text-center text-[13px] text-[var(--ma-fg-subtle)] border border-dashed border-[var(--ma-border-subtle)] rounded-2xl">
                  Chưa có nhật ký truy cập nào phù hợp.
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const logDate = new Date(log.created_at)
                  const timeAgo = formatRelativeTime(logDate)
                  const fullTime = formatFullTime(logDate)
                  const isMobile = log.device_type === 'Mobile' || log.device_type === 'Tablet'
                  const devId = getDisplayDeviceId(log)

                  const mapUrl = log.latitude && log.longitude
                    ? `https://www.google.com/maps?q=${log.latitude},${log.longitude}`
                    : null

                  return (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-[var(--ma-surface)] border border-[var(--ma-border-subtle)] hover:border-[var(--ma-brand-soft)] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[12px]"
                    >
                      {/* Left User Identity */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-[13px] shrink-0 ${
                          log.is_guest
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        }`}>
                          <User className="w-4 h-4" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[var(--ma-fg)] truncate">
                              {log.user_name}
                            </span>
                            {log.is_guest ? (
                              <span className="px-1.5 py-0.2 text-[9px] font-semibold rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                Khách
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 text-[9px] font-semibold rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                Thành viên
                              </span>
                            )}
                          </div>
                          {log.user_email && (
                            <p className="text-[11px] text-[var(--ma-fg-subtle)] truncate">
                              {log.user_email}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Middle Geolocation, IP & Device ID */}
                      <div className="flex flex-col sm:items-end text-[11px] text-[var(--ma-fg-subtle)]">
                        <div className="flex items-center gap-1 font-semibold text-[var(--ma-fg)]">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{log.location_name || 'Không xác định'}</span>
                          {mapUrl && (
                            <a
                              href={mapUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sky-500 hover:underline flex items-center gap-0.5 ml-1"
                              title="Xem vị trí trên Google Maps"
                            >
                              <span className="text-[10px]">Tọa độ</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-1.5 text-[10px] text-[var(--ma-fg-subtle)] mt-0.5">
                          <span className="font-mono bg-purple-500/10 text-purple-600 dark:text-purple-400 px-1.5 py-0.2 rounded border border-purple-500/20 font-bold flex items-center gap-1" title="Mã nhận dạng thiết bị duy nhất">
                            <Cpu className="w-3 h-3 text-purple-500" />
                            Máy: {devId}
                          </span>
                          {log.ip_address && (
                            <span className="font-mono bg-[var(--ma-surface-raised)] px-1.5 py-0.2 rounded border border-[var(--ma-border-subtle)]">
                              IP: {log.ip_address}
                            </span>
                          )}
                          <span>
                            {log.device_type} • {formatUserAgent(log.user_agent)}
                          </span>
                        </div>
                      </div>

                      {/* Right Timestamp info */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto border-t sm:border-t-0 border-[var(--ma-border-subtle)] pt-1.5 sm:pt-0 shrink-0">
                        <span className="font-semibold text-[var(--ma-fg)] text-[11px]" title={fullTime}>
                          {timeAgo}
                        </span>
                        <span className="text-[10px] text-[var(--ma-fg-subtle)]">
                          {logDate.getHours().toString().padStart(2, '0')}:{logDate.getMinutes().toString().padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </ModalBackdrop>

      {/* Shared ConfirmDialog primitive for Clearing Logs */}
      <ConfirmDialog
        open={showClearConfirm}
        variant="danger"
        icon={<Trash2 className="w-5 h-5 text-rose-500" />}
        title="Xóa nhật ký truy cập?"
        message="Bạn có chắc chắn muốn xóa toàn bộ lịch sử nhật ký truy cập không? Tất cả dữ liệu lượt truy cập sẽ bị xóa khỏi hệ thống."
        confirmLabel="Xóa nhật ký"
        cancelLabel="Hủy"
        busy={isClearing}
        onConfirm={handleClearLogs}
        onCancel={() => setShowClearConfirm(false)}
      />
    </>
  )
}
