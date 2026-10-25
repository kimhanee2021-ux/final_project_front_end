import { createContext, useContext, useEffect } from 'react'

export const BbsAudioFocus = createContext(null)
export function createBbsAudioFocus() {
  const stops = new Map()
  let playback = null
  return {
    register(owner, stop) { stops.set(owner, stop); return () => { if (stops.get(owner) === stop) stops.delete(owner) } },
    claim(owner) { for (const [other, stop] of stops) if (other !== owner) stop(owner) },
    registerPlayback(controls) { playback = controls; return () => { if (playback === controls) playback = null } },
    control(action) { return playback?.[action]?.() ?? false },
  }
}
// 화면의 오디오 묶음(Provider) 밖에서 마이크를 켤 때(헤더의 음성 버튼) 화면의 낭독·대기 중인 명령·마이크를 멈추게 알린다
const OUTSIDE_CLAIM = 'bbs:outside-audio-claim'
export function claimBbsAudioFromOutside() {
  window.dispatchEvent(new Event(OUTSIDE_CLAIM))
}
export function useOutsideAudioClaims(focus) {
  useEffect(() => {
    const claim = () => focus.claim('outside')
    window.addEventListener(OUTSIDE_CLAIM, claim)
    return () => window.removeEventListener(OUTSIDE_CLAIM, claim)
  }, [focus])
}
export function useBbsAudioFocus(owner, stop) {
  const focus = useContext(BbsAudioFocus)
  useEffect(() => focus?.register(owner, stop), [focus, owner, stop])
  return () => focus?.claim(owner)
}
