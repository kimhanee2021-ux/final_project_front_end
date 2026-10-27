import { useCallback, useEffect, useState } from 'react'
import { fetchBudget, saveBudget } from '../api'
import { getErrorMessage } from '@/shared/lib/apiClient'

// 이번 달 게임 지출 예산 (코치가 남은 예산을 계산할 때 쓴다)
// enabled=false면 서버에 묻지 않는다(로그인 전 화면에서 같은 훅을 쓸 때).
export function useBudget({ enabled = true } = {}) {
  const [state, setState] = useState({ budget: null, loading: enabled, saving: false, error: '' })

  useEffect(() => {
    if (!enabled) return undefined
    let active = true
    fetchBudget()
      .then(budget => { if (active) setState({ budget, loading: false, saving: false, error: '' }) })
      .catch(error => { if (active) setState(current => ({ ...current, loading: false, error: getErrorMessage(error) })) })
    return () => { active = false }
  }, [enabled])

  const save = useCallback(async limitAmount => {
    setState(current => ({ ...current, saving: true, error: '' }))
    try {
      const budget = await saveBudget(limitAmount)
      setState({ budget, loading: false, saving: false, error: '' })
      return true
    } catch (error) {
      setState(current => ({ ...current, saving: false, error: getErrorMessage(error) }))
      return false
    }
  }, [])

  return { ...state, save }
}
