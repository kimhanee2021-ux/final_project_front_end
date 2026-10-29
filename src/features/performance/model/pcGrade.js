export const gradeBands = [
  { grade: 'A', min: 144, label: '144 FPS 이상', status: '매우 쾌적' },
  { grade: 'B', min: 60, label: '60 이상~144 미만', status: '쾌적' },
  { grade: 'C', min: 30, label: '30 이상~60 미만', status: '보통 · 옵션 조절 권장' },
  { grade: 'D', min: 20, label: '20 이상~30 미만', status: '개선 권장' },
  { grade: 'E', min: 0, label: '20 FPS 미만', status: '개선 필요' },
]
// 등급을 못 낸 이유를 두 갈래로 나눠 보여준다.
// 사용자가 고칠 수 있는 입력 문제(GPU 모델 · CPU/RAM 미확인)는 그 이유를 그대로 알려주고,
// 그 밖(비교 근거 · 해상도 자료 · 공식 사양 부족 등)은 외부에 공개된 성능 자료가 없는 경우로 안내한다.
const NO_PUBLIC_DATA = {
  label: '성능 자료 미공개',
  reason: '이 게임의 해상도별 성능 자료가 아직 공개되지 않았어요.',
}
function unknownTarget(target) {
  if (target.reasonCode === 'UNKNOWN_GPU') return { label: 'GPU 확인 필요', reason: target.reason }
  // MISSING_REQUIREMENTS는 내 PC(CPU · RAM) 미입력과 게임 공식 사양 미확인이 함께 쓰는 코드라 사유 문장으로 구분한다.
  if (target.reasonCode === 'MISSING_REQUIREMENTS' && !target.reason?.includes('공식'))
    return { label: '사양 확인 필요', reason: target.reason }
  return NO_PUBLIC_DATA
}
export function resolutionTarget(result, resolution) {
  if (result?.explanationStatus !== 'READY')
    return {
      grade: null,
      label: result?.explanationStatus === 'RATE_LIMITED' ? '이용 한도 · 일시 중단' : 'AI 분석 미완료',
      reason: '성능 추정 결과가 아니에요. 분석 상태 안내를 확인해 주세요.',
    }
  const target = result.resolutions?.find(r => r.name === resolution)?.target
  const band = gradeBands.find(b => b.grade === target?.grade)
  if (target?.method !== 'AI_TARGET_BAND_V1')
    return {
      grade: null,
      label: '다시 분석 필요',
      reason: '새 해상도별 추정 결과가 없어요. 다시 분석하면 확인할 수 있어요.',
    }
  if (!band) return { ...target, grade: null, ...unknownTarget(target) }
  return {
    ...target,
    grade: band.grade,
    label: band.status,
    reason: target.reason || '성능 비교에 필요한 정보가 부족해요.',
  }
}
export function latestOverallResult(results) {
  return Object.values(results ?? {})
    .filter(
      r =>
        r.explanationStatus === 'READY' &&
        Array.isArray(r.overallExplanation) &&
        r.overallExplanation.length === 4 &&
        r.overallExplanation.every(s => typeof s === 'string' && s.trim())
    )
    .sort((a, b) => (b.summaryBatch ?? 0) - (a.summaryBatch ?? 0))[0]
}
// AI가 PC 전체에 대해 작성한 설명만 사용한다. 개별 게임 문장을 종합 설명으로 조립하지 않는다.
export function overallPerformanceExplanation(results) {
  const ready = Object.values(results ?? {}).filter(r => r.explanationStatus === 'READY')
  const overall = latestOverallResult(results)
  if (overall)
    return overall.overallExplanation.map(
      (text, i) => `${['현재 성능', '제한 요인', '설정 조언', '업그레이드 방향'][i]}: ${text.trim()}`
    )
  return [
    ready.length
      ? '이전 분석에는 PC 종합 설명이 포함되지 않았어요. 새로 분석하면 확인할 수 있어요.'
      : 'AI 분석이 완료되면 성능 제한 이유와 설정 조언을 보여드려요.',
  ]
}
