// [변경] 목업용 게임 상수(GAMES)는 제거했다. 게임 목록은 이제 사이트의 /api/games에서 가져온다.
// (목록 로직: components/GameRatingList.jsx, 목록 호출: features/games/api.js의 fetchGames/searchGames)

// 스팀 원본 언어 코드 → 화면 표시명. 스팀은 한국어를 'koreana'로 준다.
export const LANGUAGE_LABEL = {
  korean: '한국어',
  koreana: '한국어',
  english: 'English',
}
