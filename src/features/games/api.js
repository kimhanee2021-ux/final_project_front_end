import apiClient from '../../utils/apiClient'

// 백엔드 GameController(/api/games) 연동.
// 응답: { content: GameSummary[], page, size, totalElements, totalPages, first, last }
// GameSummary: { appId, name, genre("Action,Indie"), priceInfo, discountPercent, reviewCount, positiveRate, thumbnailUrl }
export const GAME_PAGE_SIZE = 24

export async function fetchGames({ page = 0, genre, signal } = {}) {
  const { data } = await apiClient.get('/api/games', {
    params: { page, size: GAME_PAGE_SIZE, genre: genre || undefined },
    signal,
  })
  return data
}

export async function searchGames({ page = 0, name, signal }) {
  const { data } = await apiClient.get('/api/games/search', {
    params: { page, size: GAME_PAGE_SIZE, name },
    signal,
  })
  return data
}
