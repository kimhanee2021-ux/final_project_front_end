import { useCallback, useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import { clearAccessToken, readAccessToken, saveAccessToken } from '@/shared/lib/tokenStorage'
import * as authApi from '../api'
import { STEAM_LINKED_EVENT, listenSteamLinked, openSteamPopup } from '../model/steamLinkChannel'
import { userApi } from '@/features/user'
import { browserStores, UNAUTHORIZED_EVENT } from '@/shared/lib/apiClient'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // 저장된 토큰이 있으면 /api/me 확인이 끝날 때까지 로그인 여부를 판단하지 않는다.
  const [isAuthLoading, setIsAuthLoading] = useState(() => Boolean(readAccessToken(browserStores())))

  const signOut = useCallback(() => {
    clearAccessToken(browserStores())
    setUser(null)
  }, [])

  useEffect(() => {
    if (!readAccessToken(browserStores())) return
    let active = true
    authApi
      .getCurrentUser()
      .then(me => { if (active) setUser(me) })
      .catch(() => { if (active) clearAccessToken(browserStores()) })
      .finally(() => { if (active) setIsAuthLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, signOut)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, signOut)
  }, [signOut])

  async function establishSession(token, remember) {
    saveAccessToken(browserStores(), token, remember)
    try {
      const me = await authApi.getCurrentUser()
      setUser(me)
      return me
    } catch (error) {
      clearAccessToken(browserStores())
      throw error
    }
  }

  async function login({ email, password, remember = false }) {
    const token = await authApi.login({ email, password })
    return establishSession(token, remember)
  }

  async function signup({ email, nickname, password }) {
    const token = await authApi.signup({ email, nickname, password })
    return establishSession(token, false)
  }

  async function updateAccount(patch) {
    const updated = await userApi.updateMyInfo(patch)
    setUser(updated)
    return updated
  }

  async function deleteAccount() {
    await userApi.deleteMyAccount()
    signOut()
  }

  async function unlinkSteam() {
    await userApi.unlinkSteam()
  }

  // 새 창(팝업)에서 연동이 끝나면 이 창은 그대로 둔 채, 연동 여부에 따라 달라지는 화면들에게 이벤트로 알린다.
  useEffect(
    () => listenSteamLinked(() => window.dispatchEvent(new Event(STEAM_LINKED_EVENT))),
    []
  )

  // 스팀 OpenID 로그인을 새 창으로 띄운다. 이 창은 그대로여서 로그인·가입 화면에서 처음으로 돌아가는 일이 없다.
  // 끝나면 백엔드가 팝업을 프론트로 돌려보내고(?steamLinked=true&popup=true), 팝업이 이 창에 알린 뒤 스스로 닫힌다.
  // 팝업이 차단되면 예전처럼 이 창 전체를 스팀으로 보낸다 (beforeRedirect는 그 직전에 한 번 불린다).
  // 버튼의 onClick에 그대로 넘겨도 되도록, 첫 인자가 옵션이 아니라 클릭 이벤트여도 무시한다.
  function startSteamLink(options) {
    const token = readAccessToken(browserStores())
    if (!token) return false
    if (openSteamPopup(authApi.steamLinkUrl(token, { popup: true }))) return true
    options?.beforeRedirect?.()
    window.location.assign(authApi.steamLinkUrl(token))
    return true
  }

  const isAuthenticated = Boolean(user)
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAuthLoading,
        login,
        signup,
        signOut,
        updateAccount,
        deleteAccount,
        startSteamLink,
        unlinkSteam,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
