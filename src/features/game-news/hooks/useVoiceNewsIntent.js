import { useEffect, useRef, useState } from 'react'
import { interpretNewsVoice, transcribeNewsAudio } from '../api'
import { getErrorMessage } from '@/shared/lib/apiClient'
import { NewsAudioCapture } from '../model/newsAudioCapture'

const IDLE = { phase: 'IDLE', message: '', transcript: '', candidates: [], hasMore: false }
const empty = () => ({ appId: null, category: null, allCategories: false, awaiting: 'GAME', candidateSetToken: null, candidateVersion: null })

export function useVoiceNewsIntent(query, flow, onAction, cancelRef, conversationRef) {
  const localConversation = useRef({ history: [], context: null, version: 0 })
  const conversationStateRef = conversationRef || localConversation
  const contextForQuery = () => ({ appId: query.appId ? Number(query.appId) : null,
    category: flow?.mode === 'CATEGORY' ? null : query.category || null,
    allCategories: flow?.mode === 'CATEGORY' ? false : !query.category,
    awaiting: flow?.mode === 'CATEGORY' ? 'CATEGORY' : null, candidateSetToken: null, candidateVersion: null })
  const [state, setState] = useState(IDLE)
  const [supported] = useState(() => Boolean(navigator.mediaDevices?.getUserMedia && window.MediaRecorder && (window.AudioContext || window.webkitAudioContext)))
  const recognition = useRef(null), request = useRef(null), generation = useRef(0)
  const context = useRef(contextForQuery())
  const baseContext = useRef(contextForQuery())
  useEffect(() => {
    baseContext.current = { appId: query.appId ? Number(query.appId) : null,
      category: flow?.mode === 'CATEGORY' ? null : query.category || null,
      allCategories: flow?.mode === 'CATEGORY' ? false : !query.category,
      awaiting: flow?.mode === 'CATEGORY' ? 'CATEGORY' : null, candidateSetToken: null, candidateVersion: null }
  }, [query.appId, query.category, flow?.mode])
  useEffect(() => {
    const saved = conversationStateRef.current.context
    if (saved && String(saved.appId || '') === query.appId && (saved.awaiting || (saved.category || '') === query.category)) context.current = { ...saved }
    else { context.current = { ...baseContext.current }; conversationStateRef.current.history = []; conversationStateRef.current.context = null }
  }, [query.appId, query.category, conversationStateRef])
  const actionRef = useRef(onAction)
  useEffect(() => { actionRef.current = onAction }, [onAction])

  const cancelWork = () => {
    generation.current++
    recognition.current?.cancel(); recognition.current = null
    request.current?.abort(); request.current = null
  }
  useEffect(() => {
    const cleanup = () => {
      generation.current++
      request.current?.abort()
      recognition.current?.cancel(); recognition.current = null
    }
    const cancelExternal = (preserveConversation = false) => {
      cleanup()
      if (!preserveConversation) { context.current = { ...baseContext.current }; conversationStateRef.current.history = []; conversationStateRef.current.context = null }
      setState(IDLE)
    }
    cancelRef.current = cancelExternal
    return () => { cleanup(); if (cancelRef.current === cancelExternal) cancelRef.current = null }
  }, [cancelRef, conversationStateRef])

  const interpret = async (transcript, current) => {
    const sourceLocation = window.location.href
    const controller = new AbortController(); request.current = controller
    setState({ ...IDLE, phase: 'RESOLVING', transcript, message: '말씀하신 게임과 소식 분류를 확인하고 있어요.' })
    try {
      const data = await interpretNewsVoice({ transcript, version: ++conversationStateRef.current.version, context: context.current, history: conversationStateRef.current.history }, controller.signal)
      if (generation.current !== current || sourceLocation !== window.location.href) return
      if (['SEARCH', 'CLARIFY', 'CHOOSE_GAME'].includes(data.action) || (data.action === 'UNSUPPORTED' && data.appId)) context.current = {
        appId: data.appId, category: data.category, allCategories: data.allCategories,
        awaiting: data.awaiting, candidateSetToken: data.candidateSetToken, candidateVersion: data.candidateVersion,
      }
      if (['RESET', 'CHANGE_GAME'].includes(data.action)) context.current = empty()
      if (['RESET', 'CHANGE_GAME'].includes(data.action)) conversationStateRef.current.history = []
      else conversationStateRef.current.history = [...conversationStateRef.current.history, { transcript, action: data.action,
        appId: data.appId, name: data.name, category: data.category, allCategories: data.allCategories, awaiting: data.awaiting }].slice(-4)
      conversationStateRef.current.context = { ...context.current }
      setState({ phase: data.action === 'CHOOSE_GAME' ? 'CHOOSE_GAME' : 'IDLE', transcript,
        candidates: data.candidates || [], hasMore: data.hasMore, message: data.message })
      actionRef.current(data)
    } catch (error) {
      if (controller.signal.aborted || generation.current !== current) return
      context.current.candidateSetToken = null; context.current.candidateVersion = null
      setState({ ...IDLE, phase: 'ERROR', transcript, message: getErrorMessage(error, '의도를 확인하지 못했어요. 게임명과 분류를 짧게 다시 말씀해 주세요.') })
    }
  }
  const start = (changeGame = false) => {
    cancelWork()
    if (changeGame) { context.current = empty(); conversationStateRef.current.context = null; conversationStateRef.current.history = [] }
    const current = generation.current
    if (!supported || !window.isSecureContext) {
      setState({ ...IDLE, phase: 'ERROR', message: '음성 인식을 지원하는 브라우저의 HTTPS 또는 localhost에서 이용해 주세요. 기존 검색창도 사용할 수 있어요.' }); return
    }
    setState(previous => ({ ...previous, phase: 'STARTING', transcript: '', message: '마이크를 준비하고 있어요. 권한을 요청하면 허용해 주세요.' }))
    const sourceLocation = window.location.href
    const session = new NewsAudioCapture({
      onReady: () => {
        if (generation.current === current) setState(previous => ({ ...previous, phase: 'LISTENING', message: '듣고 있어요. 한국어나 영어로 말씀해 주세요. 말을 마친 뒤 3초 기다리거나 입력 완료를 눌러 주세요.' }))
      },
      onFinal: async audio => {
        if (generation.current !== current || sourceLocation !== window.location.href) return
        const controller = new AbortController(); request.current = controller
        setState(previous => ({ ...previous, phase: 'TRANSCRIBING', message: '말씀하신 음성을 인식하고 있어요.' }))
        try {
          const transcript = await transcribeNewsAudio(audio, context.current.appId, controller.signal)
          if (generation.current !== current || controller.signal.aborted || sourceLocation !== window.location.href) return
          interpret(transcript, current)
        } catch (error) {
          if (generation.current !== current || controller.signal.aborted) return
          setState(previous => ({ ...previous, phase: 'ERROR', message: getErrorMessage(error, '음성을 인식하지 못했어요. 다시 말씀해 주세요.') }))
        }
      },
      onError: message => {
        if (generation.current === current) setState(previous => ({ ...previous, phase: 'ERROR', message }))
      },
    })
    recognition.current = session
    session.start()
  }
  const stop = () => { cancelWork(); context.current.candidateSetToken = null; context.current.candidateVersion = null; conversationStateRef.current.context = { ...context.current }; setState(IDLE) }
  const selectCandidate = index => { cancelWork(); interpret(`${index}번`, generation.current) }
  const finish = () => recognition.current?.finish()
  return { ...state, supported, start, stop, finish, selectCandidate }
}


