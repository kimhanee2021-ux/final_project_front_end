import { useEffect, useState } from 'react'
import { fetchPosts } from '../api'
import { getErrorMessage } from '@/shared/lib/apiClient'

const SEARCH_DELAY = 300

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
  posts: [...previous, ...data.content],
  page: data.page,
  total: data.totalElements,
  last: data.last,
  error: '',
})

// 커뮤니티 목록. 카테고리/검색어가 바뀌면 처음부터 다시 불러오고, '더보기'는 다음 페이지만 이어붙인다.
export function useBoardPosts({ category, query, enabled = true }) {
  const keyword = useDebouncedValue(query.trim(), SEARCH_DELAY)
  const [attempt, setAttempt] = useState(0)
  const key = `${category}|${keyword}|${attempt}|${enabled}`
  const [state, setState] = useState({ key: null, posts: [], page: 0, total: 0, last: true, error: '' })
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    fetchPosts({ page: 0, category, keyword, signal: controller.signal })
      .then(data => setState(pageState(key, data)))
      .catch(error => {
        if (controller.signal.aborted) return
        setState({ key, posts: [], page: 0, total: 0, last: true, error: getErrorMessage(error) })
      })
    return () => controller.abort()
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = async () => {
    if (loadingMore || state.last || state.key !== key) return
    setLoadingMore(true)
    try {
      const data = await fetchPosts({ page: state.page + 1, category, keyword })
      setState(current => (current.key === key ? pageState(key, data, current.posts) : current))
    } catch (error) {
      setState(current => (current.key === key ? { ...current, error: getErrorMessage(error) } : current))
    } finally {
      setLoadingMore(false)
    }
  }

  return {
    ...state,
    loading: enabled && state.key !== key,
    loadingMore,
    loadMore,
    retry: () => setAttempt(value => value + 1),
  }
}
