// 프로필 꾸미기(커버 · 아바타 · 취향 태그) 선택지와 처음 값. 이 브라우저에만 저장된다.
// 게임 기록은 스팀 실제 데이터(useMySpendingContext)를 쓰므로 여기에 두지 않는다.
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
}
