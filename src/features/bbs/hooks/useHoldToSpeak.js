import { useEffect, useRef, useState } from 'react'

export function useHoldToSpeak(onActivate, holdMs = 1000) {
  const [heldDuration, setHeldDuration] = useState(null)
  const timer = useRef(null)
  const callback = useRef({ onActivate, holdMs })
  useEffect(() => { callback.current = { onActivate, holdMs } }, [onActivate, holdMs])
  const clear = () => { clearTimeout(timer.current); timer.current = null }
  const cancel = () => { clear(); setHeldDuration(null) }
  const begin = () => {
    if (timer.current !== null) return
    setHeldDuration(holdMs)
    timer.current = setTimeout(() => {
      timer.current = null
      setHeldDuration(null)
      // A cancellation hold must never become a fresh start if recognition ends meanwhile.
      if (callback.current.holdMs === holdMs) callback.current.onActivate()
    }, holdMs)
  }
  useEffect(() => {
    const stop = () => { clear(); setHeldDuration(null) }
    const hidden = () => { if (document.hidden) stop() }
    const escape = event => { if (event.key === 'Escape') stop() }
    window.addEventListener('blur', stop)
    window.addEventListener('keydown', escape)
    document.addEventListener('visibilitychange', hidden)
    return () => {
      clear()
      window.removeEventListener('blur', stop)
      window.removeEventListener('keydown', escape)
      document.removeEventListener('visibilitychange', hidden)
    }
  }, [])
  return { holding: heldDuration === holdMs, handlers: {
    onPointerDown: event => {
      if (!event.isPrimary || event.button !== 0) return
      event.currentTarget.setPointerCapture(event.pointerId)
      begin()
    },
    onPointerMove: event => {
      if (timer.current === null) return
      const box = event.currentTarget.getBoundingClientRect()
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) cancel()
    },
    onPointerUp: cancel, onPointerCancel: cancel, onLostPointerCapture: cancel, onBlur: cancel,
    onContextMenu: event => event.preventDefault(),
    onKeyDown: event => {
      if (event.key === 'Escape') { cancel(); return }
      if (![' ', 'Enter'].includes(event.key)) return
      event.preventDefault()
      if (!event.repeat) begin()
    },
    onKeyUp: event => { if ([' ', 'Enter'].includes(event.key)) { event.preventDefault(); cancel() } },
  } }
}
