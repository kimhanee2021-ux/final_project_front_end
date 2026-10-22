import { useCallback, useEffect, useRef, useState } from 'react'
import { askCoach } from '../api'
import { coachErrorMessage, toHistory } from '../model/coachModel'
import { getErrorMessage } from '@/shared/lib/apiClient'

// 코치와의 대화. 대화는 화면에만 두고 저장하지 않는다 (새로고침하면 처음부터).
export function useCoachChat() {
  const [messages, setMessages] = useState([])
  const [pending, setPending] = useState(false)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  const send = useCallback(async text => {
    const question = text.trim()
    if (!question || pending) return
    const history = toHistory(messages)
    setMessages(current => [...current, { id: Date.now(), role: 'user', text: question }])
    setPending(true)
    try {
      const reply = await askCoach(question, history)
      if (mounted.current) {
        setMessages(current => [...current, { id: Date.now() + 1, role: 'model', text: reply.answer, games: reply.games ?? [], evidence: reply.evidence ?? [] }])
      }
    } catch (error) {
      if (mounted.current) {
        const message = coachErrorMessage(error?.response?.data?.code, getErrorMessage(error))
        setMessages(current => [...current, { id: Date.now() + 1, role: 'model', text: message, error: true }])
      }
    } finally {
      if (mounted.current) setPending(false)
    }
  }, [messages, pending])

  const reset = useCallback(() => setMessages([]), [])

  return { messages, pending, send, reset }
}
