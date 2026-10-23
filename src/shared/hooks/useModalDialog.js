import { useEffect, useRef } from 'react'

// open이 참이 되면 <dialog>를 모달로 열고, 거짓이 되면 닫는다. 돌려준 ref를 <dialog ref={...}>에 단다.
// open에는 열 대상(게임·상세 정보 등)을 그대로 넘겨도 된다 (있으면 열림).
export function useModalDialog(open) {
  const ref = useRef(null)
  const shouldOpen = Boolean(open)
  useEffect(() => {
    const dialog = ref.current
    if (shouldOpen && !dialog.open) dialog.showModal()
    else if (!shouldOpen && dialog.open) dialog.close()
  }, [shouldOpen])
  return ref
}
