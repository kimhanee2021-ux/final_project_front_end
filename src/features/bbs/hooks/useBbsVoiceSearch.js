import { useCallback, useEffect, useRef, useState } from 'react'
import { LiveVoice } from '../model/liveVoice'

const idle = { phase: 'IDLE', message: '', transcript: '' }

export function useBbsVoiceSearch(onTranscript) {
  const [state, setState] = useState(idle)
  const active = useRef(null)
  const callback = useRef(onTranscript)
  useEffect(() => { callback.current = onTranscript }, [onTranscript])

  const release = useCallback(() => {
    const session = active.current
    active.current = null
    session?.recorder.cancel()
  }, [])
  const cancel = useCallback(() => { release(); setState(idle) }, [release])
  useEffect(() => {
    const visibility = () => { if (document.hidden) cancel() }
    const keyboard = event => { if (event.key === 'Escape') cancel() }
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('keydown', keyboard)
    return () => {
      release()
      document.removeEventListener('visibilitychange', visibility)
      window.removeEventListener('keydown', keyboard)
    }
  }, [release, cancel])

  const start = () => {
    release()
    const session = { recorder: null }
    const current = () => active.current === session
    session.recorder = new LiveVoice({
      onReady: () => { if (current()) setState({ phase: 'LISTENING', message: '게임 이름이나 음성 제어를 말씀해 주세요.', transcript: '' }) },
      onPartial: transcript => { if (current()) setState(previous => ({ ...previous, transcript })) },
      onFinishing: () => { if (current()) setState({ phase: 'TRANSCRIBING', message: '말씀하신 요청을 확인하고 있어요.', transcript: '' }) },
      onError: message => { if (current()) { release(); setState({ phase: 'ERROR', message, transcript: '' }) } },
      onTranscript: transcript => {
        if (!current()) return
        active.current = null
        setState(idle)
        callback.current(transcript)
      },
    })
    active.current = session
    setState({ phase: 'STARTING', message: '마이크를 준비하고 있어요.', transcript: '' })
    void session.recorder.start()
  }
  return { ...state, start, cancel }
}
