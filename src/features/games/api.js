import apiClient from '../../utils/apiClient'

// 백엔드 FeaturedGameController(/api/games/featured) 연동 — 스팀 "추천" 섹션 캐시.
// 페이지네이션 없이 전체 배열로 내려온다(장르 없음, 개수는 백엔드가 매일 동기화하는 스냅샷 크기만큼).
// 응답: FeaturedGameItem[] = { appId, name, discounted, discountPercent, originalPrice, finalPrice, currency, headerImage }
export async function fetchFeaturedGames({ signal } = {}) {
  const { data } = await apiClient.get('/api/games/featured', { signal })
  return data
}

// 트렌드 탭. 응답: FeaturedCategoryResponse[] = { categoryKey, categoryName, games: FeaturedGameItem[] }
export async function fetchFeaturedCategories({ signal } = {}) {
  const { data } = await apiClient.get('/api/games/featured-categories', { signal })
  return data
}
