// 페이지별 푸터 안내 문구. 목록에 없는 경로는 기본 문구를 쓴다.
const DEFAULT_NOTE = ['DEMO EXPERIENCE', '모든 플레이 기록과 추천은 더미 데이터입니다.']

const isDemo = search => new URLSearchParams(search).get('demo') === '1'

const notes = {
  '/pc-check/diagnosis': () => ['내 PC 성능 체크', '확인한 사양과 공식 게임 요구 사양을 비교해요.'],
  '/hangul-blocks': () => ['HANGUL BLOCKS', '개인 기록은 현재 브라우저에 저장됩니다.'],
  '/ai-game-manager': search => [
    'AI GAME MANAGER',
    isDemo(search) ? '데모 체험 · 샘플 데이터입니다.' : '내 게임 정리와 구매 조건 알림을 한곳에서 관리해요.',
  ],
  '/ai-worldcup': search => [
    'AI TASTE WORLDCUP',
    isDemo(search)
      ? '데모 체험 · 샘플 분석입니다. 실제 AI 분석은 로그인 후 이용할 수 있어요.'
      : 'Steam 게임 정보와 나의 선택을 바탕으로 Gemini가 취향을 탐색합니다.',
  ],
  '/ai-games': () => ['AI GAME ASSISTANT', '게임 정보와 Gemini 답변으로 상담합니다.'],
  '/ai-screenshots': () => ['AI SCREENSHOT ANALYSIS', '샘플 분석과 실제 이미지 AI 분석을 구분해 제공합니다.'],
}

export function footerNote(pathname, search) {
  return notes[pathname]?.(search) ?? DEFAULT_NOTE
}
