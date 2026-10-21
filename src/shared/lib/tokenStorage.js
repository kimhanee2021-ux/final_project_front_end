// 로그인 토큰을 브라우저 저장소에 읽고 쓰는 함수. apiClient(요청에 토큰 붙이기)와 auth 기능이 같이 쓴다.
const ACCESS_TOKEN_KEY = 'gamesense-access-token'

// stores = [sessionStorage, localStorage]. "로그인 상태 유지"를 선택하면 localStorage에 둔다.
export function readAccessToken(stores) {
  for (const storage of stores) {
    try {
      const token = storage?.getItem(ACCESS_TOKEN_KEY)
      if (token) return token
    } catch { /* Try the next storage. */ }
  }
  return null
}

export function clearAccessToken(stores) {
  stores.forEach(storage => {
    try { storage?.removeItem(ACCESS_TOKEN_KEY) } catch { /* Memory-only mode. */ }
  })
}

export function saveAccessToken(stores, token, remember) {
  clearAccessToken(stores)
  try {
    stores[remember ? 1 : 0]?.setItem(ACCESS_TOKEN_KEY, token)
  } catch { /* Storage blocked: the token cannot survive a reload. */ }
}
