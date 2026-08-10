import { QueryClient } from '@tanstack/react-query'

/**
 * Singleton TanStack Query client (docs/technical/README.md's documented
 * "Server state" layer — installed here for the first time). `staleTime`
 * is short on purpose: it only exists to dedupe/reuse fetches across quick
 * screen navigation, not to replace each query's own `refetchInterval`
 * freshness contract. `retry: false` matches this app's existing hand-rolled
 * fetches, which never retried failed requests either.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 1000,
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})
