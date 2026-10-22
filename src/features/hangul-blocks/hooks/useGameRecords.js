import { useEffect, useRef, useState } from 'react'
import { readRecords } from '../model/engine'

// 이 브라우저에 남기는 개인 기록 (최근 100판)
function loadRecords(key) {
  try {
    return readRecords(localStorage.getItem(key))
  } catch {
    return []
  }
}

// 한 판이 끝나면(실패·단계 성공·완주) 그 판을 한 번만 기록한다. recordedRef는 새 판을 시작할 때 false로 돌린다.
export function useGameRecords({ game, mode, recordKey, runDateRef }) {
  const [records, setRecords] = useState(() => loadRecords(recordKey))
  const [saveError, setSaveError] = useState(false)
  const recordedRef = useRef(false)
  useEffect(() => {
    if (!['over', 'stage-clear', 'complete'].includes(game.status) || recordedRef.current) return
    recordedRef.current = true
    const entry = {
      mode,
      date: runDateRef.current,
      stage: game.stage,
      score: game.score,
      lines: game.lines,
      status: game.status
    }
    try {
      const next = [...loadRecords(recordKey), entry].slice(-100)
      localStorage.setItem(recordKey, JSON.stringify(next))
      setRecords(next)
    } catch {
      setSaveError(true)
    }
  }, [game.status, game.stage, game.score, game.lines, mode, recordKey, runDateRef])
  return { records, saveError, recordedRef }
}
