import { useEffect, useState } from 'react'
import { fetchNewsResource } from '../api'
import { getErrorMessage } from '@/shared/lib/apiClient'

export function useNewsResource(path) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ key: null, data: null, error: '', status: null })
  const key = `${path}:${attempt}`
  useEffect(() => {
    if (!path) return
    const controller = new AbortController()
    fetchNewsResource(path, controller.signal)
      .then(data => {
        if (!controller.signal.aborted) setState({ key, data, error: '', status: 200 })
      })
      .catch(error => {
        if (controller.signal.aborted) return
        setState({ key, data: null, error: error.request && !error.response ? '서버와 연결할 수 없어요. 잠시 후 다시 시도해 주세요.' : getErrorMessage(error, '소식을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'), status: error.response?.status })
      })
    return () => controller.abort()
  }, [path, key])
  const current = Boolean(path) && state.key === key
  return {
    data: current ? state.data : null,
    error: current ? state.error : '',
    status: current ? state.status : null,
    loading: Boolean(path) && !current,
    retry: () => setAttempt(value => value + 1),
  }
}
