// 자연어 검색 응답을 화면용 모양으로 바꾸는 순수 함수 모음.

// 카탈로그에 없는 게임(game: null)도 목록에서 빠지지 않게 번호로 대신 보여준다.
function toResultGame(item) {
  const genres = (item.game?.genre ?? '')
    .split(',')
    .map(genre => genre.trim())
    .filter(Boolean)
  return {
    // id · tags는 위시리스트(하트)가 쓰는 이름이다. id는 스팀 앱 번호다.
    id: item.appId,
    rank: item.rank,
    name: item.game?.name ?? `게임 #${item.appId}`,
    image: item.game?.thumbnailUrl ?? null,
    tags: genres,
    storeUrl: `https://store.steampowered.com/app/${item.appId}`,
  }
}

// AI가 검색어를 어떻게 이해했는지
function toUnderstanding(analysis) {
  return {
    analyzed: analysis?.analyzed ?? false,
    tags: analysis?.tags ?? [],
    excludeTags: analysis?.excludeTags ?? [],
    description: analysis?.description ?? '',
    similarTo: analysis?.similarTo ?? '',
  }
}

export function toNaturalSearchResult(data) {
  return {
    query: data?.query ?? '',
    understanding: toUnderstanding(data?.analysis),
    games: (data?.results ?? []).map(toResultGame),
  }
}

// 검색어 앞뒤 공백을 지운 값. 비어 있으면 검색하지 않는다.
export const normalizeQuery = text => text.trim()
