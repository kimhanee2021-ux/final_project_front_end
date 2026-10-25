// AI 검색 응답을 화면용 모양으로 바꾸고, 음성·글 요청을 BBS 브리핑 흐름(VoiceBriefingFlow)이 받는 명령으로 바꾼다.

const splitList = text =>
  (text ?? '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)

// 카탈로그에 없는 게임(game: null)도 목록에서 빠지지 않게 번호로 대신 보여준다.
function toGame({ appId, rank, game }) {
  const genres = splitList(game?.genre)
  return {
    // id · tags는 위시리스트(하트)가 쓰는 이름이다. 게임 탐색의 스팀 게임처럼 id는 앱 번호라서 어디서 담아도 같은 게임으로 본다.
    id: appId,
    appId,
    rank,
    name: game?.name ?? `게임 #${appId}`,
    genres,
    tags: genres,
    // 스팀 태그 중 앞쪽(많이 붙은) 것만 카드에 쓴다
    steamTags: splitList(game?.tags),
    image: game?.thumbnailUrl ?? null,
    positiveRate: game?.positiveRate ?? null,
    storeUrl: `https://store.steampowered.com/app/${appId}`,
  }
}

export function toSearchResult(data) {
  const keywords = data?.keywords ?? {}
  return {
    query: data?.query ?? '',
    intent: data?.intent ?? 'SEARCH',
    matchedGame: data?.matchedGame ? toGame(data.matchedGame) : null,
    tags: keywords.tags ?? [],
    excludeTags: keywords.excludeTags ?? [],
    description: keywords.description ?? '',
    // 말한 게임으로 비슷한 게임을 찾았으면 "OO 같은 게임" 칩은 굳이 보여주지 않는다
    similarTo: data?.similarTo && data.similarTo.appId !== data?.matchedGame?.appId ? data.similarTo.name : '',
    ignoredTags: data?.ignoredTags ?? [],
    games: (data?.items ?? []).map(toGame),
  }
}

// 검색 결과 카드에서 검색 태그와 겹치는 스팀 태그를 먼저 보여준다 (왜 이 게임이 나왔는지 바로 보이게)
export function highlightTags(gameTags, searchTags, count = 3) {
  const wanted = new Set(searchTags.map(tag => tag.toLowerCase()))
  const matched = gameTags.filter(tag => wanted.has(tag.toLowerCase()))
  const others = gameTags.filter(tag => !wanted.has(tag.toLowerCase()))
  return [...matched.map(tag => ({ tag, matched: true })), ...others.map(tag => ({ tag, matched: false }))].slice(0, count)
}

// AI 검색 응답(data) -> BBS 브리핑 흐름 명령 (bbs/model/voiceBriefingFlow의 validateCommand 형식).
// 최신 소식 요청: 말한 게임의 최신 공식 소식을 요약하고 낭독한다. 다음 소식·멈춤·계속: 지금 듣는 브리핑 조작.
// 그 밖(게임 찾기·조건 검색)은 주소에 검색 문장을 넣어 결과를 보여준다.
export function toBriefingCommand(data) {
  const base = { query: '', candidates: [], hasMore: false }
  if (data.intent === 'NEXT_NEWS') return { ...base, status: 'CONTROL', action: 'NEXT_BRIEFING' }
  if (data.intent === 'PAUSE' || data.intent === 'RESUME') return { ...base, status: 'CONTROL', action: data.intent }
  if (data.intent === 'LATEST_NEWS' && data.matchedGame?.game) {
    return { ...base, status: 'RESOLVED', action: 'LATEST_BRIEFING', game: { appId: data.matchedGame.appId, name: data.matchedGame.game.name } }
  }
  return { ...base, status: 'SEARCH', action: 'SEARCH', query: data.query }
}
