import { safeReturnTo } from '@/features/auth'

// 로그인/가입 뒤 이어지는 온보딩(스팀 연동 → 추가 정보)의 주소와 진행 표시.
export const ONBOARDING_PATH = '/onboarding'

export function onboardingLink(returnTo = '/') {
  const next = safeReturnTo(returnTo)
  return next === '/' ? ONBOARDING_PATH : `${ONBOARDING_PATH}?next=${encodeURIComponent(next)}`
}

// 스팀 연동은 스팀 사이트를 다녀오는 전체 이동이라, 돌아왔을 때 온보딩을 이어 가도록 같은 탭에 표시를 남긴다.
// 백엔드는 연동이 끝나면 항상 '/?steamLinked=true'로 돌려보내므로 LandingPage가 이 표시를 보고 온보딩으로 보낸다.
const RETURN_KEY = 'gamesense-onboarding-next'

export function rememberOnboarding(next) {
  try { sessionStorage.setItem(RETURN_KEY, next) } catch { /* 저장소를 못 써도 연동 뒤 라이브러리로 간다. */ }
}

// 렌더 중에 읽는 값이라(StrictMode는 두 번 렌더한다) 읽기만 하고, 온보딩에 도착한 뒤 forgetOnboarding으로 지운다.
export function peekOnboardingReturn() {
  try { return sessionStorage.getItem(RETURN_KEY) } catch { return null }
}

export function forgetOnboarding() {
  try { sessionStorage.removeItem(RETURN_KEY) } catch { /* 남아 있어도 다음 연동 때 덮어쓴다. */ }
}

// "추가 정보" 단계를 한 번 지나간 계정은 다음 로그인부터 이 단계를 다시 보여주지 않는다.
const doneKey = userId => `gamesense-onboarded-${userId}`

export function isOnboardingDone(userId) {
  try { return localStorage.getItem(doneKey(userId)) === '1' } catch { return false }
}

export function markOnboardingDone(userId) {
  try { localStorage.setItem(doneKey(userId), '1') } catch { /* 다음 로그인에 한 번 더 보일 뿐이다. */ }
}
