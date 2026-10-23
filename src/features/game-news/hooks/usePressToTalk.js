import { useCallback, useEffect, useRef, useState } from 'react'

const HOLD_MS = 2000

export function usePressToTalk(onComplete, onStart) {
  const callbacks = useRef({ onComplete, onStart })
  const press = useRef(null)
  const [holding, setHolding] = useState(false)
  useEffect(() => { callbacks.current = { onComplete, onStart } }, [onComplete, onStart])

  const cancelHold = useCallback(() => {
    clearTimeout(press.current?.timer)
    press.current = null
    setHolding(false)
  }, [])
  useEffect(() => {
    const visibility = () => { if (document.hidden) cancelHold() }
    window.addEventListener('blur', cancelHold)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      clearTimeout(press.current?.timer)
      press.current = null
      window.removeEventListener('blur', cancelHold)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [cancelHold])

  const begin = source => {
    if (press.current || callbacks.current.onStart?.() === false) return
    const current = { source, timer: null }
    press.current = current
    setHolding(true)
    current.timer = setTimeout(() => {
      if (press.current !== current) return
      press.current = null
      setHolding(false)
      callbacks.current.onComplete()
    }, HOLD_MS)
  }
  const holdHandlers = {
    onPointerDown: event => {
      if (!event.isPrimary || event.button !== 0) return
      event.currentTarget.setPointerCapture(event.pointerId)
      begin(`pointer:${event.pointerId}`)
    },
    onPointerUp: cancelHold,
    onPointerCancel: cancelHold,
    onLostPointerCapture: cancelHold,
    onPointerMove: event => {
      if (press.current?.source !== `pointer:${event.pointerId}`) return
      const box = event.currentTarget.getBoundingClientRect()
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) cancelHold()
    },
    onKeyDown: event => {
      if (![' ', 'Enter'].includes(event.key)) return
      event.preventDefault()
      if (!event.repeat) begin(`key:${event.key}`)
    },
    onKeyUp: event => {
      if (![' ', 'Enter'].includes(event.key)) return
      event.preventDefault()
      cancelHold()
    },
    onBlur: cancelHold,
    onContextMenu: event => event.preventDefault(),
  }
  return { holding, cancelHold, holdHandlers }
}
