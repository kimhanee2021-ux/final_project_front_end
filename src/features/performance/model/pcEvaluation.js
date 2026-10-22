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
// 서버는 GPU 모델을 하나로 확인할 수 없거나 CPU·RAM이 비어 있으면 근거 부족(UNKNOWN)으로 돌려준다.
// 이건 "분석 중"이 아니라 "판정할 수 없음"이라서 unknown으로 따로 알려 준다.
export function overallGrade(result) {
  const band = gradeBands.find(item => item.grade === result?.overallGrade) ?? null
  return { grade: band?.grade ?? null, band, unknown: result?.overallGrade === 'UNKNOWN' }
}

// 등급을 판정할 수 없을 때 보여줄 이유와 해결 방법. GPU 이름에 모델 번호가 없으면(예: 내장 그래픽 이름) 그걸 짚어 준다.
export function unknownGradeHint(specs) {
  const gpu = specs?.gpuModel ?? ''
  if (gpu && !/\d/.test(gpu))
    return `입력한 GPU "${gpu}"에는 모델 번호가 없어요. 내장 그래픽 이름일 수 있어요. 외장 그래픽카드가 있다면 모델명(예: RTX 3070)을 사양 입력에서 고쳐 주세요.`
  if (!gpu) return 'GPU 모델이 입력되지 않아서 등급을 정할 수 없어요. 사양 입력에서 GPU를 적어 주세요.'
  return 'GPU·CPU 모델이나 RAM을 정확히 확인할 수 없거나 GPU가 여러 개로 보여서 등급을 정할 수 없어요. 사양 입력에서 실제로 쓰는 GPU 하나를 모델명까지 적어 주세요.'
}

// 종합 등급 아래에 한 줄로 보여줄 AI 판단 설명. 부품 판정에서 가장 중요한 것 하나만 말한다:
// 교체를 검토할 부품이 있으면 그것, 없으면 확인이 필요한 부품, 모두 괜찮으면 지금 구성으로 충분하다는 말.
// 부품 이름 뒤에 받침에 따라 달라지는 조사를 붙이지 않도록 "교체를 검토해 보세요"처럼 이름과 조사가 이어지지 않게 쓴다.
// 아직 판정이 하나도 없으면 빈 문자열이다.
export function gradeOneLiner(judgements) {
  if (!judgements.some(item => item.verdict)) return ''
  const names = verdict => judgements.filter(item => item.verdict?.label === verdict.label).map(item => item.label).join(' · ')
  const upgrade = names(VERDICTS.UPGRADE)
  if (upgrade) return `AI 판단: ${upgrade} 교체를 검토해 보세요.`
  const check = names(VERDICTS.CHECK)
  if (check) return `AI 판단: ${check} 상태를 한 번 확인해 보세요.`
  return 'AI 판단: 모든 부품이 유지 가능해요. 지금 구성으로 충분히 즐길 수 있어요.'
}
