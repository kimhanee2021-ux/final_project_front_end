export const DEMO_SESSION_KEY = 'gamesense-demo-session-v1'
const authPaths = new Set(['/login', '/signup', '/forgot-password'])

// Return only to an internal screen, never to an external URL or another auth form.
export function safeReturnTo(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || /^\/[/\\]/.test(value) || value.includes('\\') || [...value].some(character => character.charCodeAt(0) <= 32)) return '/'
  try {
    const url = new URL(value, 'https://gamesense.invalid')
    const path = decodeURIComponent(url.pathname).replace(/\/+$/, '').toLowerCase() || '/'
    if (url.origin !== 'https://gamesense.invalid' || authPaths.has(path) || path.startsWith('//') || path.includes('\\')) return '/'
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return '/'
  }
}

export function authLink(mode, returnTo = '/') {
  const path = authPaths.has(`/${mode}`) ? `/${mode}` : '/login'
  const next = safeReturnTo(returnTo)
  return next === '/' ? path : `${path}?next=${encodeURIComponent(next)}`
}

export function readDemoSession(stores) {
  return stores.some(storage => {
    try {
      const value = JSON.parse(storage?.getItem(DEMO_SESSION_KEY) ?? 'null')
      return value?.mode === 'demo' && value?.version === 1
    } catch {
      return false
    }
  })
}

export function clearDemoSession(stores) {
  stores.forEach(storage => {
    try { storage?.removeItem(DEMO_SESSION_KEY) } catch { /* Memory-only mode. */ }
  })
}

export function saveDemoSession(stores, remember) {
  clearDemoSession(stores)
  try {
    // Only a demo marker is stored. Never store entered emails or passwords.
    stores[remember ? 1 : 0]?.setItem(DEMO_SESSION_KEY, JSON.stringify({ mode: 'demo', version: 1 }))
  } catch { /* The current React session still works when storage is unavailable. */ }
}
