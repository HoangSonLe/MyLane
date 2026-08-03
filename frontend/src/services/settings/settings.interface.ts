export interface LinkedMethod {
  id: string
  label: string
  handle: string
}

/** Server-provided state for Settings on mount. */
export interface SettingsData {
  linkedMethods: LinkedMethod[]
  notifications: boolean
  sounds: boolean
  haptics: boolean
  /** Player's language preference stored server-side so it survives a new device / cleared localStorage. */
  locale: 'en' | 'vi'
  /** Player's theme preference ('dark' | 'light') stored server-side. */
  theme?: 'dark' | 'light'
}
