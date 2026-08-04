import { useState, useEffect, useMemo } from 'react'
import { ModalBackdrop } from '@/components/ui/ModalBackdrop'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { accessLogService, type AccessLogEntry, formatUserAgent } from '@/services/access-log/access-log.service'
import {
  Shield,
  Search,
  RefreshCw,
  User,
  Trash2,
  MapPin,
  ExternalLink,
  X,
  Cpu,
  Clock,
  UserCheck,
  UserX,
  Monitor,
  Smartphone,
  Tablet,
  Copy,
  Check,
  Activity,
} from 'lucide-react'

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

/** Get device icon based on device type string */
function getDeviceIcon(deviceType: string) {
  const type = deviceType.toLowerCase()
  if (type.includes('mobile')) return <Smartphone className="w-3.5 h-3.5" />
  if (type.includes('tablet')) return <Tablet className="w-3.5 h-3.5" />
  return <Monitor className="w-3.5 h-3.5" />
}

export function AdminAccessLogsModal({ isOpen, onClose }: AdminAccessLogsModalProps) {
  const [logs, setLogs] = useState<AccessLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'user' | 'guest'>('all')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')
  const [copiedDevId, setCopiedDevId] = useState<string | null>(null)

  // Shared ConfirmDialog state
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      const data = await accessLogService.getAccessLogs(200)
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

  const handleCopyDeviceId = (devId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(devId)
    setCopiedDevId(devId)
    setTimeout(() => setCopiedDevId(null), 2000)
  }

  // Step 1: Base filter by Time Range and Search Query
  const baseFilteredLogs = useMemo(() => {
    const now = Date.now()
    const timeMs = TIME_FILTER_OPTIONS.find((o) => o.value === timeFilter)?.ms ?? null
    const normalizedQuery = normalizeText(searchQuery.trim())

    return logs.filter((log) => {
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
  }, [logs, timeFilter, searchQuery])

  // Step 2: Accurate Statistics Calculation (Unique Accounts & Guests vs Total Log Visits)
  const stats = useMemo(() => {
    const totalVisits = baseFilteredLogs.length

    const memberLogs = baseFilteredLogs.filter((l) => !l.is_guest)
    const guestLogs = baseFilteredLogs.filter((l) => l.is_guest)

    // Unique accounts (member user_id, user_email, or user_name)
    const uniqueMemberSet = new Set(
      memberLogs.map((l) => l.user_id || l.user_email || l.user_name).filter(Boolean)
    )

    // Unique guest devices (device_id, ip_address, or user_name)
    const uniqueGuestSet = new Set(
      guestLogs.map((l) => getDisplayDeviceId(l) || l.ip_address || l.user_name).filter(Boolean)
    )

    return {
      totalVisits,
      memberVisits: memberLogs.length,
      guestVisits: guestLogs.length,
      uniqueMembers: uniqueMemberSet.size,
      uniqueGuests: uniqueGuestSet.size,
    }
  }, [baseFilteredLogs])

  // Step 3: Final Filtered Logs by User Type tab ('all' | 'user' | 'guest')
  const filteredLogs = useMemo(() => {
    return baseFilteredLogs.filter((log) => {
      if (filterType === 'user' && log.is_guest) return false
      if (filterType === 'guest' && !log.is_guest) return false
      return true
    })
  }, [baseFilteredLogs, filterType])

  if (!isOpen) return null

  return (
    <>
      <ModalBackdrop show={isOpen} onClose={onClose}>
        <div
          className="w-[calc(100vw-2rem)] sm:w-full sm:max-w-3xl max-h-[85vh] sm:max-h-[88vh] flex flex-col p-4 sm:p-5 transition-all relative overflow-hidden"
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
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--ma-surface)] border border-[var(--ma-border)] text-[var(--ma-fg-subtle)] hover:text-[var(--ma-fg)] hover:bg-[var(--ma-border-subtle)] flex items-center justify-center transition-all z-10"
            title="Đóng modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-3.5 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--ma-border-subtle)] pb-3 pr-8 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 shadow-xs">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-[17px] text-[var(--ma-fg)] tracking-tight">
                      Nhật Ký Truy Cập & Vị Trí Tọa Độ
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      Admin Only
                    </span>
                  </div>
                  <p className="text-[12px] text-[var(--ma-fg-subtle)]">
                    Lịch sử truy cập, Mã máy thiết bị duy nhất, Địa chỉ IP & Vị trí địa lý
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={fetchLogs}
                  disabled={isLoading}
                  className="p-2 rounded-xl text-[var(--ma-fg-subtle)] hover:text-[var(--ma-fg)] hover:bg-[var(--ma-surface)] transition-all disabled:opacity-50"
                  title="Làm mới danh sách nhật ký"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all"
                  title="Xóa toàn bộ nhật ký truy cập"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Interactive Overview Stats Cards (Clickable Filter Buttons) */}
            <div className="grid grid-cols-3 gap-2.5 shrink-0">
              {/* Card 1: All Visits Filter */}
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${
                  filterType === 'all'
                    ? 'bg-[var(--ma-brand-soft)]/20 border-[var(--ma-brand)] shadow-xs ring-1 ring-[var(--ma-brand)]/50'
                    : 'bg-[var(--ma-surface)] border-[var(--ma-border-subtle)] hover:border-[var(--ma-brand-soft)] opacity-85 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--ma-fg-subtle)] mb-0.5">
                  <Activity className="w-3.5 h-3.5 text-[var(--ma-brand)]" />
                  <span>Tất cả lượt vào</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-black text-[var(--ma-brand)] tracking-tight">
                    {stats.totalVisits}
                  </span>
                  <span className="text-[10px] font-semibold text-[var(--ma-fg-subtle)]">lượt</span>
                </div>
              </button>

              {/* Card 2: Members Filter */}
              <button
                type="button"
                onClick={() => setFilterType('user')}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${
                  filterType === 'user'
                    ? 'bg-emerald-500/15 border-emerald-500 shadow-xs ring-1 ring-emerald-500/50'
                    : 'bg-[var(--ma-surface)] border-[var(--ma-border-subtle)] hover:border-emerald-500/30 opacity-85 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Tài khoản</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-black text-emerald-500 tracking-tight">
                    {stats.uniqueMembers}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600/70 dark:text-emerald-400/70">TK</span>
                </div>
                <span className="text-[10px] font-medium text-[var(--ma-fg-subtle)] mt-0.5">
                  ({stats.memberVisits} lượt vào)
                </span>
              </button>

              {/* Card 3: Guest Visitors Filter */}
              <button
                type="button"
                onClick={() => setFilterType('guest')}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${
                  filterType === 'guest'
                    ? 'bg-amber-500/15 border-amber-500 shadow-xs ring-1 ring-amber-500/50'
                    : 'bg-[var(--ma-surface)] border-[var(--ma-border-subtle)] hover:border-amber-500/30 opacity-85 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 mb-0.5">
                  <UserX className="w-3.5 h-3.5" />
                  <span>Khách vãng lai</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-black text-amber-500 tracking-tight">
                    {stats.uniqueGuests}
                  </span>
                  <span className="text-[10px] font-semibold text-amber-600/70 dark:text-amber-400/70">Máy</span>
                </div>
                <span className="text-[10px] font-medium text-[var(--ma-fg-subtle)] mt-0.5">
                  ({stats.guestVisits} lượt vào)
                </span>
              </button>
            </div>

            {/* Controls: Search & Time Filter */}
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between shrink-0">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ma-fg-subtle)] pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm tên (không dấu OK), mã máy DEV-..., IP, vị trí..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-[var(--ma-surface)] border border-[var(--ma-border-subtle)] text-[12px] text-[var(--ma-fg)] placeholder:[var(--ma-fg-subtle)] focus:outline-none focus:border-[var(--ma-brand)] transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-[var(--ma-fg-subtle)] hover:text-[var(--ma-fg)] transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Time filter */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--ma-surface)] border border-[var(--ma-border-subtle)] text-[11px] font-semibold shrink-0">
                <Clock className="w-3.5 h-3.5 text-[var(--ma-fg-subtle)] ml-1.5 mr-0.5" />
                {TIME_FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTimeFilter(opt.value)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      timeFilter === opt.value
                        ? 'bg-[var(--ma-brand)] text-white shadow-xs'
                        : 'text-[var(--ma-fg-subtle)] hover:text-[var(--ma-fg)]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop Table Header */}
            <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2 text-[11px] font-bold text-[var(--ma-fg-subtle)] uppercase tracking-wider bg-[var(--ma-surface)] rounded-xl border border-[var(--ma-border-subtle)] shrink-0">
              <div className="col-span-4">Người dùng</div>
              <div className="col-span-3">Mã máy & IP</div>
              <div className="col-span-3">Vị trí & Thiết bị</div>
              <div className="col-span-2 text-right">Thời gian</div>
            </div>

            {/* Log List Container */}
            <div className="space-y-2 overflow-y-auto pr-1 flex-1 min-h-[250px]">
              {isLoading ? (
                <div className="py-16 text-center text-[13px] text-[var(--ma-fg-subtle)] flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-[var(--ma-brand)]" />
                  <span>Đang tải danh sách nhật ký vị trí...</span>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="py-16 text-center text-[13px] text-[var(--ma-fg-subtle)] border border-dashed border-[var(--ma-border-subtle)] rounded-2xl flex flex-col items-center justify-center gap-2">
                  <Shield className="w-6 h-6 text-[var(--ma-fg-subtle)] opacity-40" />
                  <span>Chưa có nhật ký truy cập nào phù hợp với bộ lọc.</span>
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const logDate = new Date(log.created_at)
                  const timeAgo = formatRelativeTime(logDate)
                  const fullTime = formatFullTime(logDate)
                  const devId = getDisplayDeviceId(log)
                  const isCopied = copiedDevId === devId

                  const mapUrl =
                    log.latitude && log.longitude
                      ? `https://www.google.com/maps?q=${log.latitude},${log.longitude}`
                      : null

                  return (
                    <div
                      key={log.id}
                      className="p-3 sm:px-4 rounded-xl bg-[var(--ma-surface)] border border-[var(--ma-border-subtle)] hover:border-[var(--ma-brand-soft)] transition-all flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-3 items-start sm:items-center text-[12px] group"
                    >
                      {/* Col 1 (col-span-4): User info */}
                      <div className="col-span-4 flex items-center gap-2.5 min-w-0 w-full">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-[13px] shrink-0 shadow-2xs ${
                            log.is_guest
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          }`}
                        >
                          <User className="w-4 h-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-[var(--ma-fg)] truncate text-[13px]" title={log.user_name}>
                              {log.user_name}
                            </span>
                            {log.is_guest ? (
                              <span className="px-1.5 py-0.2 text-[9px] font-extrabold rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider shrink-0">
                                Khách
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 text-[9px] font-extrabold rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider shrink-0">
                                Thành viên
                              </span>
                            )}
                          </div>
                          {log.user_email && (
                            <p className="text-[11px] text-[var(--ma-fg-subtle)] truncate mt-0.5">
                              {log.user_email}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Col 2 (col-span-3): Machine ID & IP */}
                      <div className="col-span-3 flex flex-col gap-1 min-w-0 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={(e) => handleCopyDeviceId(devId, e)}
                          className="font-mono bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-lg border border-purple-500/20 font-bold flex items-center gap-1.5 w-fit transition-all cursor-pointer text-[10px]"
                          title="Bấm để sao chép Mã nhận dạng máy"
                        >
                          <Cpu className="w-3 h-3 text-purple-500 shrink-0" />
                          <span className="truncate">Máy: {devId}</span>
                          {isCopied ? (
                            <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                          ) : (
                            <Copy className="w-3 h-3 opacity-60 group-hover:opacity-100 shrink-0" />
                          )}
                        </button>

                        {log.ip_address ? (
                          <span className="font-mono text-[10px] text-[var(--ma-fg-subtle)] pl-0.5">
                            IP: {log.ip_address}
                          </span>
                        ) : (
                          <span className="text-[10px] text-[var(--ma-fg-subtle)] opacity-50 pl-0.5">
                            IP: Không có
                          </span>
                        )}
                      </div>

                      {/* Col 3 (col-span-3): Geolocation & Device */}
                      <div className="col-span-3 flex flex-col gap-1 min-w-0 w-full sm:w-auto">
                        <div className="flex items-center gap-1 font-semibold text-[var(--ma-fg)] text-[11px] truncate">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="truncate" title={log.location_name || 'Không xác định'}>
                            {log.location_name || 'Không xác định'}
                          </span>
                          {mapUrl && (
                            <a
                              href={mapUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sky-500 hover:underline inline-flex items-center gap-0.5 ml-1 font-bold shrink-0 text-[10px]"
                              title="Xem vị trí trên Google Maps"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-[var(--ma-fg-subtle)] truncate">
                          {getDeviceIcon(log.device_type)}
                          <span className="truncate">{log.device_type} • {formatUserAgent(log.user_agent)}</span>
                        </div>
                      </div>

                      {/* Col 4 (col-span-2): Timestamp */}
                      <div className="col-span-2 sm:text-right shrink-0 w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-[var(--ma-border-subtle)]/60 pt-2 sm:pt-0">
                        <span className="font-extrabold text-[var(--ma-fg)] text-[11px]" title={fullTime}>
                          {timeAgo}
                        </span>
                        <span className="text-[10px] font-medium text-[var(--ma-fg-subtle)] flex items-center gap-1 sm:justify-end mt-0.5">
                          <Clock className="w-3 h-3 text-[var(--ma-fg-subtle)]" />
                          <span>
                            {logDate.getHours().toString().padStart(2, '0')}:
                            {logDate.getMinutes().toString().padStart(2, '0')}
                          </span>
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

