import { useCallback, useEffect, useState } from 'react'
import { STEAM_NOT_LINKED_MESSAGE, syncSteamLibrary } from '../api'
import { getErrorMessage } from '@/shared/lib/apiClient'
import { STEAM_LINKED_EVENT } from '@/features/auth'

// 동기화는 매번 스팀 API를 호출하므로, 같은 계정이면 페이지를 오가도 마지막 결과를 재사용한다.
const cache = { userId: null, games: null }

// 진행 중인 동기화 요청을 공유한다. 개발 모드(StrictMode)의 effect 이중 실행이나 연타가
// 스팀 API를 연달아 호출해 429(호출 한도)에 걸리는 것을 막는다.
let inFlight = null
function syncOnce(){
  if (!inFlight) {
    inFlight = syncSteamLibrary().finally(() => {
      inFlight = null
    })
  }
  return inFlight
}
// 스팀 연동을 해제하면 저장해 둔 목록도 버려서 내 라이브러리가 예전 게임을 보여주지 않게 한다.
export function resetSteamLibraryCache() {
  cache.userId = null
  cache.games = null
}

function successState(userId, games) {
  cache.userId = userId
  cache.games = games
  return { games, loading: false, error: '', notLinked: false }
}

function failureState(current, error) {
  const message = getErrorMessage(error)
  const notLinked = message === STEAM_NOT_LINKED_MESSAGE
  return { ...current, loading: false, notLinked, error: notLinked ? '' : message }
}

export function useSteamLibrary(userId) {
  const cached = userId && cache.userId === userId ? cache.games : null
  const needsInitialSync = Boolean(userId) && !cached
  const [state, setState] = useState({ games: cached, loading: needsInitialSync, error: '', notLinked: false })

  useEffect(() => {
    if (!needsInitialSync) return
    let active = true
    syncOnce()
      .then(games => {
        if (active) setState(successState(userId, games))
      })
      .catch(error => {
        if (active) setState(current => failureState(current, error))
      })
    return () => {
      active = false
    }
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  const sync = useCallback(async () => {
    if (!userId) return
    setState(current => ({ ...current, loading: true, error: '', notLinked: false }))
    try {
      setState(successState(userId, await syncOnce()))
    } catch (error) {
      setState(current => failureState(current, error))
    }
  }, [userId])

  // 스팀 연동을 새 창에서 마치면 이 창에 이벤트가 오므로, 바로 보유 게임을 불러온다.
  useEffect(() => {
    if (!userId) return
    window.addEventListener(STEAM_LINKED_EVENT, sync)
    return () => window.removeEventListener(STEAM_LINKED_EVENT, sync)
  }, [userId, sync])

  return { ...state, sync }
}
