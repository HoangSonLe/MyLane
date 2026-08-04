-- ====================================================================
-- GameBoard Migration — Add Geolocation, IP & Device ID Columns
-- Run this script if you already executed 20260804_add_access_logs_and_admin_role.sql
-- ====================================================================

ALTER TABLE public.access_logs
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS location_name TEXT,
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC,
ADD COLUMN IF NOT EXISTS device_id TEXT;
