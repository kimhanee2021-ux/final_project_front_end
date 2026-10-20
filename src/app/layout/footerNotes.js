// 페이지별 푸터 안내 문구. 목록에 없는 경로는 기본 문구를 쓴다.
const DEFAULT_NOTE = ['DEMO EXPERIENCE', '모든 플레이 기록과 추천은 더미 데이터입니다.']

const notes = {
  '/pc-check/diagnosis': ['내 PC 성능 체크', '확인한 사양과 공식 게임 요구 사양을 비교해요.'],
  '/hangul-blocks': ['HANGUL BLOCKS', '개인 기록은 현재 브라우저에 저장됩니다.'],
}

export function footerNote(pathname) {
  return notes[pathname] ?? DEFAULT_NOTE
}
