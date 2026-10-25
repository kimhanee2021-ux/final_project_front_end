import { useEffect, useState } from 'react'
import { searchErrorMessage, searchGames } from '../api'
import { toSearchResult } from '../model/searchResult'

// 주소의 검색 문장(query)에 맞는 AI 검색 결과. 같은 문장은 api의 캐시를 써서 GPT를 다시 부르지 않는다.
// 늦게 온 이전 문장의 결과가 지금 문장의 결과를 덮지 않도록 문장으로 짝을 맞춘다.
export function useAiSearch(query) {
  const [state, setState] = useState({ query: null, result: null, error: null })

  useEffect(() => {
    if (!query) return
    let current = true
    searchGames(query).then(
      data => { if (current) setState({ query, result: toSearchResult(data), error: null }) },
      error => { if (current) setState({ query, result: null, error: searchErrorMessage(error) }) },
    )
    return () => { current = false }
  }, [query])

  const ready = Boolean(query) && state.query === query
  return {
    loading: Boolean(query) && !ready,
    result: ready ? state.result : null,
    error: ready ? state.error : null,
  }
}
