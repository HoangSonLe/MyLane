-- New accounts start in Vietnamese with the light theme.
-- Existing user rows are intentionally unchanged so saved preferences win.
ALTER TABLE public.user_settings
  ALTER COLUMN preferred_language SET DEFAULT 'vi',
  ALTER COLUMN theme SET DEFAULT 'light';
