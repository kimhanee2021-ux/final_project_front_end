import { useCallback, useState } from 'react'

// "추천받기"를 한 번이라도 눌렀는지 계정별로 브라우저에 기억한다. 서버에는 이 값이 없다.
const keyOf = userId => `gs:ai-diagnosed:${userId}`

function read(userId) {
  if (!userId) return false
  try {
    return localStorage.getItem(keyOf(userId)) === '1'
  } catch {
    return false
  }
}

export function useAiDiagnosed(userId) {
  const [diagnosed, setDiagnosed] = useState(() => read(userId))

  const markDiagnosed = useCallback(() => {
    try {
      localStorage.setItem(keyOf(userId), '1')
    } catch {
      // 저장이 막혀 있어도 이번 화면에서는 추천을 진행한다.
    }
    setDiagnosed(true)
  }, [userId])

  return [diagnosed, markDiagnosed]
}
