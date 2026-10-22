import { useEffect } from 'react'
import { advance } from '../model/engine'

// 게임이 진행 중이면 40ms마다 시간을 흘려보내고(softRef: S키로 빠르게 내리는 중), 다른 창으로 가면 일시정지한다.
export function useGameLoop({ playing, setGame, softRef, random }) {
  useEffect(() => {
    if (!playing) return
    let last = performance.now()
    const timer = setInterval(() => {
      const now = performance.now(),
        ms = Math.min(100, now - last)
      last = now
      setGame(s => advance(s, ms, softRef.current, random))
    }, 40)
    const visibility = () => {
      if (document.hidden) {
        softRef.current = false
        setGame(s => s.status === 'playing' ? {
          ...s,
          status: 'paused'
        } : s)
      }
    }
    const blur = () => {
      softRef.current = false
      setGame(s => s.status === 'playing' ? {
        ...s,
        status: 'paused'
      } : s)
    }
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('blur', blur)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', visibility)
      window.removeEventListener('blur', blur)
    }
  }, [playing, random, setGame, softRef])
}
