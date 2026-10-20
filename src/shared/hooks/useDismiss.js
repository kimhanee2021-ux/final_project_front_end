import { useEffect } from 'react'

// 팝오버/드롭다운이 열려 있을 때 바깥을 누르거나 Esc를 누르면 close()를 부른다.
export function useDismiss(ref, open, close) {
  useEffect(() => {
    if (!open) return
    const dismiss = event => {
      if (event.type === 'keydown' ? event.key === 'Escape' : !ref.current?.contains(event.target)) close()
    }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', dismiss)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('keydown', dismiss)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps
}
