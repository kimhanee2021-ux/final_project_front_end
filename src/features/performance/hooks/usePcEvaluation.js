import { useEffect } from 'react'
import { usePcDiagnosis } from './usePcDiagnosis'
import { usePcGameList } from './usePcGameList'
import { usePcSpecs } from './usePcSpecs'
import { componentJudgements, evaluationStatus, overallGrade } from '../model/pcEvaluation'
import { toDiagnosisSpecs } from '../model/pcSpecs'

// 종합평가 화면이 쓰는 모든 상태를 한곳에서 만든다.
// 사양 입력 창에서 저장한 사양은 로그인했고 AI 분석에 동의했을 때만 진단(AI 분석)에 넘기고, 사양이 바뀌면 다시 넘긴다.
export function usePcEvaluation(signedIn) {
  const { specs, detail, aiConsent, hasSavedSpecs } = usePcSpecs()
  const status = evaluationStatus({ hasSavedSpecs, signedIn, aiConsent })
  const ready = status === 'ready'
  const diagnosis = usePcDiagnosis()
  const gameList = usePcGameList(diagnosis, ready)
  const specsKey = JSON.stringify([specs, detail])

  useEffect(() => {
    if (ready) diagnosis.applySpecs(toDiagnosisSpecs(specs, detail))
  }, [specsKey, ready]) // eslint-disable-line react-hooks/exhaustive-deps

  const overview = diagnosis.overviewResult
  return {
    status,
    ready,
    diagnosis,
    gameList,
    specs: ready ? diagnosis.specs : null,
    overview,
    judgements: componentJudgements(overview),
    grade: overallGrade(overview),
    analyzing: diagnosis.busy !== null,
  }
}
