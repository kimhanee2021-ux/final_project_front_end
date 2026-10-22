import { useCallback, useEffect, useState } from 'react'
import { fetchRecommendations } from '../api'
import { isNoPlayedGames, recommendationErrorMessage, toCard } from '../model/recommendationModel'

// 같은 요청이 겹쳐도(개발 모드가 효과를 두 번 실행하는 경우 등) 서버에는 한 번만 보낸다.
let inFlight = null
function load() {
  if (!inFlight) {
    inFlight = fetchRecommendations().finally(() => {
      inFlight = null
    })
  }
  return inFlight
}

// 내 추천 목록. status: 'loading' | 'ready' | 'empty'(플레이한 게임이 없음) | 'error'
export function useRecommendations() {
  const [state, setState] = useState({ status: 'loading', cards: [], meta: null, error: '' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    load()
      .then(data => {
        if (active) setState({ status: 'ready', cards: data.recommendations.map(toCard), meta: data.meta, error: '' })
      })
      .catch(error => {
        if (!active) return
        const message = recommendationErrorMessage(error)
        setState({ status: isNoPlayedGames(error) ? 'empty' : 'error', cards: [], meta: null, error: message })
      })
    return () => {
      active = false
    }
  }, [attempt])

  // 다시 시도하면 로딩 표시로 돌리고 같은 요청을 새로 보낸다
  const retry = useCallback(() => {
    setState({ status: 'loading', cards: [], meta: null, error: '' })
    setAttempt(count => count + 1)
  }, [])

  return { ...state, retry }
}
