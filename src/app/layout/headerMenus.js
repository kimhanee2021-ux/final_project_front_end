// 헤더바 메인 메뉴 (왼쪽부터 표시 순서).
// 모바일 사이드바(Sidebar.jsx)도 이 목록을 그대로 쓰므로 메뉴를 바꾸면 양쪽이 함께 바뀐다.
// children이 있으면 메뉴를 눌렀을 때 아래로 서브 메뉴가 펼쳐지고, 없으면 to로 바로 이동한다(그때는 icon·description도 함께 적는다).
// 설정·마이페이지는 오른쪽 영역(Header.jsx)에서 따로 그린다.
export const headerMenus = [
  {
    id: 'library',
    label: '내 라이브러리',
    children: [
      { to: '/library', icon: 'library', label: '내 스팀 라이브러리', description: '보유 게임 목록과 장르별 보기' },
      { to: '/wishlist', icon: 'heart', label: '위시리스트', description: '관심 있는 게임 모아보기' },
    ],
  },
  {
    id: 'analysis',
    label: '나의 분석',
    children: [
      { to: '/analysis', icon: 'chart', label: 'AI 분석', description: '소비 유형 · 소비 패턴 · 가성비 · 라이브러리' },
      { to: '/ai-coach', icon: 'chat', label: '노바와 채팅', description: '소비 · 가성비 · 다음에 할 게임을 대화로 물어보기' },
    ],
  },
  {
    id: 'explore',
    label: '게임 탐색',
    children: [
      { to: '/ai-recommends', icon: 'spark', label: 'AI 게임 추천', description: '내가 플레이한 게임 취향으로 다음 게임 추천' },
      { to: '/explore', icon: 'compass', label: '스팀 전체 게임', description: '장르별 · 출시 예정 · 인기 게임' },
      { to: '/bbs', icon: 'note', label: 'BBS', description: '게임별 공식 소식 · 한국어 AI 브리핑', matchChildren: true },
    ],
  },
  {
    id: 'pc',
    label: 'AI PC 진단',
    to: '/pc-check',
    icon: 'monitor',
    description: '등급 · 내 부품 · 게임별 성능 · 개선 방향',
  },
]
