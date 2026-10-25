import apiClient, { getErrorMessage } from '@/shared/lib/apiClient'
import { validateBriefing } from './model/briefing'

export async function resolveBbsVoiceCommand(transcript, signal) {
  const { data } = await apiClient.post('/api/games/bbs/voice/commands', { transcript }, { signal, timeout: 25000 })
  return data
}

export async function generateBbsSpeech(path, sourceHash, generatedAt, signal) {
  try {
    const { data } = await apiClient.post(`${path}/audio`, { sourceHash, generatedAt }, {
      signal, timeout: 80000, responseType: 'blob',
    })
    if (!(data instanceof Blob) || !data.type.startsWith('audio/wav') || data.size < 44 || data.size > 4320044) throw new Error('Invalid speech audio')
    return data
  } catch (error) {
    const body = error.response?.data
    if (body instanceof Blob && body.size <= 16384 && body.type.includes('json')) {
      try { error.response.data = JSON.parse(await body.text()) } catch { /* Fall back to the local message. */ }
    }
    error.userMessage = getErrorMessage(error, '음성을 만들지 못했어요. 잠시 후 다시 눌러 주세요.')
    throw error
  }
}

export async function readBbsBriefing(path, sourceHash, signal) {
  const { data } = await apiClient.get(path, { params: { sourceHash }, signal })
  return validateBriefing(data, sourceHash)
}

export async function generateBbsBriefing(path, sourceHash, signal) {
  const { data } = await apiClient.post(path, { sourceHash }, { signal, timeout: 55000 })
  return validateBriefing(data, sourceHash)
}

export async function fetchBbsResource(path, signal) {
  const { data } = await apiClient.get(path, { signal })
  return data
}
