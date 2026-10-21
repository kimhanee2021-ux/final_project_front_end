import { useCallback, useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import { clearAccessToken, readAccessToken, saveAccessToken } from '@/shared/lib/tokenStorage'
import * as authApi from '../api'
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

  // 스팀 OpenID 로그인 페이지로 전체 이동. 완료 후 백엔드가 프론트로 ?steamLinked=true를 붙여 돌려보낸다.
  function startSteamLink() {
    const token = readAccessToken(browserStores())
    if (!token) return false
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
