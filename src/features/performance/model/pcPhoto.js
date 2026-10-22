import { gpuCandidates } from './pcHardware.js'
import { normalizeSpecs } from './pcDiagnosis.js'

// 서버가 알려 주는 AI 연결 방식 중 화면이 아는 것만 받는다
export const KNOWN_PROVIDERS = ['Groq', 'Gemini', 'Gemini → Groq', 'Groq ↔ Gemini']

// 사진: JPG·PNG·WEBP, 10MB 이하
export const isAcceptedPhoto = file => ['image/png', 'image/jpeg', 'image/webp'].includes(file.type) && file.size <= 10485760

// 동의 문구 가운데 "어느 AI에 어떻게 보내는지" 부분
export function providerSendText(provider) {
  if (provider === 'Groq ↔ Gemini') return '사진·큰 요청은 Gemini, 짧은 요청은 Groq에 우선 전송하고 이용 제한 시 다른 AI에도 전송해'
  if (provider === 'Gemini → Groq') return 'Gemini에 우선 전송하고, 제한·혼잡 시 Groq에도 전송해'
  return `${provider ?? 'AI 서비스(확인 중)'}에 전송해`
}

// AI가 읽은 사양 → 확인 화면의 처음 값. GPU 후보가 여럿이면 하나를 고르게 비워 둔다.
export function reviewValuesOf(specs) {
  const choices = gpuCandidates(specs.gpuModel)
  return {
    gpus: choices,
    values: {
      ...specs,
      deviceType: /laptop|mobile|max-q/i.test(specs.gpuModel) ? 'LAPTOP' : 'UNKNOWN',
      ...(choices.length > 1 ? { gpuModel: '', gpuMemory: '' } : {}),
    },
  }
}

// 확인 화면에서 고친 값을 분석에 쓸 사양으로 바꾼다. 쓸 수 없으면 이유를 담은 Error를 던진다.
export function confirmedSpecs(values, gpus) {
  const pc = normalizeSpecs(values)
  if (gpuCandidates(pc.gpuModel).length > 1) throw new Error('분석할 GPU 하나만 입력해 주세요.')
  if (gpus.length > 1 && !pc.gpuModel) throw new Error('분석에 사용할 GPU를 선택해 주세요.')
  if (!pc.cpuModel && !pc.gpuModel && !pc.ramGB) throw new Error('CPU·GPU·RAM 중 확인할 수 있는 사양을 입력해 주세요.')
  return pc
}
