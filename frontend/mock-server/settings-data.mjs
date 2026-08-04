/**
 * Plain-JS mirror of src/services/settings/settings.mock.ts — keep both in sync.
 */
export const MOCK_LINKED_METHODS = [
  { id: 'google',  label: 'Google',  handle: 'nguyenviet@gmail.com' },
  { id: 'discord', label: 'Discord', handle: 'nguyenviet#4291' },
]

export const MOCK_SETTINGS = {
  linkedMethods: MOCK_LINKED_METHODS,
  notifications: true,
  sounds: true,
  haptics: false,
  locale: 'vi',
  theme: 'light',
}

export const GUEST_SETTINGS = {
  linkedMethods: [],
  notifications: true,
  sounds: true,
  haptics: false,
  locale: 'vi',
  theme: 'light',
}
