import { useLocaleStore } from '@/stores/locale.store'
import { translations } from './translations'

/**
 * `t` is the whole resolved dictionary for the current locale (e.g.
 * `t.statRow.level`), not a `t('key')` lookup function — every string is
 * typed and autocompleted, and a typo is a compile error rather than a
 * silent miss.
 */
export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale)
  const setLocale = useLocaleStore((s) => s.setLocale)
  return { t: translations[locale], locale, setLocale }
}
