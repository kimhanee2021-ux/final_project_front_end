import { useCallback, useEffect, useState } from 'react'
import { STEAM_NOT_LINKED_CODE, fetchMySpending } from '../api'
import { syncSteamLibrary } from '@/features/library'
import { toSpendingGame } from '../model/spendingModel'
import { getErrorMessage } from '@/shared/lib/apiClient'
import { STEAM_LINKED_EVENT } from '@/features/auth'

const toState = data => ({
  data: { ...data, games: data.games.map(toSpendingGame) },
  loading: false,
  syncing: false,
  error: '',
  notLinked: false,
})

const toFailure = (current, error) => {
  const notLinked = error?.response?.data?.code === STEAM_NOT_LINKED_CODE
  return { ...current, loading: false, syncing: false, notLinked, error: notLinked ? '' : getErrorMessage(error) }
}

// 소비 분석은 DB에 저장된 보유 게임 기준으로 바로 그리고,
// 사용자가 "스팀 동기화"를 누르면 스팀에서 최신 플레이 시간을 받은 뒤 다시 그린다.
export function useMySpending(userId) {
  const [state, setState] = useState({ data: null, loading: Boolean(userId), syncing: false, error: '', notLinked: false })

  useEffect(() => {
    if (!userId) return
    let active = true
    fetchMySpending()
      .then(data => { if (active) setState(toState(data)) })
      .catch(error => { if (active) setState(current => toFailure(current, error)) })
    return () => { active = false }
  }, [userId])

  const reload = useCallback(async () => {
    setState(current => ({ ...current, loading: true, error: '' }))
    try {
      setState(toState(await fetchMySpending()))
    } catch (error) {
      setState(current => toFailure(current, error))
    }
  }, [])

  const sync = useCallback(async () => {
    setState(current => ({ ...current, syncing: true, error: '' }))
    try {
      await syncSteamLibrary()
      setState(toState(await fetchMySpending()))
    } catch (error) {
      setState(current => toFailure(current, error))
    }
  }, [])

  // 스팀 연동을 새 창에서 마치면 이 창에 이벤트가 오므로, 연동 전 상태(notLinked)를 지우고 다시 불러온다.
  useEffect(() => {
    if (!userId) return
    window.addEventListener(STEAM_LINKED_EVENT, reload)
    return () => window.removeEventListener(STEAM_LINKED_EVENT, reload)
  }, [userId, reload])

  return { ...state, reload, sync }
}
