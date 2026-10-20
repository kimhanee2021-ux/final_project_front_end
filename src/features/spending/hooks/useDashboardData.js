import { useEffect, useState } from 'react'
import { getDashboardData } from '../demoApi'
export function useDashboardData() {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    getDashboardData()
      .then(data => {
        if (active) setState({ data, loading: false, error: null })
      })
      .catch(error => {
        if (active) setState({ data: null, loading: false, error })
      })
    return () => {
      active = false
    }
  }, [attempt])
  const retry = () => {
    setState({ data: null, loading: true, error: null })
    setAttempt(value => value + 1)
  }
  return { ...state, retry }
}
