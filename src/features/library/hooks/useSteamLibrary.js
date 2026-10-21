import { useCallback, useEffect, useState } from 'react'
import { STEAM_NOT_LINKED_MESSAGE, syncSteamLibrary } from '../api'
import { getErrorMessage } from '@/shared/lib/apiClient'

// 동기화는 매번 스팀 API를 호출하므로, 같은 계정이면 페이지를 오가도 마지막 결과를 재사용한다.
const cache = { userId: null, games: null }

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
    syncSteamLibrary()
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
      setState(successState(userId, await syncSteamLibrary()))
    } catch (error) {
      setState(current => failureState(current, error))
    }
  }, [userId])

  return { ...state, sync }
}
