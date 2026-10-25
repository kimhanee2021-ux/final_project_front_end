import { useCallback, useEffect, useRef, useState } from 'react'
import { getErrorMessage } from '@/shared/lib/apiClient'
import { fetchBbsResource, generateBbsBriefing, readBbsBriefing, resolveBbsVoiceCommand } from '../api'
import { emptyVoiceFlow, VoiceBriefingFlow } from '../model/voiceBriefingFlow'

// resolve: 음성·글 요청을 명령으로 해석하는 함수. 기본은 BBS 음성 명령 API이고, AI 게임 검색 화면은 AI 검색 API로 바꿔 쓴다.
export function useVoiceBriefingFlow({ location, navigate, audioFocus, context, resolve = resolveBbsVoiceCommand }) {
  const [state, setState] = useState(emptyVoiceFlow)
  const flow = useRef(null)
  const callbacks = useRef({ navigate, location, context, resolve })
  useEffect(() => { callbacks.current = { navigate, location, context, resolve } }, [navigate, location, context, resolve])
  useEffect(() => {
    const instance = new VoiceBriefingFlow({
      api: { resolve: (transcript, signal) => callbacks.current.resolve(transcript, signal), news: (appId, signal) => fetchBbsResource(`/api/games/bbs/${appId}/news`, signal), read: readBbsBriefing, generate: generateBbsBriefing },
      control: action => audioFocus.control(action),
      onState: setState, navigate: changes => callbacks.current.navigate(changes),
      errorMessage: error => getErrorMessage(error, '브리핑을 이어가지 못했어요. 다시 요청하거나 직접 소식을 선택해 주세요.'),
    })
    flow.current = instance
    const unregister = audioFocus.register('command', () => instance.cancelPending())
    const cancel = () => instance.cancel()
    const keyboard = event => { if (event.key === 'Escape') cancel() }
    const visibility = () => { if (document.hidden) cancel() }
    window.addEventListener('keydown', keyboard)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      unregister(); instance.dispose()
      if (flow.current === instance) flow.current = null
      window.removeEventListener('keydown', keyboard)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [audioFocus])
  useEffect(() => { if (flow.current?.observeLocation(location)) audioFocus.claim('navigation') }, [location, audioFocus])
  const cancel = useCallback(() => { flow.current?.cancel(); audioFocus.claim('manual') }, [audioFocus])
  const start = useCallback(transcript => {
    audioFocus.claim('command')
    void flow.current?.start(transcript, callbacks.current.location, callbacks.current.context)
  }, [audioFocus])
  const choose = useCallback(appId => flow.current?.choose(appId) ?? false, [])
  const takePlayback = useCallback((...args) => flow.current?.takePlayback(...args) ?? false, [])
  const beginListening = useCallback(() => flow.current?.cancelPending(), [])
  const dismiss = useCallback(() => {
    const pending = ['INTERPRETING', 'CHOOSING', 'NEWS', 'SUMMARY'].includes(flow.current?.state.phase)
    flow.current?.cancel()
    if (pending) audioFocus.claim('manual')
  }, [audioFocus])
  return { state, cancel, start, choose, takePlayback, beginListening, dismiss }
}
