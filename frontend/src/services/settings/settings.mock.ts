import type { LinkedMethod, SettingsData } from './settings.interface'

export const MOCK_LINKED_METHODS: LinkedMethod[] = [
  { id: 'google',  label: 'Google',  handle: 'nguyenviet@gmail.com' },
  { id: 'discord', label: 'Discord', handle: 'nguyenviet#4291' },
]

/** Seed for a signed-in (non-guest) account. Guests get no linked methods and untouched defaults. */
export const MOCK_SETTINGS: SettingsData = {
  linkedMethods: MOCK_LINKED_METHODS,
  notifications: true,
  sounds: true,
  haptics: false,
  locale: 'en',
}
