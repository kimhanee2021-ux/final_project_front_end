import { useCallback, useEffect, useRef, useState } from 'react'
import { MAX_LIMIT, fetchRecommendations, isNoPlayedGames, recommendErrorMessage } from '../api'
import { toRecommendations } from '../model/recommendation'

// 화면이 TOP 3 · 12위까지 · 태그별 9개로 나눠 보여주므로 항상 최대 개수를 한 번에 받는다.
const LIMIT = MAX_LIMIT

// 추천은 모델 추론이라 느리므로, 같은 계정이면 페이지를 오가도 마지막 결과를 재사용한다.
const cache = { userId: null, data: null }

const cachedFor = userId => (cache.userId === userId ? cache.data : null)

// enabled=false면 요청하지 않는다. "추천받기"를 누르기 전에는 모델 추론을 돌리지 않기 위한 값이다.
export function useAiRecommendations(userId, { enabled = true } = {}) {
  const [refresh, setRefresh] = useState(0)
  // 첫 렌더에 캐시가 있으면 그 결과를 그대로 쓰고 첫 요청은 건너뛴다.
  const skipFetch = useRef(enabled && Boolean(userId) && Boolean(cachedFor(userId)))
  const [state, setState] = useState(() => {
    const cached = userId ? cachedFor(userId) : null
    return { data: cached, loading: enabled && Boolean(userId) && !cached, error: '', noPlayed: false }
  })

  useEffect(() => {
    if (!userId || !enabled) return
    if (skipFetch.current) {
      skipFetch.current = false
      return
    }
    const controller = new AbortController()
    setState(current => ({ ...current, loading: true, error: '', noPlayed: false }))
    fetchRecommendations({ limit: LIMIT, signal: controller.signal })
      .then(raw => {
        const data = toRecommendations(raw)
        Object.assign(cache, { userId, data })
        setState({ data, loading: false, error: '', noPlayed: false })
      })
      .catch(error => {
        if (controller.signal.aborted) return
        const noPlayed = isNoPlayedGames(error)
        setState(current => ({
          ...current,
          loading: false,
          noPlayed,
          error: noPlayed ? '' : recommendErrorMessage(error),
        }))
      })
    return () => controller.abort()
  }, [userId, enabled, refresh])

  const reload = useCallback(() => setRefresh(key => key + 1), [])
  return { ...state, reload }
}
