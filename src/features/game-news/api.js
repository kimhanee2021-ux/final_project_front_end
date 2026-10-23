import apiClient from '@/shared/lib/apiClient'

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
  const { data } = await apiClient.post('/api/games/news/voice-intent', payload, { signal, withCredentials: true })
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
