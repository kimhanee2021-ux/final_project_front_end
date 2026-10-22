// [변경] AI 분석 상태 컨텍스트.
// 버튼을 없애고, 위시리스트를 열면 AI 분석을 자동으로 한 번 돌린다.
// 규칙:
//  1) 찜 목록(스팀 appid 묶음)과 날짜가 같으면 저장된 분석을 그대로 쓰고 AI를 부르지 않는다.
//  2) 저장된 분석이 없으면 페이지가 열릴 때 한 번 AI를 부른다. 찜 목록이 바뀌면 다시 부른다.
//  3) 백엔드 전역 쿨다운(30초)에 걸리면 결과를 보여 주지 않고, 30초 뒤에 한 번만 다시 부른다.
//     기다리는 동안 남은 초(retryIn)를 화면에 보여 준다.
//  4) AI 문장이 하나도 없으면(전부 규칙 문장) 저장하지 않아서, 다음 방문 때 다시 시도한다.
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { fetchAiSummary } from './api'

const RETRY_MS = 30_000                     // 쿨다운에 걸렸을 때 다시 시도할 간격 (백엔드 쿨다운과 같은 30초)
const STORAGE_KEY = 'gamesense-ai-analysis' // 브라우저에 저장할 때 쓰는 키
const SummaryContext = createContext(null)

// 오늘 날짜를 YYYY-MM-DD 형식으로 (지역 날짜 기준)
function todayStr() {
  return new Date().toLocaleDateString('sv-SE')
}

// 찜 목록 묶음을 비교용 문자열로 바꾼다 (순서가 달라도 같은 묶음이면 같은 키)
function idsKeyOf(appIds) {
  return [...appIds].sort((a, b) => a - b).join(',')
}

// 저장된 분석을 읽는다. 찜 목록과 날짜가 모두 같을 때만 돌려준다 ({ items, message })
function readSaved(idsKey) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const saved = JSON.parse(raw)
    return saved.idsKey === idsKey && saved.date === todayStr() ? saved : null
  } catch {
    return null
  }
}

// 분석 결과를 저장한다 (찜 목록 묶음, 오늘 날짜, 전체 요약을 함께)
function writeSaved(idsKey, items, message) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ idsKey, date: todayStr(), items, message }))
  } catch {
    // 저장소를 쓸 수 없으면 조용히 넘어간다 (화면 상태로는 계속 동작)
  }
}

// appIds: 찜한 스팀 게임의 appid 배열
export function WishlistSummaryProvider({ appIds, children }) {
  const idsKey = idsKeyOf(appIds)
  const [items, setItems] = useState(() => readSaved(idsKey)?.items ?? null)       // appid -> { sentence, source }
  const [message, setMessage] = useState(() => readSaved(idsKey)?.message ?? null) // AI 전체 요약
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [retryAt, setRetryAt] = useState(0)  // 쿨다운 재시도 예정 시각 (0이면 기다리는 중이 아님)
  const [now, setNow] = useState(Date.now()) // 남은 초를 계산하려고 1초마다 갱신하는 현재 시각

  const runId = useRef(0)          // 요청마다 번호를 매긴다. 목록이 바뀐 뒤 늦게 온 응답은 버리기 위해서다
  const startedKey = useRef(null)  // 이 찜 목록으로 이미 요청을 시작했는지 (StrictMode에서 두 번 부르지 않게 막는다)
  const retryTimer = useRef(null)  // 쿨다운 재시도 예약
  // [추가] 마지막으로 처리한 찜 목록 키. 같은 목록이면 effect가 다시 실행돼도 아무것도 하지 않는다 (StrictMode 두 번 실행 대비)
  const lastKey = useRef(null)

  // 찜 목록이 바뀌면 이전 요청을 무효로 하고, 그 목록의 저장된 분석을 다시 읽는다
useEffect(() => {
  if (lastKey.current === idsKey) return
  lastKey.current = idsKey
  runId.current++
  clearTimeout(retryTimer.current)
  const saved = readSaved(idsKey)
  setItems(saved?.items ?? null)
  setMessage(saved?.message ?? null)
  setError(false)
  setLoading(false)
  setRetryAt(0)
}, [idsKey])

  // 저장된 분석이 없으면 페이지가 열릴 때 AI를 한 번 부른다
  useEffect(() => {
    if (appIds.length === 0) return
    if (readSaved(idsKey)) return               // 오늘 저장된 분석이 있으면 부르지 않는다
    if (startedKey.current === idsKey) return   // 이미 이 목록으로 시작했으면 다시 시작하지 않는다
    startedKey.current = idsKey
    run(idsKey, appIds, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey])

  // 기다리는 중에는 1초마다 화면을 갱신해서 남은 초를 보여 준다
  useEffect(() => {
    if (!retryAt) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [retryAt])

  // 페이지를 떠나면 예약된 재시도를 취소한다
  useEffect(() => () => clearTimeout(retryTimer.current), [])

  // 실제 호출. isRetry가 true면 쿨다운 재시도이므로 또 예약하지 않는다
  async function run(key, ids, isRetry) {
    const myRun = ++runId.current
    setLoading(true)
    setError(false)
    setRetryAt(0)
    let keepLoading = false
    try {
      const data = await fetchAiSummary(ids)
      if (myRun !== runId.current) return
      // 쿨다운에 걸렸으면(다른 사용자가 방금 호출함) 결과를 보여 주지 않고 30초 뒤에 한 번만 다시 부른다
      if (data.cooldown && !isRetry) {
        keepLoading = true
        setNow(Date.now())
        setRetryAt(Date.now() + RETRY_MS)
        retryTimer.current = setTimeout(() => run(key, ids, true), RETRY_MS)
        return
      }
      const map = {}
      data.items.forEach(i => { map[i.appId] = { sentence: i.sentence, source: i.source } })
      const overall = data.message ?? null
      setItems(map)
      setMessage(overall)
      // AI 문장이 하나라도 있을 때만 저장한다. 전부 규칙 문장이면 저장하지 않아서 다음 방문 때 다시 시도한다
      if (data.items.some(i => i.source === 'AI')) writeSaved(key, map, overall)
    } catch {
      if (myRun !== runId.current) return
      setError(true)
    } finally {
      // 재시도를 기다리는 동안에는 "분석 중" 상태를 유지한다
      if (myRun === runId.current && !keepLoading) setLoading(false)
    }
  }

  // 남은 초 (기다리는 중이 아니면 0)
  const retryIn = retryAt ? Math.max(0, Math.ceil((retryAt - now) / 1000)) : 0

  const value = useMemo(
    () => ({ items, message, loading, error, retryIn }),
    [items, message, loading, error, retryIn]
  )
  return <SummaryContext.Provider value={value}>{children}</SummaryContext.Provider>
}

// 메시지와 카드가 분석 상태를 읽을 때 쓴다
export function useWishlistSummary() {
  const ctx = useContext(SummaryContext)
  if (!ctx) return { items: null, message: null, loading: false, error: false, retryIn: 0 }
  return ctx
}