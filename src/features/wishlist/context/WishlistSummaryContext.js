import { createContext, useContext } from 'react'

// 위시리스트 AI 분석 상태 (WishlistSummaryProvider가 채운다)
export const SummaryContext = createContext(null)

// 메시지와 카드가 분석 상태를 읽을 때 쓴다
export function useWishlistSummary() {
  const ctx = useContext(SummaryContext)
  if (!ctx) return { items: null, message: null, loading: false, error: false, retryIn: 0, advice: {} }
  return ctx
}
