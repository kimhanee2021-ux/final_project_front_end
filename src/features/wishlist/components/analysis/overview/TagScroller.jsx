import { useEffect, useRef, useState } from 'react'
import { GSIcon } from '@/shared/ui'

// 태그 한 줄 가로 스크롤. 넘치면 양쪽 끝을 흐리게 하고 ‹ › 버튼으로 넘긴다 (스크롤바는 숨긴다, 터치는 손가락으로 밀기)
export default function TagScroller({ children }) {
  const ref = useRef(null)
  const [edges, setEdges] = useState({ left: false, right: false })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () =>
      setEdges({ left: el.scrollLeft > 1, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1 })
    update()
    el.addEventListener('scroll', update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [])

  const scroll = direction => ref.current?.scrollBy({ left: direction * ref.current.clientWidth * 0.7, behavior: 'smooth' })
  // 넘친 쪽 끝만 흐리게 한다
  const mask = `linear-gradient(to right, ${edges.left ? 'transparent, #000 48px' : '#000'}, ${edges.right ? '#000 calc(100% - 48px), transparent' : '#000'})`
  const arrow = 'absolute top-1/2 -translate-y-1/2 z-[1] grid place-items-center w-[32px] h-[32px] rounded-full bg-surface text-text shadow-[var(--shadow)] hover:text-primary-text'

  return (
    <div className="relative mb-[16px]">
      {edges.left && (
        <button type="button" className={`${arrow} left-0`} aria-label="이전 게임 보기" onClick={() => scroll(-1)}>
          <GSIcon name="chevron" size={16} className="rotate-90" />
        </button>
      )}
      <div
        ref={ref}
        className="flex gap-[8px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ maskImage: mask, WebkitMaskImage: mask }}
        role="group"
        aria-label="담은 게임"
      >
        {children}
      </div>
      {edges.right && (
        <button type="button" className={`${arrow} right-0`} aria-label="다음 게임 보기" onClick={() => scroll(1)}>
          <GSIcon name="chevron" size={16} className="-rotate-90" />
        </button>
      )}
    </div>
  )
}
