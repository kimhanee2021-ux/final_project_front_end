// 게임 검색 규칙. 대소문자와 띄어쓰기를 무시해서 '호그와트레거시'로 쳐도 '호그와트 레거시'가 나온다.
const normalize = text => text.normalize('NFC').toLowerCase().replace(/\s+/g, '')

// text 안에 query가 들어 있으면 true. query가 비어 있으면 모두 true.
export const matchesSearch = (text, query) => {
  const wanted = normalize(query ?? '')
  return !wanted || normalize(text ?? '').includes(wanted)
}
