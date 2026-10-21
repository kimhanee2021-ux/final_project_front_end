import { useCallback, useEffect, useState } from 'react'
import { fetchInsight } from '../api'
import { insightErrorMessage } from '../insightModel'
import { getErrorMessage } from '@/shared/lib/apiClient'

// 같은 태그의 요청이 겹쳐도 서버에는 한 번만 보낸다. 끝나면 지워서 다음에 고를 때는 다시 묻는다 (서버가 저장해 둔 결과를 바로 돌려준다).
const inFlight = {}
function load(topic) {
  if (!inFlight[topic]) {
    inFlight[topic] = fetchInsight(topic).finally(() => {
      delete inFlight[topic]
    })
  }
  return inFlight[topic]
}

// 태그 하나의 AI 결과 카드. status: 'loading' | 'ready' | 'error'
// 태그를 바꾸면 컴포넌트를 key로 새로 만들어 쓰므로 topic은 컴포넌트가 사는 동안 바뀌지 않는다고 본다.
export function useTopicInsight(topic) {
  const [state, setState] = useState({ status: 'loading', insight: null, error: '' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    load(topic)
      .then(insight => { if (active) setState({ status: 'ready', insight, error: '' }) })
      .catch(error => {
        if (active) {
          const message = insightErrorMessage(error?.response?.data?.code, getErrorMessage(error))
          setState({ status: 'error', insight: null, error: message })
        }
      })
    return () => { active = false }
  }, [topic, attempt])

  // 다시 시도하면 로딩 표시로 돌리고 같은 요청을 새로 보낸다
  const retry = useCallback(() => {
    setState({ status: 'loading', insight: null, error: '' })
    setAttempt(count => count + 1)
  }, [])

  return { ...state, retry }
}
