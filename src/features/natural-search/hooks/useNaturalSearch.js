import { useCallback, useEffect, useRef, useState } from 'react'
import { getErrorMessage } from '@/shared/lib/apiClient'
import { fetchNaturalSearch } from '../api'
import { normalizeQuery, toNaturalSearchResult } from '../model/naturalSearch'

// 자연어 검색 상태(idle → loading → done | error)를 관리한다. 새 검색을 시작하면 진행 중이던 요청은 취소한다.
export function useNaturalSearch() {
  const [state, setState] = useState({ status: 'idle', result: null, error: '' })
  const controllerRef = useRef(null)

  const search = useCallback(async text => {
    const query = normalizeQuery(text)
    if (!query) return
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setState(current => ({ ...current, status: 'loading', error: '' }))
    try {
      const data = await fetchNaturalSearch({ query, signal: controller.signal })
      if (controller.signal.aborted) return
      setState({ status: 'done', result: toNaturalSearchResult(data), error: '' })
    } catch (error) {
      if (controller.signal.aborted) return
      setState(current => ({
        status: 'error',
        result: current.result,
        error: getErrorMessage(error, '검색하지 못했어요. 잠시 후 다시 시도해주세요.'),
      }))
    }
  }, [])

  useEffect(() => () => controllerRef.current?.abort(), [])

  return { ...state, search }
}
