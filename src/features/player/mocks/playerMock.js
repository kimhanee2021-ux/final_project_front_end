// Profile and game records are local demo data, not connected account activity.
export const profileCovers = [
  { id: 'fantasy', name: '잊혀진 왕국', image: '/images/fantasy-world.png' },
  { id: 'night-city', name: '네온 시티', image: '/images/cyberpunk-wide.jpg' },
  { id: 'mist', name: '신화 속 여정', image: '/images/wukong-wide.jpg' },
]
export const profileAvatars = [
  { id: 'adventurer', name: '모험가', image: '/images/player-adventurer.png' },
  { id: 'classic', name: '클래식 플레이어', image: '/images/avatar.svg' },
  { id: 'wanderer', name: '왕국의 여행자', image: '/images/fantasy-world.png' },
]
export const preferenceTags = [
  '스토리 중심',
  '싱글 플레이',
  '탐험',
  'RPG',
  '액션',
  '협동',
  '전략',
  '편안한 플레이',
  '도전',
  '인디',
]
export const playStyles = [
  '여유롭게, 스토리를 즐기며',
  '새로운 세계를 탐험하며',
  '친구들과 함께 즐기며',
  '도전하고 성장하며',
]
export const gameStatuses = [
  { id: 'playing', label: '플레이 중', icon: 'play', tone: 'mint' },
  { id: 'completed', label: '완료', icon: 'check', tone: 'blue' },
  { id: 'planned', label: '플레이 예정', icon: 'clock', tone: 'gold' },
  { id: 'paused', label: '잠시 쉬는 중', icon: 'pause', tone: 'purple' },
]
export const defaultPlayer = {
  profile: {
    name: 'Player',
    bio: '좋은 이야기가 있는 게임을 좋아합니다.\n게임은 또 다른 세상을 여행하는 방법이라고 생각해요.',
    location: '게임이 있는 어디든',
    cover: 'fantasy',
    avatar: 'adventurer',
  },
  preferences: {
    tags: ['스토리 중심', '싱글 플레이', '탐험', 'RPG'],
    playStyle: playStyles[0],
    monthlyHours: 48,
    budget: 70000,
  },
  games: {
    elden: {
      status: 'playing',
      progress: 62,
      note: '다음에는 알터 고원에서 남겨둔 탐험을 이어가기.',
    },
    cyberpunk: {
      status: 'playing',
      progress: 35,
      note: '나이트 시티의 사이드 퀘스트를 천천히 둘러보기.',
    },
    hades: { status: 'playing', progress: 18, note: '새로 얻은 무기로 한 번 더 도전하기.' },
    zelda: {
      status: 'completed',
      progress: 100,
      note: '하늘을 탐험하는 순간이 가장 기억에 남았어요.',
    },
    stellar: { status: 'completed', progress: 100, note: '마지막 전투까지 즐겁게 플레이한 모험.' },
    baldur: { status: 'planned', progress: 0, note: '' },
    dave: { status: 'planned', progress: 0, note: '' },
  },
  activities: [
    {
      id: 'demo-1',
      type: 'note',
      title: '게임에 한 줄 메모를 남겼어요.',
      description: 'Elden Ring · 다음에는 알터 고원에서 남겨둔 탐험을 이어가기.',
      date: '2026-10-02T09:20:00+09:00',
    },
    {
      id: 'demo-2',
      type: 'completed',
      title: '게임을 완료했어요!',
      description: 'Stellar Blade · 마지막 전투까지 즐겁게 플레이한 모험.',
      date: '2026-10-01T21:03:00+09:00',
    },
    {
      id: 'demo-3',
      type: 'playing',
      title: '새로운 모험을 시작했어요.',
      description: 'Hades II의 플레이 상태를 플레이 중으로 변경했어요.',
      date: '2026-09-29T20:17:00+09:00',
    },
    {
      id: 'demo-4',
      type: 'preferences',
      title: '나에게 맞는 게임 예산을 설정했어요.',
      description: '월 게임 예산을 70,000원으로 정했어요.',
      date: '2026-09-28T10:12:00+09:00',
    },
    {
      id: 'demo-5',
      type: 'profile',
      title: '나의 프로필을 꾸몄어요.',
      description: '좋아하는 이야기와 취향으로 나를 소개했어요.',
      date: '2026-09-27T18:30:00+09:00',
    },
  ],
}
