// 프로필 꾸미기(커버 · 아바타) 선택지와 처음 값. 이 브라우저에만 저장된다.
// 게임 기록은 스팀 실제 데이터(useMySpendingContext), 소비 유형·주 플레이 장르·월 예산은 AI 화면의 API 값을 쓰므로 여기에 두지 않는다.
export const profileCovers = [
  { id: 'fantasy', name: '잊혀진 왕국', image: '/images/fantasy-world.png' },
  { id: 'night-city', name: '네온 시티', image: '/images/cyberpunk-wide.jpg' },
  { id: 'mist', name: '신화 속 여정', image: '/images/wukong-wide.jpg' },
]
export const profileAvatars = [
  { id: 'adventurer', name: '모험가', image: '/images/player-adventurer.png' },
  { id: 'wanderer', name: '왕국의 여행자', image: '/images/fantasy-world.png' },
]
export const defaultPlayer = {
  profile: {
    name: 'Player',
    cover: 'fantasy',
    avatar: 'adventurer',
  },
}
