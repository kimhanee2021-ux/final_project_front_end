import { useState } from 'react'
import { getErrorMessage } from '@/shared/lib/apiClient'

// 계정 섹션의 동작(닉네임·비밀번호·스팀·탈퇴) 진행 상태와 결과 문구. 동작마다 key로 구분한다.
// run(key, task): task를 실행하는 동안 busy가 key가 되고, 실패하면 서버 문구를 그 key의 결과로 남긴다.
export function useAccountActions() {
  const [busy, setBusy] = useState('')
  const [results, setResults] = useState({})
  const setResult = (key, text, error = false) => setResults(current => ({ ...current, [key]: { text, error } }))

  const run = async (key, task) => {
    setBusy(key)
    setResults(current => ({ ...current, [key]: null }))
    try {
      await task()
    } catch (error) {
      setResult(key, getErrorMessage(error), true)
    } finally {
      setBusy('')
    }
  }

  return { busy, results, setResult, run }
}
