export type BackendProvider = 'mock' | 'supabase' | 'dotnet'

export interface BackendConfig {
  provider: BackendProvider
  supabaseUrl?: string
  supabaseAnonKey?: string
  dotnetApiUrl?: string
}

export function getBackendConfig(): BackendConfig {
  const provider = (import.meta.env.VITE_BACKEND_PROVIDER as BackendProvider) || 'mock'
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
  const dotnetApiUrl = import.meta.env.VITE_DOTNET_API_URL as string | undefined

  return {
    provider,
    supabaseUrl,
    supabaseAnonKey,
    dotnetApiUrl,
  }
}

export function isSupabaseConfigured(): boolean {
  const cfg = getBackendConfig()
  return (
    cfg.provider === 'supabase' &&
    Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey)
  )
}
