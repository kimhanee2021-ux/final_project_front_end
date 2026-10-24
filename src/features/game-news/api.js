import apiClient, { API_BASE_URL, browserStores } from '@/shared/lib/apiClient'
import { readAccessToken } from '@/shared/lib/tokenStorage'
import { readSpeechEvents } from './model/newsPcmStream'

export async function transcribeNewsAudio(audio, appId, signal) {
  const form = new FormData()
  const mime = audio.type.split(';')[0]
  const extension = mime === 'audio/mp4' ? 'mp4' : mime === 'audio/ogg' ? 'ogg' : 'webm'
  form.append('audio', audio, `speech.${extension}`)
  if (appId) form.append('appId', String(appId))
  const { data } = await apiClient.post('/api/games/news/transcribe', form, {
    signal, timeout: 40000, headers: { 'Content-Type': undefined },
  })
  return data.transcript
}

// BBS는 저장된 데이터 조회만 수행한다. 수집·AI 생성 요청을 보내지 않는다.
export async function fetchNewsResource(path, signal) {
  const { data } = await apiClient.get(path, { signal })
  return data
}

export async function resolveNewsGame(payload, signal) {
  const { data } = await apiClient.post('/api/games/resolve', payload, { signal, withCredentials: true })
  return data
}

export async function interpretNewsVoice(payload, signal) {
  const { data } = await apiClient.post('/api/games/news/voice-intent', payload, { signal, withCredentials: true, timeout: 45000 })
  return data
}

export async function requestNewsSpeech(text, signal) {
  try {
    const { data } = await apiClient.post('/api/games/news/speech', { text }, {
      signal, responseType: 'blob', timeout: 60000, withCredentials: true,
    })
    if (!data.size || !data.type.startsWith('audio/')) throw new Error('Invalid speech audio')
    return data
  } catch (error) {
    const blob = error.response?.data
    if (blob instanceof Blob && blob.type.includes('json')) {
      try { error.speechMessage = JSON.parse(await blob.text()).error } catch { /* use the playback message */ }
    }
    throw error
  }
}


export async function streamNewsSpeech(text, signal, onChunk) {
  const token = readAccessToken(browserStores())
  const headers = { 'Content-Type': 'application/json', Accept: 'text/event-stream' }
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(`${API_BASE_URL}/api/games/news/speech/stream`, {
    method: 'POST', headers, body: JSON.stringify({ text }), credentials: 'include', signal,
  })
  await readSpeechEvents(response, onChunk)
}
