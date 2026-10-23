import { useEffect, useRef, useState } from 'react'
import { resolveNewsGame } from '../api'
import { getErrorMessage } from '@/shared/lib/apiClient'

const IDLE = { phase: 'IDLE', message: '', transcript: '', candidates: [], hasMore: false }
const speechErrors = {
  'not-allowed': '마이크 권한이 필요해요. 브라우저 권한을 확인하거나 기존 검색창을 이용해 주세요.',
  'service-not-allowed': '이 브라우저에서는 음성 인식을 사용할 수 없어요. 기존 검색창을 이용해 주세요.',
  'audio-capture': '마이크를 찾지 못했어요. 연결 상태를 확인해 주세요.',
  'no-speech': '음성이 들리지 않았어요. 파동을 눌러 다시 말씀해 주세요.',
  network: '음성 인식 서비스에 연결하지 못했어요. 기존 검색창을 이용해 주세요.',
}

export function gameSearchInput(transcript) {
  const text = transcript.trim().replace(/[.!?。]+$/, '').trim()
  const explicitId = text.match(/^(?:스팀\s*)?(?:게임\s*(?:아이디|ID|번호)|앱\s*(?:아이디|ID)|app\s*id)\s*[:：]?\s*(\d+)$/i)
  if (explicitId) return { appId: explicitId[1] }
  // 숫자만 말해도 임의의 appId로 바꾸지 않는다. 숫자가 들어간 게임명도 보존한다.
  const gameQuery = text.replace(/\s+(?:검색해\s*줘|검색해\s*주세요|찾아\s*줘|찾아\s*주세요)$/, '').trim()
  return { gameQuery }
}

export function useVoiceGameSearch(onSelect, cancelRef, onTranscript) {
  const [state, setState] = useState(IDLE)
  const [supported] = useState(() => Boolean(window.SpeechRecognition || window.webkitSpeechRecognition))
  const recognition = useRef(null)
  const request = useRef(null)
  const timer = useRef(null)
  const generation = useRef(0)
  const candidateSet = useRef(null)
  const onSelectRef = useRef(onSelect)
  const onTranscriptRef = useRef(onTranscript)
  useEffect(() => { onSelectRef.current = onSelect }, [onSelect])
  useEffect(() => { onTranscriptRef.current = onTranscript }, [onTranscript])

  const cancelWork = () => {
    generation.current++
    clearTimeout(timer.current)
    timer.current = null
    if (recognition.current) {
      recognition.current.onresult = null
      recognition.current.onerror = null
      recognition.current.onend = null
      recognition.current.abort()
      recognition.current = null
    }
    request.current?.abort()
    request.current = null
  }
  useEffect(() => {
    const cleanup = () => {
      generation.current++
      candidateSet.current = null
      clearTimeout(timer.current)
      request.current?.abort()
      if (recognition.current) {
        recognition.current.onresult = null
        recognition.current.onerror = null
        recognition.current.onend = null
        recognition.current.abort()
        recognition.current = null
      }
    }
    const cancelExternal = () => { cleanup(); setState(IDLE) }
    cancelRef.current = cancelExternal
    return () => {
      cleanup()
      if (cancelRef.current === cancelExternal) cancelRef.current = null
    }
  }, [cancelRef])

  const applyResponse = (data, version) => {
    if (data.action === 'SELECTED') {
      candidateSet.current = null
      setState(previous => ({ ...previous, phase: 'SELECTED', candidates: [], message: data.message }))
      onSelectRef.current(data)
    } else if (data.action === 'CHOOSE_GAME') {
      candidateSet.current = { token: data.candidateSetToken, version }
      setState(previous => ({ ...previous, phase: 'CHOOSE_GAME', candidates: data.candidates,
        hasMore: data.hasMore, message: data.message }))
    } else {
      candidateSet.current = null
      setState(previous => ({ ...previous, phase: 'ERROR', candidates: [], message: data.message }))
    }
  }
  const resolve = async (payload, current, version, transcript) => {
    const sourceLocation = window.location.href
    const controller = new AbortController()
    request.current = controller
    setState({ ...IDLE, phase: 'RESOLVING', transcript, message: '게임을 확인하고 있어요.' })
    try {
      const data = await resolveNewsGame({ ...payload, version }, controller.signal)
      if (generation.current === current && window.location.href === sourceLocation) applyResponse(data, version)
    } catch (error) {
      if (generation.current !== current || controller.signal.aborted) return
      candidateSet.current = null
      setState({ ...IDLE, phase: 'ERROR', transcript, message: getErrorMessage(error, '게임을 확인하지 못했어요. 다시 검색해 주세요.') })
    }
  }

  const start = () => {
    cancelWork()
    const current = generation.current
    const pendingCandidates = candidateSet.current
    if (!supported || !window.isSecureContext) {
      setState({ ...IDLE, phase: 'ERROR', message: '음성 인식을 지원하는 브라우저의 HTTPS 또는 localhost 환경에서 이용해 주세요. 기존 검색창은 계속 사용할 수 있어요.' })
      return
    }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const instance = new Recognition()
    recognition.current = instance
    instance.lang = 'ko-KR'
    instance.continuous = false
    instance.interimResults = false
    instance.maxAlternatives = 1
    let received = false
    setState(previous => ({ ...previous, phase: 'LISTENING', message: pendingCandidates
      ? '후보 번호 또는 새 게임명을 말씀해 주세요.' : '찾고 싶은 게임명을 말씀해 주세요.' }))
    instance.onresult = event => {
      if (generation.current !== current || received) return
      const result = Array.from(event.results).find(item => item.isFinal)
      if (!result) return
      received = true
      clearTimeout(timer.current)
      instance.stop()
      const transcript = result[0].transcript.trim()
      if (!pendingCandidates && onTranscriptRef.current?.(transcript)) {
        setState({ ...IDLE, transcript })
        return
      }
      const number = transcript.replace(/[.!?。]+$/, '').match(/^(?:후보\s*)?(\d+)\s*번$/)
      if (number && pendingCandidates) {
        resolve({ candidateSetToken: pendingCandidates.token, selectedCandidateIndex: Number(number[1]) }, current, pendingCandidates.version, transcript)
      } else if (number) {
        setState({ ...IDLE, phase: 'ERROR', transcript, message: '선택할 후보가 없어요. 게임명이나 “게임 번호 730”처럼 말씀해 주세요.' })
      } else {
        candidateSet.current = null
        resolve(gameSearchInput(transcript), current, current, transcript)
      }
    }
    instance.onerror = event => {
      if (generation.current !== current || received) return
      clearTimeout(timer.current)
      setState(previous => ({ ...previous, phase: 'ERROR', message: speechErrors[event.error] || '음성 인식이 중단됐어요. 다시 시도해 주세요.' }))
    }
    instance.onend = () => {
      if (generation.current !== current) return
      clearTimeout(timer.current)
      recognition.current = null
      if (!received) setState(previous => previous.phase === 'LISTENING'
        ? { ...previous, phase: 'IDLE', message: '인식된 게임명이 없어요. 파동을 눌러 다시 시도해 주세요.' } : previous)
    }
    try {
      instance.start()
      timer.current = setTimeout(() => {
        if (generation.current !== current || received) return
        cancelWork()
        setState(previous => ({ ...previous, phase: 'ERROR', message: speechErrors['no-speech'] }))
      }, 8000)
    } catch {
      cancelWork()
      setState({ ...IDLE, phase: 'ERROR', message: '마이크를 시작하지 못했어요. 잠시 후 다시 시도해 주세요.' })
    }
  }

  const selectCandidate = index => {
    const pending = candidateSet.current
    if (!pending) return
    cancelWork()
    resolve({ candidateSetToken: pending.token, selectedCandidateIndex: index }, generation.current, pending.version, state.transcript)
  }
  const stop = () => {
    cancelWork()
    candidateSet.current = null
    setState({ ...IDLE, message: '음성 검색을 중지했어요.' })
  }
  return { ...state, supported, start, stop, selectCandidate }
}
