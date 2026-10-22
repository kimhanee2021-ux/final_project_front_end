import { useEffect, useRef, useState } from 'react'
import { extractPcPhoto, loadPcProvider } from '../api'
import { preparePcPhoto } from '../model/pcHardware'
import { KNOWN_PROVIDERS, isAcceptedPhoto, reviewValuesOf } from '../model/pcPhoto'

// 시스템 정보 사진 → AI 판독 → 확인할 사양 값. 사진 고르기·동의·판독 진행(경과 초)·취소를 맡는다.
// signedIn이 거짓이면 AI 연결 정보를 묻지 않는다 (로그인 후에 판독할 수 있다).
export function useSystemPhotoReader(signedIn) {
  const [photo, setPhoto] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [values, setValues] = useState(null)
  const [warnings, setWarnings] = useState([])
  const [consent, setConsent] = useState(false)
  const [provider, setProvider] = useState(null)
  const [gpus, setGpus] = useState([])
  const [elapsed, setElapsed] = useState(0)
  const controller = useRef(null)
  const sequence = useRef(0)

  // 판독 중에는 경과 초를 센다
  useEffect(() => {
    if (!busy) return
    const started = Date.now()
    const clock = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000)
    return () => clearInterval(clock)
  }, [busy])
  // 어떤 AI로 보내는지 서버에 물어 동의 문구에 쓴다
  useEffect(() => {
    if (!signedIn) return
    const request = new AbortController()
    loadPcProvider(request.signal)
      .then(data => {
        if (!request.signal.aborted && KNOWN_PROVIDERS.includes(data.provider)) setProvider(data.provider)
      })
      .catch(() => {
        if (!request.signal.aborted) setError('AI 연결 정보를 확인하지 못했어요. 창을 다시 열거나 사양을 직접 입력해 주세요.')
      })
    return () => request.abort()
  }, [signedIn])
  // 화면을 떠나면 진행 중인 판독을 버린다
  useEffect(
    () => () => {
      sequence.current++
      controller.current?.abort()
    },
    []
  )
  // 사진을 바꾸거나 떠나면 미리보기 주소를 정리한다
  useEffect(
    () => () => {
      if (photo?.url) URL.revokeObjectURL(photo.url)
    },
    [photo]
  )

  function cancel() {
    sequence.current++
    controller.current?.abort()
    setBusy(false)
  }
  function selectPhoto(event) {
    const file = event.target.files?.[0]
    if (!file) return
    event.target.value = ''
    cancel()
    setValues(null)
    setGpus([])
    setError('')
    setConsent(false)
    if (!isAcceptedPhoto(file)) {
      setPhoto(null)
      setError('JPG·PNG·WEBP 사진을 10MB 이하로 선택해 주세요.')
      return
    }
    setPhoto({ file, name: file.name, url: URL.createObjectURL(file) })
  }
  function photoFailed() {
    cancel()
    setError('사진을 열 수 없어요.')
    setPhoto(null)
  }
  async function readPhoto() {
    if (!photo || !consent || !signedIn || !provider) return
    cancel()
    const id = ++sequence.current
    const request = new AbortController()
    controller.current = request
    setBusy(true)
    setElapsed(0)
    setError('')
    const timer = setTimeout(() => request.abort(), 105000)
    try {
      const prepared = await preparePcPhoto(photo.file)
      if (id !== sequence.current) return
      const result = await extractPcPhoto(prepared, request.signal, provider)
      if (id === sequence.current) {
        const review = reviewValuesOf(result.specs)
        setGpus(review.gpus)
        setValues(review.values)
        setWarnings(result.warnings || [])
      }
    } catch (e) {
      if (id === sequence.current) setError(e.name === 'AbortError' ? '사진 읽기를 취소했거나 시간이 초과됐어요. 다시 시도해 주세요.' : e.message)
    } finally {
      clearTimeout(timer)
      if (id === sequence.current) setBusy(false)
    }
  }

  return { photo, error, setError, busy, values, setValues, warnings, consent, setConsent, provider, gpus, elapsed, cancel, selectPhoto, photoFailed, readPhoto }
}
