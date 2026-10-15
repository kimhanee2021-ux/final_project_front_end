import { money } from '../../utils/formatters'

// 백엔드 FeaturedGameItemResponse(스팀 "추천" 섹션 캐시)를 화면에서 쓰는 형태로 바꾼다.
// 이 응답에는 장르·리뷰 데이터가 없다.
export function toFeaturedGame(item) {
  return {
    id: item.appId,
    name: item.name,
    image: item.headerImage,
    price: formatFeaturedPrice(item.finalPrice),
    discountPercent: item.discountPercent ?? 0,
    storeUrl: `https://store.steampowered.com/app/${item.appId}`,
  }
}

// finalPrice는 스팀 원본 그대로 100배 값으로 내려온다 (예: 1600000 = 16,000원).
function formatFeaturedPrice(finalPrice) {
  if (finalPrice == null) return ''
  return finalPrice === 0 ? '무료' : money(finalPrice / 100)
}

// 백엔드 FeaturedCategoryResponse 하나를 화면에서 쓰는 형태로 바꾼다.
// 스팀 원본 응답이 같은 게임을 한 카테고리 안에 두 번 넣어 보내는 경우가 있어(예: top_sellers),
// appId 기준으로 먼저 나온 것만 남기고 걸러낸다.
export function toFeaturedCategory(category) {
  const seenAppIds = new Set()
  const uniqueGames = category.games.filter(game => {
    if (seenAppIds.has(game.appId)) return false
    seenAppIds.add(game.appId)
    return true
  })
  return {
    key: category.categoryKey,
    name: category.categoryName,
    games: uniqueGames.map(toFeaturedGame),
  }
}
