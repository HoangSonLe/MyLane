import type { Locale } from '@/stores/locale.store'

const SECOND_MS = 1_000
const MINUTE_MS = 60 * SECOND_MS
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

function formatLegacyRelativeTime(value: string, formatter: Intl.RelativeTimeFormat): string | null {
  const normalized = value.trim().toLowerCase()

  if (normalized === 'just now') return formatter.format(0, 'second')
  if (normalized === 'today') return formatter.format(0, 'day')
  if (normalized === 'yesterday') return formatter.format(-1, 'day')

  const daysAgo = normalized.match(/^(\d+)d ago$/)
  return daysAgo ? formatter.format(-Number(daysAgo[1]), 'day') : null
}

/** Formats Supabase ISO timestamps and keeps older mock relative-time strings readable. */
export function formatMatchPlayedAt(value: string, locale: Locale, now = new Date()): string {
  const relativeFormatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const legacyLabel = formatLegacyRelativeTime(value, relativeFormatter)
  if (legacyLabel) return legacyLabel

  const timestamp = Date.parse(value)
  if (Number.isNaN(timestamp)) return value

  const playedAt = new Date(timestamp)
  const differenceMs = playedAt.getTime() - now.getTime()
  const absoluteDifferenceMs = Math.abs(differenceMs)

  if (absoluteDifferenceMs < MINUTE_MS) return relativeFormatter.format(0, 'second')
  if (absoluteDifferenceMs < HOUR_MS) {
    return relativeFormatter.format(Math.round(differenceMs / MINUTE_MS), 'minute')
  }
  if (absoluteDifferenceMs < DAY_MS) {
    return relativeFormatter.format(Math.round(differenceMs / HOUR_MS), 'hour')
  }
  if (absoluteDifferenceMs < 7 * DAY_MS) {
    return relativeFormatter.format(Math.round(differenceMs / DAY_MS), 'day')
  }

  return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(playedAt)
}
