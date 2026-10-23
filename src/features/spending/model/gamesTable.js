import { netAmount } from './spendingMetrics.js'

// 표의 '미플레이' 탭: 돈을 내고 산 게임 중 한 번도 켜지 않은 게임
export const isUnplayedPaid = game => game.hours === 0 && netAmount(game) > 0

// 검색어(게임 이름, 대소문자 무시)로 거른다
export const searchGames = (games, query) => games.filter(game => game.name.toLowerCase().includes(query.toLowerCase()))

// 플레이 상태 탭으로 거른다 ('all' | 'unplayed')
export const filterByPlayState = (games, filter) => (filter === 'unplayed' ? games.filter(isUnplayedPaid) : games)

// 정렬 ('price' 구매 금액순 | 'hours' 플레이 시간순 | 'recent' 최근 구매순). 값이 없는 게임은 뒤로 간다.
const COMPARE = {
  price: (a, b) => (netAmount(b) ?? -1) - (netAmount(a) ?? -1),
  hours: (a, b) => (b.hours ?? -1) - (a.hours ?? -1),
  recent: (a, b) => (b.purchasedAt ?? '').localeCompare(a.purchasedAt ?? ''),
}
export const sortGames = (games, sort) => [...games].sort(COMPARE[sort] ?? COMPARE.recent)

// 플레이 시간 미니 막대의 기준(100%): 가장 오래 한 게임의 시간
export const maxPlayHours = games => Math.max(0, ...games.map(game => game.hours || 0))
