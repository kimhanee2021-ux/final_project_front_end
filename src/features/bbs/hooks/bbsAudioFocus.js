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
export function useBbsAudioFocus(owner, stop) {
  const focus = useContext(BbsAudioFocus)
  useEffect(() => focus?.register(owner, stop), [focus, owner, stop])
  return () => focus?.claim(owner)
}
