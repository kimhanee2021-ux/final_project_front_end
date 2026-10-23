import { useEffect, useRef, useState } from 'react'
import { interpretNewsVoice } from '../api'
import { getErrorMessage } from '@/shared/lib/apiClient'
import { NewsUtteranceSession } from '../model/newsUtteranceSession'

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
  const [supported] = useState(() => Boolean(window.SpeechRecognition || window.webkitSpeechRecognition))
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
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Recognition || !window.isSecureContext) {
      setState({ ...IDLE, phase: 'ERROR', message: '음성 인식을 지원하는 브라우저의 HTTPS 또는 localhost에서 이용해 주세요. 기존 검색창도 사용할 수 있어요.' }); return
    }
    setState(previous => ({ ...previous, phase: 'LISTENING', transcript: '', message: '듣고 있어요. 잠시 쉬어도 괜찮아요. 말씀을 마친 뒤 약 3초 기다려 주세요.' }))
    const session = new NewsUtteranceSession({
      Recognition,
      onPreview: transcript => {
        if (generation.current === current) setState(previous => ({ ...previous, transcript }))
      },
      onFinal: transcript => { if (generation.current === current) interpret(transcript, current) },
      onError: message => {
        if (generation.current === current) setState(previous => ({ ...previous, phase: 'ERROR', message }))
      },
    })
    recognition.current = session
    session.start()
  }
  const stop = () => { cancelWork(); context.current.candidateSetToken = null; context.current.candidateVersion = null; conversationStateRef.current.context = { ...context.current }; setState(IDLE) }
  const selectCandidate = index => { cancelWork(); interpret(`${index}번`, generation.current) }
  return { ...state, supported, start, stop, selectCandidate }
}


