// 페이지별 푸터 안내 문구. 목록에 없는 경로는 안내 문구를 보여주지 않는다.
const notes = {
  '/pc-check': ['AI PC 진단', '입력한 사양을 AI가 분석한 추정 결과예요.'],
  '/hangul-blocks': ['HANGUL BLOCKS', '개인 기록은 현재 브라우저에 저장됩니다.'],
}

// [제목, 내용] 또는 안내할 문구가 없으면 null
export function footerNote(pathname) {
  return notes[pathname] ?? null
}
