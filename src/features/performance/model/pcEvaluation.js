import { gradeBands } from './pcGrade.js'

// 종합평가 화면이 쓰는 순수 함수들. 화면은 이 결과만 받아서 그린다.

// 사양 입력 → 로그인 → AI 분석 동의 순서로 확인하고, 모두 갖췄을 때만 'ready'.
export function evaluationStatus({ hasSavedSpecs, signedIn, aiConsent }) {
  if (!hasSavedSpecs) return 'no-specs'
  if (!signedIn) return 'login'
  if (!aiConsent) return 'consent'
  return 'ready'
}

// 분석할 수 없을 때 각 칸 안에 보여줄 안내 문구
export const STATUS_MESSAGES = {
  'no-specs': '아직 입력한 사양이 없어서 확인할 수 없어요.',
  login: '로그인하지 않아 입력한 부품을 확인할 수 없어요. 로그인하면 내 PC 기준으로 분석해요.',
  consent: 'AI 분석 동의가 없어서 입력한 부품을 확인할 수 없어요. 사양 입력에서 동의를 켜주세요.',
}

const COMPONENT_CATEGORIES = [
  { category: 'CPU', label: 'CPU', icon: 'cpu' },
  { category: 'GPU', label: 'GPU', icon: 'gpu' },
  { category: 'RAM', label: 'RAM', icon: 'ram' },
  { category: 'SSD', label: '저장장치', icon: 'drive' },
]

// 백엔드가 숫자 점수를 주지 않아서, 부품별 판정을 그래프 모양을 위한 값으로만 바꾼다. 측정 점수가 아니다.
export const VERDICTS = {
  KEEP: { label: '유지 가능', value: 90 },
  CHECK: { label: '확인 필요', value: 60 },
  UPGRADE: { label: '교체 검토', value: 35 },
}

// 종합 분석 결과(result)에서 부품 네 개의 판정을 뽑는다. 분석 전이면 판정(verdict)이 null이다.
export function componentJudgements(result) {
  const ready = result?.explanationStatus === 'READY'
  return COMPONENT_CATEGORIES.map(item => {
    const advice = ready
      ? ((result.componentAdvice ?? []).find(entry => entry.category === item.category) ?? null)
      : null
    const verdict = advice ? (VERDICTS[advice.status] ?? VERDICTS.CHECK) : null
    return { ...item, advice, verdict, value: verdict?.value ?? 0 }
  })
}

// 종합 등급(A~E). 알 수 없는 값이면 band가 null이다.
export function overallGrade(result) {
  const band = gradeBands.find(item => item.grade === result?.overallGrade) ?? null
  return { grade: band?.grade ?? null, band }
}
