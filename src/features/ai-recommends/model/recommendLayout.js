// AI 추천 화면의 배치 상수 (TOP 카드 수, 더 많은 추천 범위, 태그 수)

export const TOP_COUNT = 3
// 더 많은 추천은 12위까지 (4~12위 = 3열 × 3줄)
export const LIST_END = 12
// 더 많은 추천 옆 태그: 내 취향 태그 수와 태그마다 보여줄 게임 수 (3열 × 4줄). ALL_TAG는 4~12위를 그대로 보여준다.
export const TAG_COUNT = 5
export const TAG_PICK_COUNT = 12
export const ALL_TAG = 'all'
// AI가 추천을 만드는 순서. 추천받기 전 안내와 불러오는 동안의 진행 표시가 같이 쓴다.
export const STEPS = ['플레이 기록 읽기', '취향 계산하기', '어울리는 게임 고르기']
