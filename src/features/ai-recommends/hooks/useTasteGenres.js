import { useMemo } from 'react'
import { useAiDiagnosed } from './useAiDiagnosed'
import { useAiRecommendations } from './useAiRecommendations'
import { tasteGenres } from '../model/recommendation'

// AI 추천 화면이 읽은 내 주 플레이 장르. 추천받기를 한 번이라도 눌렀을 때만 불러오고, 추천 화면과 같은 캐시를 쓴다.
export function useTasteGenres(userId, count = 3) {
  const [diagnosed] = useAiDiagnosed(userId)
  const { data, loading } = useAiRecommendations(userId, { enabled: diagnosed })
  const genres = useMemo(() => tasteGenres(data?.games ?? [], count), [data, count])
  return { genres, loading, diagnosed }
}
