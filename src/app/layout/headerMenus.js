// 헤더바 메인 메뉴 (왼쪽부터 표시 순서).
// children이 있으면 메뉴를 눌렀을 때 아래로 서브 메뉴가 펼쳐지고, 없으면 바로 이동한다.
// 설정·마이페이지는 오른쪽 영역(Header.jsx)에서 따로 그린다.
export const headerMenus = [
  {
    id: 'library',
    label: '내 라이브러리',
    children: [
      { to: '/library', label: '내 스팀 라이브러리', description: '보유 게임 목록과 장르별 보기' },
      { to: '/wishlist', label: '위시리스트', description: '관심 있는 게임 모아보기' },
    ],
  },
  {
    id: 'analysis',
    label: '나의 분석',
    children: [
      { to: '/analysis', label: '게임별 분석', description: '장르 · 가성비 · 최근 활동' },
      { to: '/analysis/overall', label: '종합 분석', description: '소비 금액 · 플레이타임 · 미플레이' },
    ],
  },
  {
    id: 'explore',
    label: '게임 탐색',
    children: [
      { to: '/recommendations', label: 'AI 추천 게임', description: '내 취향에 맞춘 추천' },
      { to: '/explore', label: '스팀 전체 게임', description: '장르별 · 출시 예정 · 인기 게임' },
      { to: '/gamer-map', label: '게이머 지도', description: '전세계 게이머 지도' },
      { to: '/weekly-rankings', label: '스팀 국가별 주간랭킹', description: '국가별 게임랭킹' },
      { to: '/pro-streamer-play', label: '프로·스트리머 플레이', description: '인기 게임의 플레이 영상 탐색' },
    ],
  },
  {
    id: 'pc',
    label: 'PC 분석',
    children: [
      { to: '/pc-check', label: '내 PC 사양', description: '사양 입력과 부품 정보 확인' },
      { to: '/pc-check/evaluation', label: '내 PC 종합평가', description: '점수 · 게임별 성능 · 업그레이드' },
    ],
  },
]
