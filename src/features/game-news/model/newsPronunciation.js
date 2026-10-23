// Audio-only display-name hints; catalog identifiers and stored summaries are untouched.
const GAME_NAMES = [
  [/(?<![\p{L}\p{N}])(?:Dota\s*2|도타\s*2)(?![a-z0-9])/giu, '도타 투'],
  [/(?<![\p{L}\p{N}])Counter[\s-]*Strike\s*2(?![a-z0-9])/giu, '카운터 스트라이크 투'],
  [/(?<![\p{L}\p{N}])Team\s+Fortress\s*2(?![a-z0-9])/giu, '팀 포트리스 투'],
]

export function spokenGameNames(input) {
  return GAME_NAMES.reduce((text, [pattern, name]) => text.replace(pattern, name), String(input || '').trim())
}

export function spokenNewsDate(value) {
  const date = new Date(value)
  if (!value || Number.isNaN(date.getTime())) return '날짜 미제공으로'
  return new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric' }).format(date)
}
