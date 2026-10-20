import { useEffect, useState } from 'react'
import { fetchFeaturedCategories } from '../api'
import { toFeaturedCategory } from '../model/gameModel'
import { getErrorMessage } from '@/shared/lib/apiClient'

// /trending 전용. featured와 마찬가지로 페이지네이션 없이 전체 카테고리 배열을 한 번에 받는다.
export function useFeaturedCategories() {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ key: null, categories: [], error: '' })

  useEffect(() => {
    const controller = new AbortController()
    fetchFeaturedCategories({ signal: controller.signal })
      .then(data => setState({ key: attempt, categories: data.map(toFeaturedCategory), error: '' }))
      .catch(error => {
        if (controller.signal.aborted) return
        setState({ key: attempt, categories: [], error: getErrorMessage(error) })
      })
    return () => controller.abort()
  }, [attempt])

  return {
    categories: state.categories,
    error: state.error,
    loading: state.key !== attempt,
    retry: () => setAttempt(value => value + 1),
  }
}
