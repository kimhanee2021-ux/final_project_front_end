import { useCallback, useEffect, useRef, useState } from 'react'
import { LiveVoice } from '../model/liveVoice'

const idle = { phase: 'IDLE', message: '', transcript: '' }
// 마이크는 한 번에 하나만 쓴다 (헤더의 작은 음성 버튼과 AI 게임 검색 화면의 큰 버튼). 하나가 시작하면 다른 쪽은 취소한다
const VOICE_START = 'bbs:voice-start'

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
    const other = event => { if (active.current && event.detail !== active.current) cancel() }
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('keydown', keyboard)
    window.addEventListener(VOICE_START, other)
    return () => {
      release()
      document.removeEventListener('visibilitychange', visibility)
      window.removeEventListener('keydown', keyboard)
      window.removeEventListener(VOICE_START, other)
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
    window.dispatchEvent(new CustomEvent(VOICE_START, { detail: session }))
    setState({ phase: 'STARTING', message: '마이크를 준비하고 있어요.', transcript: '' })
    void session.recorder.start()
  }
  // 주변 소음 때문에 말이 끝난 걸 알아채지 못할 때, 사용자가 직접 녹음을 끝내고 지금까지 말한 내용으로 검색한다
  const finish = useCallback(() => { active.current?.recorder.finish() }, [])
  return { ...state, start, cancel, finish }
}
