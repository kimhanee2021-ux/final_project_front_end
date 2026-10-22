import { useEffect, useState } from 'react'

const DURATION_MS = 900

// 큰 숫자가 0에서 목표값까지 올라가며 보이는 카운트업. 처음 나타날 때와 value가 바뀔 때 움직인다.
// format은 숫자를 화면 글자로 바꾸는 함수(예: money). 모션 줄이기 설정이면 움직이지 않고 최종 값만 보여준다.
// 화면 읽기 도구에는 움직이는 중간 값이 아니라 최종 값만 읽히게 한다.
export default function CountUp({ value, format = number => String(Math.round(number)) }) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [shown, setShown] = useState(0)

  useEffect(() => {
    if (reduced) return
    let frame
    const startedAt = performance.now()
    const tick = now => {
      const progress = Math.min((now - startedAt) / DURATION_MS, 1)
      // 끝으로 갈수록 천천히 멈추도록 easeOut
      setShown(value * (1 - Math.pow(1 - progress, 3)))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, reduced])

  return (
    <span aria-label={format(value)}>
      <span aria-hidden="true">{format(reduced ? value : shown)}</span>
    </span>
  )
}
