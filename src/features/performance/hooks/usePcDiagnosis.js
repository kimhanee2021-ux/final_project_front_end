// @refresh reset
import { analysisRequestKey, searchOverviewFrom } from '../model/pcAnalysisCache'
import { evaluationForView } from '../model/pcEvaluationScope'
import { pendingGames } from '../model/pcHardware'
import { useEffect, useRef, useState } from 'react'
import { assessPc, assessPcBatch, assessPcOverview } from '../api'
import { normalizeSpecs } from '../model/pcDiagnosis'
import { loadEvaluation, saveEvaluation } from '../model/pcEvaluationStore'
import { useElapsedSeconds } from './useElapsedSeconds'
import { usePartOffers } from './usePartOffers'

// userId가 있으면 보유게임 기준 평가 결과를 그 계정의 이 브라우저 저장소에 보관하고, 같은 사양이면 저장본에서 이어받는다.
export function usePcDiagnosis(userId) {
  const [specs, setSpecs] = useState(null),
    [ownedResults, setOwnedResults] = useState({}),
    [selected, setSelected] = useState(null),
    [busy, setBusy] = useState(null),
    [error, setError] = useState(''),
    [errorsByScope, setErrorsByScope] = useState({ owned: {}, search: {} })
  const [elapsed, setElapsed] = useElapsedSeconds(busy),
    [viewMode, setViewMode] = useState('owned')
  const [searchResults, setSearchResults] = useState({})
  const results = viewMode === 'search' ? searchResults : ownedResults
  const gameErrors = errorsByScope[viewMode]
  function setScopeErrors(scope, update) {
    setErrorsByScope(old => ({ ...old, [scope]: typeof update === 'function' ? update(old[scope]) : update }))
  }
  const [ownedOverview, setOwnedOverview] = useState(null),
    [searchOverview, setSearchOverview] = useState(null),
    [overviewError, setOverviewError] = useState('')
  const parts = usePartOffers()
  const controller = useRef(null),
    sequence = useRef(0),
    specsRef = useRef(null),
    ownedCache = useRef(null),
    resultCaches = useRef({ owned: {}, search: {} }),
    activeRequestKey = useRef(null)
  useEffect(
    () => () => {
      sequence.current++
      controller.current?.abort()
    },
    []
  )
  function cancel() {
    activeRequestKey.current = null
    sequence.current++
    controller.current?.abort()
    setBusy(null)
  }
  function applySpecs(values) {
    const pc = normalizeSpecs(values)
    cancel()
    specsRef.current = pc
    setSpecs(pc)
    // 같은 사양으로 저장해 둔 평가가 있으면 AI를 다시 부르지 않고 그대로 보여준다.
    // 보유 게임 목록이 같으면 prepareOwnedOverview가 저장된 종합평가를 그대로 쓰고, 게임별 성능은 저장된 게임을 빼고 평가한다.
    const saved = loadEvaluation(userId, pc)
    setOwnedResults(saved.results)
    setSearchResults({})
    resultCaches.current = { owned: saved.results, search: {} }
    setErrorsByScope({ owned: {}, search: {} })
    setSelected(null)
    setError('')
    setOverviewError('')
    setOwnedOverview(saved.overview?.result ?? null)
    setSearchOverview(null)
    ownedCache.current = saved.overview
    setViewMode('owned')
    parts.reload()
  }
  async function prepareOwnedOverview(games) {
    const pc = specsRef.current
    if (!pc) return
    if (!games.length) {
      setOwnedOverview(null)
      return
    }
    const ids = [...new Set(games.map(game => game.appId))].sort((a, b) => a - b),
      key = JSON.stringify([pc, ids])
    if (ownedCache.current?.key === key) {
      setOwnedOverview(ownedCache.current.result)
      return
    }
    cancel()
    const id = ++sequence.current,
      request = new AbortController()
    controller.current = request
    setBusy(-2)
    setElapsed(0)
    setOverviewError('')
    const timer = setTimeout(() => request.abort(), 180000)
    try {
      const answer = await assessPcOverview(pc, ids, request.signal)
      if (sequence.current !== id) return
      const result = {
        ...answer,
        explanationStatus: 'READY',
        scopeType: 'owned',
        scopeGameCount: games.length,
        recommendations: [],
      }
      ownedCache.current = { key, result }
      saveEvaluation(userId, pc, { overview: ownedCache.current })
      setOwnedOverview(result)
    } catch (e) {
      if (sequence.current === id)
        setOverviewError(e.name === 'AbortError' ? '보유게임 전체 평가가 중단됐어요.' : e.message)
    } finally {
      clearTimeout(timer)
      if (sequence.current === id) setBusy(null)
    }
  }
  async function diagnoseGames(games, expectedSpecs, scope = 'owned', force = false) {
    const pc = specsRef.current
    if (expectedSpecs !== undefined && expectedSpecs !== pc) return
    if (!pc || !games.length) return
    const requestKey = analysisRequestKey(pc, games, scope)
    if (activeRequestKey.current === requestKey) return
    const cached = scope === 'search' && games.length === 1 ? resultCaches.current.search[games[0].appId] : null
    if (!force && cached && pendingGames(games, { [games[0].appId]: cached }).length === 0) {
      selectGame(games[0].appId, 'search')
      return
    }
    cancel()
    activeRequestKey.current = requestKey
    const id = ++sequence.current,
      request = new AbortController()
    controller.current = request
    setElapsed(0)
    setBusy(games.length > 1 ? -1 : games[0].appId)
    setError('')
    setScopeErrors(scope, old => {
      const next = { ...old }
      for (const game of games) delete next[game.appId]
      return next
    })
    let active = []
    const timer = setTimeout(() => request.abort(), 150000)
    try {
      for (let offset = 0; offset < games.length; offset += 5) {
        active = games.slice(offset, offset + 5)
        const responses =
          active.length === 1
            ? [await assessPc(pc, active[0].appId, request.signal)]
            : await assessPcBatch(
                pc,
                active.map(game => game.appId),
                request.signal
              )
        if (sequence.current !== id) return
        const values = responses.map(result => ({
          ...result,
          summaryBatch: id * 100 + offset,
          summaryGames: responses.map(game => game.gameName),
        }))
        resultCaches.current[scope] = {
          ...resultCaches.current[scope],
          ...Object.fromEntries(values.map(result => [result.appId, result])),
        }
        const saveResults = scope === 'search' ? setSearchResults : setOwnedResults
        saveResults(resultCaches.current[scope])
        if (scope === 'owned') saveEvaluation(userId, pc, { results: resultCaches.current.owned })
        if (scope === 'search' && values.length && games.length === 1) {
          const result = values[0]
          setSearchOverview(searchOverviewFrom(result))
          setViewMode('search')
        }
        if (values.length) setSelected(values[0].appId)
      }
    } catch (e) {
      if (sequence.current === id) {
        const message = e.name === 'AbortError' ? '분석이 중단됐거나 시간이 초과됐어요.' : e.message
        setScopeErrors(scope, old => ({ ...old, ...Object.fromEntries(active.map(game => [game.appId, message])) }))
        setError(message)
      }
    } finally {
      clearTimeout(timer)
      if (sequence.current === id) {
        activeRequestKey.current = null
        setBusy(null)
      }
    }
  }
  function selectGame(appId, scope = viewMode) {
    setSelected(appId)
    if (scope === 'search' && resultCaches.current.search[appId]) {
      if (activeRequestKey.current) cancel()
      setError('')
      setSearchOverview(searchOverviewFrom(resultCaches.current.search[appId]))
      setViewMode('search')
    }
  }
  function retryGames(games) {
    const remaining = pendingGames(games, results)
    if (remaining.length) return diagnoseGames(remaining, specsRef.current, viewMode)
  }
  function diagnose(game, scope = viewMode, force = false) {
    return diagnoseGames([game], undefined, scope, force)
  }
  const overviewResult = evaluationForView(viewMode, ownedOverview, searchOverview)
  return {
    specs,
    results,
    selected,
    setSelected,
    selectGame,
    busy,
    elapsed,
    error,
    gameErrors,
    applySpecs,
    diagnose,
    diagnoseGames,
    retryGames,
    cancel,
    prepareOwnedOverview,
    viewMode,
    setViewMode,
    overviewResult,
    overviewError,
    partOffers: parts.partOffers,
    partsLoading: parts.partsLoading,
  }
}
