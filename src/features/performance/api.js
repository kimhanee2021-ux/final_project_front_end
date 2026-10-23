import apiClient from '@/shared/lib/apiClient'
import { createAiRequest } from '@/shared/lib/aiRequest'

// PC 진단 AI 요청: 응답이 오래 걸릴 수 있어 시간 제한 없이 기다리고, 실패하면 서버 메시지로 Error를 만든다.
const api = createAiRequest(apiClient)

export function extractPcPhoto(file, signal, provider) {
  const body = new FormData()
  body.append('image', file)
  if (provider) body.append('provider', provider)
  return api('/ai/pc/extract', { method: 'POST', body, signal })
}
export function loadPcProvider(signal) {
  return api('/ai/pc/provider', { signal })
}
export function assessPc(specs, appId, signal) {
  return api('/ai/pc/assess', { method: 'POST', body: { specs, appId }, signal })
}
export function searchPcGames(keyword, signal) {
  return api(`/ai/pc/games?keyword=${encodeURIComponent(keyword)}`, { signal })
}
export function loadPcParts(signal) {
  return api('/ai/pc/parts', { signal })
}
export function assessPcOverview(specs, appIds, signal) {
  return api('/ai/pc/overview', { method: 'POST', body: { specs, appIds }, signal })
}

export function assessPcBatch(specs, appIds, signal) {
  return api('/ai/pc/assess-batch', { method: 'POST', body: { specs, appIds }, signal })
}
