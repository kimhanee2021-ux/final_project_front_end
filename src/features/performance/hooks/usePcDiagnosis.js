// @refresh reset
import { analysisRequestKey, searchOverviewFrom } from '../model/pcAnalysisCache'
import { evaluationForView } from '../model/pcEvaluationScope'
import { pendingGames } from '../model/pcHardware'
import { useEffect, useRef, useState } from 'react'
import { assessPc, assessPcBatch, assessPcOverview, loadPcParts } from '../api/pcApi'
import { normalizeSpecs } from '../model/pcDiagnosis'

export function usePcDiagnosis() {
  const [specs, setSpecs] = useState(null),
    [ownedResults, setOwnedResults] = useState({}),
    [selected, setSelected] = useState(null),
    [busy, setBusy] = useState(null),
    [error, setError] = useState(''),
    [errorsByScope, setErrorsByScope] = useState({ owned: {}, search: {} })
  const [elapsed, setElapsed] = useState(0),
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
  const [partOffers, setPartOffers] = useState([]),
    [partsLoading, setPartsLoading] = useState(false)
  const controller = useRef(null),
    sequence = useRef(0),
    specsRef = useRef(null),
    ownedCache = useRef(null),
    priceController = useRef(null),
    priceSequence = useRef(0),
    resultCaches = useRef({ owned: {}, search: {} }),
    activeRequestKey = useRef(null)
  useEffect(() => {
    if (busy === null) return
    const started = Date.now()
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000)
    return () => clearInterval(timer)
  }, [busy])
  useEffect(
    () => () => {
      sequence.current++
      controller.current?.abort()
      priceSequence.current++
      priceController.current?.abort()
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
    setOwnedResults({})
    setSearchResults({})
    resultCaches.current = { owned: {}, search: {} }
    setErrorsByScope({ owned: {}, search: {} })
    setSelected(null)
    setError('')
    setOverviewError('')
    setOwnedOverview(null)
    setSearchOverview(null)
    ownedCache.current = null
    setViewMode('owned')
    priceController.current?.abort()
    const request = new AbortController()
    priceController.current = request
    const id = ++priceSequence.current
    setPartOffers([])
    setPartsLoading(true)
    const timer = setTimeout(() => request.abort(), 150000)
    loadPcParts(request.signal)
      .then(offers => {
        if (priceSequence.current === id) setPartOffers(Array.isArray(offers) ? offers : [])
      })
      .catch(() => {})
      .finally(() => {
        clearTimeout(timer)
        if (priceSequence.current === id) setPartsLoading(false)
      })
  }
  async function prepareOwnedOverview(games) {
    const pc = specsRef.current
    if (!pc || !games.length) return
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
    partOffers,
    partsLoading,
  }
}
