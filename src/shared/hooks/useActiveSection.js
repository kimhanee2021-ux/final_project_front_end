import { useEffect, useState } from 'react'

// 위쪽 고정 헤더 아래로 이만큼 내려온 지점을 지난 마지막 섹션을 "지금 보는 섹션"으로 본다
const OFFSET = 140

// 스크롤할 때 지금 화면에서 읽고 있는 섹션의 id를 돌려준다. ids는 페이지 순서대로, 매번 같은 배열(모듈 상수)을 넘긴다.
// 페이지 맨 끝에 닿으면 마지막 섹션이 위쪽 기준선까지 못 올라와도 마지막 섹션으로 본다.
export function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
      let current = ids[0]
      for (const id of ids) {
        const element = document.getElementById(id)
        if (element && element.getBoundingClientRect().top <= OFFSET) current = id
      }
      setActive(atBottom ? ids[ids.length - 1] : current)
    }
    // 스크롤 이벤트는 아주 자주 오므로 한 프레임에 한 번만 계산한다
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(frame)
    }
  }, [ids])
  return active
}
