// 화면을 부드럽고 빠르게 스크롤한다. 브라우저 기본 smooth는 속도를 정할 수 없어서 직접 움직인다.
// 모션 줄이기 설정이면 바로 이동한다.
const DURATION_MS = 350

function scrollToY(top, duration = DURATION_MS) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const from = window.scrollY
  if (reduced || from === top) {
    window.scrollTo(0, top)
    return
  }
  const startedAt = performance.now()
  const tick = now => {
    const progress = Math.min((now - startedAt) / duration, 1)
    // 끝으로 갈수록 천천히 멈추도록 easeOut
    const eased = 1 - Math.pow(1 - progress, 3)
    window.scrollTo(0, from + (top - from) * eased)
    if (progress < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

export const scrollToTop = () => scrollToY(0)

export const scrollToBottom = () => scrollToY(document.documentElement.scrollHeight - window.innerHeight)
