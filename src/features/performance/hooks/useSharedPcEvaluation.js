import { useContext } from 'react'
import { PcEvaluationContext } from '../context/PcEvaluationContext'

// Provider 밖에서 쓰면 Error를 던진다.
export function useSharedPcEvaluation() {
  const context = useContext(PcEvaluationContext)
  if (!context) throw new Error('useSharedPcEvaluation은 PcEvaluationProvider 안에서만 사용할 수 있습니다.')
  return context
}
