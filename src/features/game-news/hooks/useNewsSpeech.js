import { useCallback, useEffect, useRef, useState } from 'react'
import { streamNewsSpeech } from '../api'
import { NewsAudioPlayer, INITIAL_SPEECH } from '../model/newsAudioPlayer'

export function useNewsSpeech() {
  const [state, setState] = useState(INITIAL_SPEECH)
  const player = useRef(null)
  if (player.current === null) {
    player.current = new NewsAudioPlayer({ stream: streamNewsSpeech, update: setState })
  }
  const cancel = useCallback((forget = false) => player.current.cancel(forget), [])
  const say = useCallback((text, remember = false) => player.current.say(text, remember), [])
  const stop = useCallback((forget = false) => player.current.stop(forget), [])
  const replay = useCallback(() => player.current.replay(), [])
  useEffect(() => () => player.current.cancel(true), [])
  return { ...state, supported: typeof window !== 'undefined' && Boolean(window.AudioContext || window.webkitAudioContext), say, stop, cancel, replay }
}
