import axios from 'axios'
import { readAccessToken } from '../features/auth/authSession'

// 개발 환경에서는 vite proxy(/api -> 백엔드)를 타므로 baseURL이 비어 있어도 된다.
// 배포 등으로 백엔드 주소가 다르면 VITE_API_BASE_URL에 지정한다.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export const UNAUTHORIZED_EVENT = 'gamesense:unauthorized'

function browserStores() {
  return ['sessionStorage', 'localStorage'].map(name => {
    try { return window[name] } catch { return null }
  })
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// 백엔드는 세션 없이 매 요청의 Authorization 헤더(JWT)로만 로그인 여부를 판단한다.
apiClient.interceptors.request.use(config => {
  const token = readAccessToken(browserStores())
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 토큰 만료/위조로 401이 오면 AuthProvider가 로그아웃 처리하도록 알린다.
// 단, "현재 비밀번호 불일치"처럼 서비스가 던진 401은 본문에 다른 메시지가 있으므로 세션 만료로 보지 않는다.
// (시큐리티 401은 본문이 비어 있고, 컨트롤러 진입 후 인증 누락은 '로그인이 필요합니다'로 온다)
function isSessionExpired(error) {
  if (error.response?.status !== 401 || !error.config?.headers?.Authorization) return false
  const message = error.response.data?.error
  return !message || message === '로그인이 필요합니다'
}

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (isSessionExpired(error)) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }
    return Promise.reject(error)
  }
)

// 백엔드 에러 응답은 { error: "메시지" } 형식(ErrorResponse)이다.
export function getErrorMessage(error, fallback = '요청을 처리하지 못했어요. 잠시 후 다시 시도해주세요.') {
  if (error?.response?.data?.error) return error.response.data.error
  if (error?.code === 'ECONNABORTED') return '서버 응답이 지연되고 있어요. 잠시 후 다시 시도해주세요.'
  if (error?.request && !error.response) return '서버에 연결할 수 없어요. 백엔드 서버가 실행 중인지 확인해주세요.'
  return fallback
}

export { browserStores }
export default apiClient
