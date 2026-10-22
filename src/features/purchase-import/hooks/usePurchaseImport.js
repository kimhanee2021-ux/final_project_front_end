import { useRef, useState } from 'react'
import { getErrorMessage } from '@/shared/lib/apiClient'
import { parseSteamHistory } from '../model/parseSteamHistory'
import { isLicensesPage, parseSteamLicenses } from '../model/parseSteamLicenses'
import { deletePurchases, importLicenses, importPurchases } from '../api'

// 가져오기 진행 상태: 고른 파일을 파싱한 미리보기(parsed) → 서버 저장 결과(result). 어떤 페이지인지는 표 구조로 자동 판별한다.
// onClose: 대화상자 닫기, onImported: 저장·삭제가 끝나 분석을 다시 불러와야 할 때
export function usePurchaseImport({ onClose, onImported }) {
  const fileRef = useRef(null)
  const [parsed, setParsed] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const reset = () => {
    setParsed(null)
    setResult(null)
    setError('')
    if (fileRef.current) fileRef.current.value = ''
  }
  const close = () => {
    const imported = Boolean(result)
    reset()
    onClose()
    if (imported) onImported()
  }

  const readHtml = html => {
    if (isLicensesPage(html)) {
      const licenses = parseSteamLicenses(html)
      if (!licenses.licenses.length) {
        setParsed(null)
        setError(licenses.warnings[0] ?? '가져올 라이선스를 찾지 못했어요.')
        return
      }
      setError('')
      setParsed({ kind: 'licenses', ...licenses })
      return
    }
    const history = parseSteamHistory(html)
    if (!history.transactions.length) {
      setParsed(null)
      setError(history.warnings[0] ?? '가져올 거래를 찾지 못했어요.')
      return
    }
    setError('')
    setParsed({ kind: 'history', ...history })
  }
  const onFile = async event => {
    const file = event.target.files?.[0]
    if (file) readHtml(await file.text())
  }
  const onPaste = event => {
    event.preventDefault()
    const html = event.clipboardData.getData('text/html')
    if (html) readHtml(html)
    else setError('표 모양 그대로 복사되지 않았어요. 페이지에서 표를 드래그해 복사하거나 HTML 파일을 올려 주세요.')
  }

  const submit = async () => {
    setBusy(true)
    setError('')
    try {
      const response =
        parsed.kind === 'licenses' ? await importLicenses(parsed.licenses) : await importPurchases(parsed.transactions)
      setResult({ kind: parsed.kind, ...response })
      setParsed(null)
    } catch (err) {
      setError(getErrorMessage(err, '저장하지 못했어요. 잠시 후 다시 시도해 주세요.'))
    } finally {
      setBusy(false)
    }
  }
  const removeAll = async () => {
    if (!window.confirm('가져온 구매내역과 라이선스를 모두 지울까요? 소비 분석은 다시 정가 추정으로 돌아가요.')) return
    setBusy(true)
    try {
      await deletePurchases()
      reset()
      onClose()
      onImported()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return { fileRef, parsed, result, error, busy, reset, close, onFile, onPaste, submit, removeAll }
}
