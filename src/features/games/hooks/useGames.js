import { useEffect, useState } from 'react'
import { fetchGames, searchGames } from '../api'
import { toGame } from '../gameModel'
import { getErrorMessage } from '../../../utils/apiClient'

const SEARCH_DELAY = 300

// 검색어가 있으면 이름 검색 API, 없으면 장르 목록 API를 쓴다. (검색 API는 장르 필터를 받지 않는다)
const request = ({ name, genre, page, signal }) =>
  name ? searchGames({ name, page, signal }) : fetchGames({ genre, page, signal })

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timeout)
  }, [value, delay])
  return debounced
}

const pageState = (key, data, previous = []) => ({
  key,
  games: [...previous, ...data.content.map(toGame)],
  page: data.page,
  total: data.totalElements,
  last: data.last,
  error: '',
})

export function useGames({ query, genre }) {
  const name = useDebouncedValue(query.trim(), SEARCH_DELAY)
  const [attempt, setAttempt] = useState(0)
  // 조건이 바뀌면 key가 달라지고, 응답이 오기 전까지 이전 결과 대신 로딩 상태로 본다.
  const key = `${name}|${genre}|${attempt}`
  const [state, setState] = useState({ key: null, games: [], page: 0, total: 0, last: true, error: '' })
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    request({ name, genre, page: 0, signal: controller.signal })
      .then(data => setState(pageState(key, data)))
      .catch(error => {
        if (controller.signal.aborted) return
        setState({ key, games: [], page: 0, total: 0, last: true, error: getErrorMessage(error) })
      })
    return () => controller.abort()
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = async () => {
    if (loadingMore || state.last || state.key !== key) return
    setLoadingMore(true)
    try {
      const data = await request({ name, genre, page: state.page + 1 })
      setState(current => (current.key === key ? pageState(key, data, current.games) : current))
    } catch (error) {
      setState(current => (current.key === key ? { ...current, error: getErrorMessage(error) } : current))
    } finally {
      setLoadingMore(false)
    }
  }

  return {
    ...state,
    searching: Boolean(name),
    loading: state.key !== key,
    loadingMore,
    loadMore,
    retry: () => setAttempt(value => value + 1),
  }
}
