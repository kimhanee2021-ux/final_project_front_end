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
    ],
  },
  {
    id: 'pc',
    label: 'PC 분석',
    children: [
      { to: '/pc-check', label: '내 PC 사양', description: '사양 입력과 부품 정보 확인' },
      { to: '/pc-check/evaluation', label: '내 PC 종합평가', description: '점수 · 게임별 성능 · 업그레이드' },
      { to: '/pc-check/diagnosis', label: 'PC 성능 진단', description: '게임별 FPS · 등급 · 업그레이드 후보' },
    ],
  },
  {
    id: 'ai',
    label: 'AI 도우미',
    children: [
      { to: '/ai-games', label: 'AI 게임 추천', description: '게임 정보 기반 상담' },
      { to: '/ai-screenshots', label: 'AI 스크린샷 분석', description: '화면을 올리면 원인을 짚어줘요' },
      { to: '/ai-game-manager', label: 'AI 내 게임 매니저', description: '게임 정리와 구매 조건 알림' },
      { to: '/ai-worldcup', label: 'AI 게임 취향 월드컵', description: '고르면서 취향 찾기' },
    ],
  },
]
