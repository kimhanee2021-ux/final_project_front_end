// 같은 페이지의 데이터 패널로 부드럽게 스크롤한다 (모션 줄이기 설정이면 바로 이동).
// 주소(해시)는 바꾸지 않는다. 바꾸면 레이아웃이 해시 변경을 보고 바로 순간이동시키기 때문이다.
export function scrollToPanel(event, id) {
  const target = document.getElementById(id)
  if (!target) return
  event.preventDefault()
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
}
