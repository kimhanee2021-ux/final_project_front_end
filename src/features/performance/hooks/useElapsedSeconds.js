import { useEffect, useState } from 'react'

// busy가 null이 아닌 동안 1초마다 경과 시간을 올린다. 0으로 되돌리는 건 부르는 쪽이 정한다.
export function useElapsedSeconds(busy) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (busy === null) return
    const started = Date.now()
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000)
    return () => clearInterval(timer)
  }, [busy])
  return [elapsed, setElapsed]
}
