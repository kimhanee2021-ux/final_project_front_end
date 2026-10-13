import apiClient, { API_BASE_URL } from '../../utils/apiClient'

// 백엔드 AuthController(/api/auth/**, /api/me) 연동

export async function checkEmailAvailability(email) {
  const { data } = await apiClient.get('/api/auth/check-email', { params: { email } })
  return data.available
}

export async function checkNicknameAvailability(nickname) {
  const { data } = await apiClient.get('/api/auth/check-nickname', { params: { nickname } })
  return data.available
}

// 가입 성공 시 바로 로그인 상태가 되도록 백엔드가 JWT를 함께 내려준다.
export async function signup({ email, nickname, password }) {
  const { data } = await apiClient.post('/api/auth/signup', { email, nickname, password })
  return data.token
}

export async function login({ email, password }) {
  const { data } = await apiClient.post('/api/auth/login', { email, password })
  return data.token
}

// 응답: { id, email, nickname }
export async function getCurrentUser() {
  const { data } = await apiClient.get('/api/me')
  return data
}

// 스팀 연동은 OpenID 리다이렉트 방식이라 axios가 아니라 페이지 전체 이동으로 시작해야 한다.
// 최상위 이동에는 헤더를 붙일 수 없어 백엔드가 토큰을 쿼리 파라미터로 받는다.
export function steamLinkUrl(token) {
  return `${API_BASE_URL}/api/auth/steam?token=${encodeURIComponent(token)}`
}
