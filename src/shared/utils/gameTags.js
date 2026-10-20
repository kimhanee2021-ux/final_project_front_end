// 스팀 게임의 태그(장르)를 화면에 맞게 다듬고, 검색에 쓸 글자로 바꾼다.
// 백엔드 응답에 태그가 있을 때만 의미가 있다. 없으면 빈 배열이라 아무 영향이 없다.

export const MAX_CARD_TAGS = 3

// 영어 태그 → 한국어 이름과 사람들이 흔히 쓰는 검색어. 이 말들로 검색해도 그 태그를 가진 게임이 나온다.
const TAG_ALIASES = {
  'Massively Multiplayer': ['MMO', 'MMORPG', '대규모 다중 접속', '온라인'],
  MMORPG: ['MMO', '대규모 다중 접속', '온라인', 'RPG'],
  RPG: ['롤플레잉', 'RPG'],
  Action: ['액션'],
  Adventure: ['어드벤처', '모험'],
  Strategy: ['전략'],
  Simulation: ['시뮬레이션'],
  Sports: ['스포츠'],
  Racing: ['레이싱'],
  Casual: ['캐주얼'],
  Indie: ['인디'],
  'Free To Play': ['무료', '무료 플레이'],
  'Early Access': ['앞서 해보기'],
  'Open World': ['오픈 월드', '오픈월드'],
  Shooter: ['슈팅', 'FPS'],
  Horror: ['공포'],
  Puzzle: ['퍼즐'],
  'Co-op': ['협동', '코옵'],
  Multiplayer: ['멀티플레이', '멀티'],
  'Singleplayer': ['싱글플레이', '싱글'],
}

// 카드에 보여줄 한국어 이름. 목록에 없는 태그는 받은 글자 그대로 보여준다.
const TAG_LABELS = {
  Action: '액션',
  Adventure: '어드벤처',
  Strategy: '전략',
  Simulation: '시뮬레이션',
  Sports: '스포츠',
  Racing: '레이싱',
  Casual: '캐주얼',
  Indie: '인디',
  'Massively Multiplayer': 'MMO',
  'Free To Play': '무료',
  'Early Access': '앞서 해보기',
}

export const tagLabel = tag => TAG_LABELS[tag] ?? tag

// 백엔드가 태그를 글자 목록으로 주든 { name } 객체 목록으로 주든 글자 목록으로 통일한다.
export function normalizeTags(raw) {
  if (!Array.isArray(raw)) return []
  return raw
    .map(tag => (typeof tag === 'string' ? tag : (tag?.name ?? tag?.description ?? '')))
    .map(tag => tag.trim())
    .filter(Boolean)
}

// 검색 대상 글자: 게임 이름 + 태그 + 태그의 한국어/별칭
export function searchTextOf(game) {
  const tags = game.tags ?? []
  const aliases = tags.flatMap(tag => TAG_ALIASES[tag] ?? [])
  return [game.name, ...tags, ...aliases].join(' ')
}
