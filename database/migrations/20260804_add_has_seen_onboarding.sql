-- ============================================================
-- Migration: Add has_seen_onboarding column to user_settings
-- Date: 2026-08-04
-- Purpose: Persist onboarding tutorial completion status to database per account
-- ============================================================

ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS has_seen_onboarding BOOLEAN DEFAULT false;
