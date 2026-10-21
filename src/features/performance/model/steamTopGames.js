// 스팀 전체 게임 판매 순위 상위 5개(DLC·번들·하드웨어 제외, '게임'만). 화면을 열 때 바로 보여주려고 미리 가져와 둔 값이다.
// 출처: https://store.steampowered.com/search/?filter=topsellers&category1=998 (2026-10-20 확인)
// 순위는 바뀌므로, 갱신하려면 위 주소(게임만 보기)에서 상위 5개의 앱 번호와 이름으로 아래 목록을 고친다.
export const STEAM_TOP_GAMES_CHECKED_AT = '2026-10-20'

const steamHeader = appId => `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`

export const STEAM_TOP_GAMES = [
  { appId: 578080, name: 'PUBG: BATTLEGROUNDS' },
  { appId: 4435490, name: 'Call of Duty®: Modern Warfare® 4' },
  { appId: 1049590, name: 'Eternal Return' },
  { appId: 1867240, name: 'WARDOGS' },
  { appId: 1091500, name: 'Cyberpunk 2077' },
].map(game => ({ ...game, headerImage: steamHeader(game.appId) }))
