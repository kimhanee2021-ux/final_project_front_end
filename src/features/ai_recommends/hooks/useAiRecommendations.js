import { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_LIMIT, fetchRecommendations, isNoPlayedGames, recommendErrorMessage } from '../api'
import { toRecommendations } from '../model/recommendation'

// 추천은 모델 추론이라 느리므로, 같은 계정·같은 개수면 페이지를 오가도 마지막 결과를 재사용한다.
const cache = { userId: null, limit: null, data: null }

const cachedFor = (userId, limit) => (cache.userId === userId && cache.limit === limit ? cache.data : null)

// enabled=false면 요청하지 않는다. "진단하기"를 누르기 전에는 모델 추론을 돌리지 않기 위한 값이다.
export function useAiRecommendations(userId, { enabled = true } = {}) {
  const [limit, setLimit] = useState(DEFAULT_LIMIT)
  const [refresh, setRefresh] = useState(0)
  // 첫 렌더에 캐시가 있으면 그 결과를 그대로 쓰고 첫 요청은 건너뛴다.
  const skipFetch = useRef(enabled && Boolean(userId) && Boolean(cachedFor(userId, DEFAULT_LIMIT)))
  const [state, setState] = useState(() => {
    const cached = userId ? cachedFor(userId, DEFAULT_LIMIT) : null
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
    fetchRecommendations({ limit, signal: controller.signal })
      .then(raw => {
        const data = toRecommendations(raw)
        Object.assign(cache, { userId, limit, data })
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
  }, [userId, enabled, limit, refresh])

  const reload = useCallback(() => setRefresh(key => key + 1), [])
  return { ...state, limit, setLimit, reload }
}
