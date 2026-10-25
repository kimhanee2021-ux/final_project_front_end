import { useEffect, useState } from 'react'
import { getErrorMessage } from '@/shared/lib/apiClient'
import { fetchBbsResource } from '../api'

// Key each result to its request. A slow previous search must never replace the current one.
export function useBbsResource(path) {
  const [revision, setRevision] = useState(0)
  const [result, setResult] = useState(null)
  const key = `${path ?? ''}:${revision}`

  useEffect(() => {
    if (!path) return
    const controller = new AbortController()
    let current = true
    fetchBbsResource(path, controller.signal).then(
      data => { if (current) setResult({ key, data, error: null }) },
      error => {
        if (current && !controller.signal.aborted) {
          setResult({ key, data: null, error: getErrorMessage(error, '게임을 불러오지 못했어요. 다시 시도해 주세요.') })
        }
      },
    )
    return () => { current = false; controller.abort() }
  }, [path, key])

  const ready = Boolean(path && result?.key === key)
  return {
    data: ready ? result.data : null,
    error: ready ? result.error : null,
    loading: Boolean(path && !ready),
    retry: () => setRevision(value => value + 1),
  }
}
