import { useEffect, useRef, useState } from 'react'

// 이미 받아 둔 배열을 pageSize만큼씩 점진적으로 더 보여주는 무한 스크롤 훅.
// 반환된 sentinelRef를 목록 끝의 빈 요소에 달면, 그 요소가 화면에 가까워질 때 다음 묶음을 연다.
// resetKey가 바뀌면(예: 검색어) 다시 처음 pageSize개부터 보여준다.
export function useInfiniteSlice(items, pageSize, resetKey) {
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const sentinelRef = useRef(null)
  const hasMore = visibleCount < items.length

  // 렌더 중 조정 — 리액트가 공식으로 지원하는 "prop 변경에 따른 state 초기화" 패턴.
  const [previousKey, setPreviousKey] = useState(resetKey)
  if (previousKey !== resetKey) {
    setPreviousKey(resetKey)
    setVisibleCount(pageSize)
  }

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) setVisibleCount(count => count + pageSize)
      },
      { rootMargin: '400px' }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, pageSize])

  return { visibleItems: items.slice(0, visibleCount), hasMore, sentinelRef }
}
