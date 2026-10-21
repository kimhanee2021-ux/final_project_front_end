import { useEffect } from 'react'

// 분석 화면의 움직이는 요소(차트 막대·레이더·타일 등)를 가리키는 선택자. gamesense.css의 애니메이션 클래스와 같다.
const ANIMATED = '.gs-grow-y, .gs-grow-x, .gs-radar-in, .gs-fade, .gs-panel-page > *, .gs-stagger > *'

// 화면에 보이기 전까지 애니메이션을 멈춰 두고, 스크롤로 보이기 시작할 때 data-inview를 달아 시작시킨다.
// (data-inview는 React가 건드리지 않는 속성이라 다시 그려져도 사라지지 않는다.)
// 나중에 화면에 추가되는 요소도 MutationObserver로 찾아서 같은 방식으로 지켜본다.
export function useRevealOnView() {
  useEffect(() => {
    const all = () => document.querySelectorAll(ANIMATED)
    if (typeof IntersectionObserver === 'undefined') {
      all().forEach(element => element.setAttribute('data-inview', ''))
      return
    }
    const watched = new WeakSet()
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          entry.target.setAttribute('data-inview', '')
          observer.unobserve(entry.target)
        })
      },
      { rootMargin: '0px 0px -8% 0px' }
    )
    const scan = () => {
      all().forEach(element => {
        if (watched.has(element)) return
        watched.add(element)
        observer.observe(element)
      })
    }
    scan()
    const mutations = new MutationObserver(scan)
    mutations.observe(document.body, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      mutations.disconnect()
    }
  }, [])
}
