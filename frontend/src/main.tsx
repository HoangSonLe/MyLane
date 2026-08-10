import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { queryClient } from '@/lib/query-client'
import './index.css'
import '@/stores/theme.store'

// Design-review switcher (jump to any screen) — dev-only, opt-in via ?demo=1.
// Never reachable in a production build: see pages/demo/DemoApp.tsx.
const isDemo = import.meta.env.DEV && new URLSearchParams(window.location.search).get('demo') === '1'
const DemoApp = isDemo
  ? lazy(() => import('./pages/demo/DemoApp').then((m) => ({ default: m.DemoApp })))
  : null

function render() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        {DemoApp ? (
          <Suspense fallback={null}>
            <DemoApp />
          </Suspense>
        ) : (
          <App />
        )}
      </QueryClientProvider>
    </StrictMode>,
  )
}

// No real backend yet (see docs/technical/README.md) — Auth calls are
// answered by a fake backend in dev. Default is MSW, intercepting requests
// in-browser; set VITE_MOCK_MODE=server to use the standalone Node process
// in mock-server/ instead. See mock-server/README.md.
import { isSupabaseConfigured } from '@/services/backend-config'

const useMsw = import.meta.env.DEV && import.meta.env.VITE_MOCK_MODE !== 'server' && !isSupabaseConfigured()
if (useMsw) {
  import('./mocks/browser').then(({ worker }) =>
    worker.start({ onUnhandledRequest: 'bypass' }),
  ).then(render)
} else {
  render()
}
