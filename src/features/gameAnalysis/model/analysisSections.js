// AI 분석 페이지의 데이터 패널 목록. 패널을 그리는 쪽과 옆 목차가 같은 목록을 쓴다 (id는 패널의 id = 이동할 주소, icon은 목차 라벨의 GSIcon 이름).

// 게임별 데이터 (가성비 랭킹은 종합 데이터의 "게임 시간당 가성비"에, 게임별 플레이 시간 목록은 맨 아래 보유 게임 표에 함께 담았다)
export const GAME_SECTIONS = [
  { id: 'genre', label: '보유 게임 장르 분석', icon: 'grid' },
  { id: 'valueBand', label: '게임 가성비', icon: 'trophy' },
  { id: 'activity', label: '최근 활동', icon: 'activity' },
]

// 종합 데이터: 지표 하나가 패널 하나
export const OVERALL_SECTIONS = [
  { id: 'total', label: '게임 총 소비 금액', icon: 'chart' },
  { id: 'hourly', label: '게임 시간당 가성비', icon: 'clock' },
  { id: 'playtime', label: '총 플레이타임', icon: 'play' },
  { id: 'average', label: '평균 게임 정가', icon: 'wallet' },
  { id: 'unplayed', label: '미플레이 게임', icon: 'gamepad' },
]

// 맨 아래 보유 게임 표
export const GAMES_SECTION = { id: 'games', label: '보유 게임 목록', icon: 'list' }

// 옆 목차: 묶음 제목(없으면 제목 없이) + 항목. 순서는 페이지에 보이는 순서와 같다.
export const TOC_GROUPS = [
  { title: null, items: [{ id: 'ai-insight', label: 'AI 분석', icon: 'spark' }] },
  { title: '게임별 데이터', items: GAME_SECTIONS },
  { title: '종합 데이터', items: [...OVERALL_SECTIONS, GAMES_SECTION] },
]

export const TOC_IDS = TOC_GROUPS.flatMap(group => group.items.map(item => item.id))
