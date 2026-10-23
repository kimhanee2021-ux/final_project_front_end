import { useCallback, useEffect, useState } from 'react'
import { fetchInsightOverview } from '../api'
import { insightErrorMessage } from '../model/insightModel'
import { getErrorMessage } from '@/shared/lib/apiClient'

// 요청이 겹쳐도(개발 모드가 효과를 두 번 실행하는 경우 등) 서버에는 한 번만 보낸다. 끝나면 지워서 다음 방문에는 다시 묻는다.
let inFlight = null
function load() {
  if (!inFlight) {
    inFlight = fetchInsightOverview().finally(() => {
      inFlight = null
    })
  }
  return inFlight
}

// AI 분석 화면 개요(소비 유형과 고를 수 있는 태그). status: 'loading' | 'ready' | 'error'
export function useInsightOverview() {
  const [state, setState] = useState({ status: 'loading', overview: null, error: '' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    load()
      .then(overview => { if (active) setState({ status: 'ready', overview, error: '' }) })
      .catch(error => {
        if (active) {
          const message = insightErrorMessage(error?.response?.data?.code, getErrorMessage(error))
          setState({ status: 'error', overview: null, error: message })
        }
      })
    return () => { active = false }
  }, [attempt])

  // 다시 시도하면 로딩 표시로 돌리고 같은 요청을 새로 보낸다
  const retry = useCallback(() => {
    setState({ status: 'loading', overview: null, error: '' })
    setAttempt(count => count + 1)
  }, [])

  return { ...state, retry }
}
