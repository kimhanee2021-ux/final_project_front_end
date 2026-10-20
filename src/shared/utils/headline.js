// 요약 문구를 '일반 글자'와 '강조할 글자'의 조각 배열로 만든다.
// 예: ['금액으로는 ', hl('₩186,000'), '이에요.'] -> AnalysisPanel이 강조 조각만 포인트 색으로 그린다.
export const hl = text => ({ highlight: text })

// 줄바꿈 조각: 문장 중간에서 줄을 바꾸고 싶을 때 쓴다.
export const br = { lineBreak: true }

// 조각 배열을 강조 표시 없는 한 줄 글자로 합친다 (타임라인 문장 등)
export const plain = parts => parts.map(part => (typeof part === 'string' ? part : part.lineBreak ? ' ' : part.highlight)).join('')
