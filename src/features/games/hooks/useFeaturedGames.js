import { useEffect, useState } from 'react'
import { fetchFeaturedGames } from '../api'
import { toFeaturedGame } from '../gameModel'
import { getErrorMessage } from '../../../utils/apiClient'

// /explore 전용. 백엔드가 페이지네이션 없이 전체 배열을 내려주므로 한 번만 받아오고,
// 화면 쪽 무한 스크롤은 이미 받은 배열을 점진적으로 더 보여주는 방식(ExplorePage)으로 처리한다.
export function useFeaturedGames() {
  const [attempt, setAttempt] = useState(0)
  // key가 attempt와 다르면 아직 이번 시도의 응답이 안 왔다는 뜻이라 로딩으로 본다.
  const [state, setState] = useState({ key: null, games: [], error: '' })

  useEffect(() => {
    const controller = new AbortController()
    fetchFeaturedGames({ signal: controller.signal })
      .then(data => setState({ key: attempt, games: data.map(toFeaturedGame), error: '' }))
      .catch(error => {
        if (controller.signal.aborted) return
        setState({ key: attempt, games: [], error: getErrorMessage(error) })
      })
    return () => controller.abort()
  }, [attempt])

  return {
    games: state.games,
    error: state.error,
    loading: state.key !== attempt,
    retry: () => setAttempt(value => value + 1),
  }
}
