import { useState } from 'react'
import { EMPTY_SPECS } from '../model/pcSpecs'

const STORAGE_KEY = 'gamesense-pc-specs'

function readSpecs() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    return saved ? { ...EMPTY_SPECS, ...saved } : EMPTY_SPECS
  } catch {
    return EMPTY_SPECS
  }
}

// 사용자가 입력한 PC 사양을 브라우저(localStorage)에 저장하고 읽는다. 저장소를 못 쓰는 환경에서도 화면은 동작한다.
export function usePcSpecs() {
  const [specs, setSpecs] = useState(readSpecs)
  const save = next => {
    setSpecs(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* 저장소를 못 써도 이번 화면에서는 입력값을 계속 쓴다. */
    }
  }
  return { specs, saveSpecs: save, resetSpecs: () => save(EMPTY_SPECS) }
}
