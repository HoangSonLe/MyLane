-- ====================================================================
-- GameBoard (Memory Arena) Migration — Add Access Logs & Admin Role
-- Migration Date: 2026-08-04
-- ====================================================================

-- 1. Add is_admin column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2. Create access_logs table with Geolocation & IP tracking
CREATE TABLE IF NOT EXISTS public.access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_email TEXT,
  is_guest BOOLEAN DEFAULT false,
  user_agent TEXT,
  device_type TEXT DEFAULT 'Desktop',
  page_path TEXT DEFAULT '/',
  ip_address TEXT,
  location_name TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast sorting by latest access timestamp
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON public.access_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON public.access_logs(user_id);

-- Enable RLS on access_logs
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone (authenticated or anon) can insert access log entries
CREATE POLICY "Anyone can insert access log entries"
  ON public.access_logs
  FOR INSERT
  WITH CHECK (true);

-- Policy 2: ONLY Admins can SELECT/view access logs
CREATE POLICY "Only admins can view access logs"
  ON public.access_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

-- Policy 3: ONLY Admins can DELETE access logs
CREATE POLICY "Only admins can clear access logs"
  ON public.access_logs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );
