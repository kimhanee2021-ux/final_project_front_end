// An explicit done event distinguishes a complete response from a broken connection.
export async function readSpeechEvents(response, onChunk) {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw Object.assign(new Error('Speech request failed'), { speechMessage: body.error })
  }
  if (!response.body || !response.headers.get('content-type')?.includes('text/event-stream')) throw new Error('Invalid speech stream')
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let pending = '', complete = false
  try {
    while (true) {
      const { value, done } = await reader.read()
      pending += decoder.decode(value, { stream: !done }).replace(/\r/g, '')
      let end
      while ((end = pending.indexOf('\n\n')) !== -1) {
        const event = pending.slice(0, end)
        pending = pending.slice(end + 2)
        const name = event.split('\n').find(line => line.startsWith('event:'))?.slice(6).trim()
        const data = event.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n')
        if (!data) continue
        const payload = JSON.parse(data)
        if (name === 'error') throw Object.assign(new Error('Speech failed'), { speechMessage: payload.error })
        if (name === 'audio' && !complete) onChunk(Uint8Array.from(atob(payload.pcm), char => char.charCodeAt(0)))
        if (name === 'done') complete = true
      }
      if (pending.length > 1_000_000) throw new Error('Speech event too large')
      if (done) break
    }
    if (!complete) throw new Error('Speech stream interrupted')
  } finally {
    await reader.cancel().catch(() => {})
    reader.releaseLock()
  }
}
