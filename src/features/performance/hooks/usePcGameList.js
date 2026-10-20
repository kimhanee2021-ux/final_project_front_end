import { useEffect, useRef, useState } from 'react'
import { getErrorMessage } from '@/shared/lib/apiClient'
import { syncSteamLibrary } from '../../library/api'
import { fetchFeaturedCategories } from '../../games/api'
import { searchPcGames } from '../api/pcApi'
import { ownedPage } from '../model/pcDiagnosis'
import { pendingGames } from '../model/pcHardware'
import { gameViewGames } from '../model/pcGameSelection'
import { exactSearchGame } from '../model/pcSearchSelection'

// 게임별 성능표에 올릴 게임 목록: 내 보유게임(스팀 동기화), 스팀 인기 판매 상위 게임, 검색한 게임 중 하나를 고른다.
const TOP_CATEGORY = 'top_sellers'
const TOP_COUNT = 5

// 사양이 적용되면 보유게임을 자동으로 불러오고, 화면에 보이는 게임부터 분석을 요청한다.
export function usePcGameList(diagnosis, enabled) {
  const [owned, setOwned] = useState([])
  const [searched, setSearched] = useState([])
  const [candidates, setCandidates] = useState([])
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [page, setPage] = useState(0)
  const [showSearch, setShowSearch] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [topGames, setTopGames] = useState([])
  const [topStatus, setTopStatus] = useState('idle')
  const controller = useRef(null)
  const topController = useRef(null)
  const sequence = useRef(0)
  const ownedLoader = useRef(null)
  const diagnosisRef = useRef(diagnosis)
  const attemptedPages = useRef(new Set())
  const syncingOwned = useRef(false)

  useEffect(() => () => { sequence.current++; controller.current?.abort(); topController.current?.abort() }, [])
  useEffect(() => { ownedLoader.current = loadOwned; diagnosisRef.current = diagnosis })
  useEffect(() => { if (enabled && diagnosis.specs) ownedLoader.current() }, [enabled, diagnosis.specs])
  useEffect(() => { attemptedPages.current.clear() }, [diagnosis.specs])

  const listing = ownedPage(owned, expanded, page)
  const games = gameViewGames(listing, searched, showSearch, topGames)

  // 지금 화면에 보이는 보유게임 중 아직 분석하지 않은 게임을 한 번만 요청한다.
  useEffect(() => {
    const current = diagnosisRef.current
    if (showSearch || !current.specs || loading || syncingOwned.current || current.busy !== null || !owned.length) return
    const visible = ownedPage(owned, expanded, page).games
    const key = JSON.stringify([current.specs, visible.map(game => game.appId)])
    if (attemptedPages.current.has(key)) return
    const pending = pendingGames(visible, current.results)
    attemptedPages.current.add(key)
    if (pending.length) current.diagnoseGames(pending, current.specs)
  }, [owned, expanded, page, diagnosis.specs, diagnosis.busy, loading, showSearch])

  // 검색 전에 보이는 스팀 인기 게임도 보유게임처럼 한 번만 자동으로 분석을 요청한다.
  useEffect(() => {
    const current = diagnosisRef.current
    if (!showSearch || searched.length || !topGames.length || !current.specs || loading || current.busy !== null) return
    const key = JSON.stringify(['top', current.specs, topGames.map(game => game.appId)])
    if (attemptedPages.current.has(key)) return
    const pending = pendingGames(topGames, current.results)
    attemptedPages.current.add(key)
    if (pending.length) current.diagnoseGames(pending, current.specs, 'search')
  }, [showSearch, searched, topGames, diagnosis.specs, diagnosis.busy, loading])

  // 백엔드가 매일 동기화해 둔 스팀 카테고리에서 인기 판매 상위 게임을 가져온다(한 번만).
  async function loadTopGames() {
    if (topGames.length || topStatus === 'loading') return
    topController.current?.abort()
    const request = new AbortController()
    topController.current = request
    setTopStatus('loading')
    try {
      const categories = await fetchFeaturedCategories({ signal: request.signal })
      const top = categories.find(category => category.categoryKey === TOP_CATEGORY)
      const list = (top?.games ?? []).slice(0, TOP_COUNT)
      if (request.signal.aborted) return
      setTopGames(list)
      setTopStatus(list.length ? 'ready' : 'empty')
    } catch {
      if (!request.signal.aborted) setTopStatus('error')
    }
  }

  async function loadOwned() {
    setExpanded(false)
    syncingOwned.current = true
    const id = ++sequence.current
    controller.current?.abort()
    setError('')
    setLoading(true)
    try {
      const response = await syncSteamLibrary()
      if (sequence.current !== id) return
      const list = Array.isArray(response) ? response : response.games ?? response.items ?? []
      setOwned(list)
      if (list.length && diagnosisRef.current.prepareOwnedOverview) await diagnosisRef.current.prepareOwnedOverview(list)
      if (sequence.current !== id) return
      setPage(0)
      setLoading(false)
      if (!list.length) setError('보유 게임이 없어요. 다른 게임을 검색할 수 있어요.')
    } catch (e) {
      if (sequence.current === id) setError('보유 게임 불러오기: ' + getErrorMessage(e))
    } finally {
      if (sequence.current === id) {
        syncingOwned.current = false
        setLoading(false)
      }
    }
  }

  async function selectSearchGame(game) {
    setCandidates([])
    setSearched([game])
    diagnosis.setViewMode?.('search')
    setLoading(true)
    try {
      if (diagnosis.specs) await diagnosis.diagnose(game, 'search')
      else setError('PC 사양을 먼저 확인하면 선택한 게임을 분석해요.')
    } finally {
      setLoading(false)
    }
  }

  async function search(event) {
    event.preventDefault()
    if (!query.trim() || loading) return
    diagnosis.cancel()
    syncingOwned.current = false
    const id = ++sequence.current
    controller.current?.abort()
    const request = new AbortController()
    controller.current = request
    setError('')
    setLoading(true)
    setCandidates([])
    setSearched([])
    try {
      const found = await searchPcGames(query.trim(), request.signal)
      if (sequence.current !== id) return
      const exact = exactSearchGame(query.trim(), found)
      if (exact) await selectSearchGame(exact)
      else if (found.length) setCandidates(found)
      else setError('게임을 찾지 못했어요. 다른 이름으로 검색해 주세요.')
    } catch (e) {
      if (sequence.current === id && e.name !== 'AbortError') setError('게임 검색: ' + e.message)
    } finally {
      if (sequence.current === id) setLoading(false)
    }
  }

  const showOwned = () => {
    diagnosis.cancel()
    diagnosis.setViewMode?.('owned')
    setShowSearch(false)
    loadOwned()
  }
  const openSearch = () => {
    diagnosis.cancel()
    diagnosis.setViewMode?.('search')
    setShowSearch(true)
    setSearched([])
    setCandidates([])
    setError('')
    loadTopGames()
  }
  const toggleExpanded = () => {
    setExpanded(current => !current)
    setPage(0)
  }

  return { games, listing, owned, searched, topGames, topStatus, loadTopGames, candidates, query, setQuery, expanded, toggleExpanded, page, setPage, showSearch, error, loading, showOwned, openSearch, search, selectSearchGame }
}
