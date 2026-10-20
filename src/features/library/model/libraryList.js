// 내 라이브러리 목록의 정렬·표시 규칙. 화면은 이 결과만 받아서 그린다.

// 게임별 인기순은 스팀 전체 순위가 아니라 "내가 최근 2주 동안 많이 한 순서"다(내 데이터에 있는 값).
export const SORT_OPTIONS = [
  { key: 'recent', label: '최근 플레이순' },
  { key: 'popular', label: '게임별 인기순' },
  { key: 'playtime', label: '총 플레이시간순' },
]
export const DEFAULT_SORT = 'playtime'

const lastPlayed = game => (game.lastPlayedAt ? new Date(game.lastPlayedAt).getTime() || 0 : 0)
const COMPARATORS = {
  recent: (a, b) => lastPlayed(b) - lastPlayed(a),
  popular: (a, b) =>
    (b.playtime2Weeks ?? 0) - (a.playtime2Weeks ?? 0) || (b.playtimeForever ?? 0) - (a.playtimeForever ?? 0),
  playtime: (a, b) => (b.playtimeForever ?? 0) - (a.playtimeForever ?? 0),
}

// 원본은 그대로 두고 정렬한 새 배열을 돌려준다. 같은 값이면 이름순으로 둔다.
export function sortGames(games, sortKey) {
  const compare = COMPARATORS[sortKey] ?? COMPARATORS[DEFAULT_SORT]
  return [...games].sort((a, b) => compare(a, b) || String(a.name).localeCompare(String(b.name), 'ko'))
}

// 분 단위 플레이시간 → "154.2시간"
export const formatHours = minutes =>
  `${((minutes ?? 0) / 60).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}시간`

// 마지막 플레이 날짜 → "2024.05.12". 기록이 없으면 안내 문구.
export function formatPlayedDate(value) {
  const date = value ? new Date(value) : null
  if (!date || Number.isNaN(date.getTime())) return '플레이 기록 없음'
  const pad = number => String(number).padStart(2, '0')
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`
}

// 장르 필터 줄의 아이콘(GSIcon 이름). 정해 두지 않은 장르는 게임패드.
const GENRE_ICONS = {
  all: 'library',
  액션: 'gamepad',
  RPG: 'trophy',
  시뮬레이션: 'grid',
  전략: 'compass',
  스포츠: 'activity',
  기타: 'more',
}
export const genreIcon = key => GENRE_ICONS[key] ?? 'gamepad'
