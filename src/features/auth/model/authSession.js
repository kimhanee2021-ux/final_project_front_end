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
