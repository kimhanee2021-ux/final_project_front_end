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
      { to: '/ai-coach', label: 'AI 소비 코치', description: '소비 패턴 분석 · 예산 · 게임 추천' },
    ],
  },
  {
    id: 'explore',
    label: '게임 탐색',
    children: [
      { to: '/explore', label: '스팀 전체 게임', description: '장르별 · 출시 예정 · 인기 게임' },
    ],
  },
  {
    id: 'pc',
    label: 'PC 분석',
    children: [
      { to: '/pc-check', label: '내 PC 사양', description: '사양 입력과 부품 정보 확인' },
      { to: '/pc-check/evaluation', label: '내 PC 종합평가', description: '등급 · 게임별 성능 · 개선 방향' },
    ],
  },
]
