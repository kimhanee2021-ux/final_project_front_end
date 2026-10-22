import { useCallback, useState } from 'react'
import { useAuth } from '@/features/auth'
import { PcEvaluationContext } from './PcEvaluationContext'
import { usePcEvaluation } from '../hooks/usePcEvaluation'

// 종합평가의 분석 결과(등급·게임별 성능·개선 방향)를 앱 위쪽에서 들고 있어서, 다른 화면에 다녀와도 다시 분석하지 않는다.
// 처음 종합평가 화면에 들어갈 때(activate)부터 분석을 시작하고, 사양이 바뀌거나 계정이 바뀔 때만 새로 분석한다.
// 평가 결과는 계정별로 브라우저에도 저장해서(pcEvaluationStore) 새로고침하거나 다시 들어와도 같은 평가가 나온다.
export default function PcEvaluationProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  // 계정이 바뀌면 이전 계정의 결과를 버리고 처음부터 시작한다.
  return (
    <EvaluationSession key={user?.id ?? user?.email ?? 'guest'} signedIn={isAuthenticated} userId={user?.id ?? null}>
      {children}
    </EvaluationSession>
  )
}

function EvaluationSession({ signedIn, userId, children }) {
  const [active, setActive] = useState(false)
  const activate = useCallback(() => setActive(true), [])
  const evaluation = usePcEvaluation(signedIn, active, userId)
  return <PcEvaluationContext.Provider value={{ ...evaluation, activate }}>{children}</PcEvaluationContext.Provider>
}
