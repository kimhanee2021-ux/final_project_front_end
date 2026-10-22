// [추가] 구매 판단 값 → 화면 표시(글자 · 고정 색 · 아이콘). 카드 판단 칩과 상단 요약이 같이 쓴다.
// 글자/배경색은 라이트·다크 테마와 상관없이 고정해서 어디서나 같은 대비로 보이게 한다.
// 세 가지 색을 서로 뚜렷이 다르게 정함: 할인 대기(주황), 구매 적기(파랑), 정보 부족(회색), 신작(보라)
// 문구는 지시하는 말투(지금 사요) 대신 상태를 알려 주는 명사로 쓴다
export const VERDICTS = {
  BUY: { label: '구매 적기', bg: '#1d4ed8', icon: 'check' },
  WAIT: { label: '할인 대기', bg: '#b45309', icon: 'clock' },
  NEW: { label: '신작', bg: '#7c3aed', icon: 'spark' },
  UNKNOWN: { label: '정보 부족', bg: '#6b7280', icon: 'info' },
}

// 판단 결과 하나의 종류. 판단 불가 중 reasonCode가 NEW면 신작으로 본다 (정보 부족과 구분)
export function verdictKind(advice) {
  if (!advice) return null
  if (advice.verdict === 'UNKNOWN' && advice.reasonCode === 'NEW') return 'NEW'
  return VERDICTS[advice.verdict] ? advice.verdict : 'UNKNOWN'
}

// 종류별 개수: { BUY: 2, WAIT: 3, ... }
export function countVerdicts(adviceMap) {
  return Object.values(adviceMap).reduce((counts, advice) => {
    const kind = verdictKind(advice)
    return { ...counts, [kind]: (counts[kind] ?? 0) + 1 }
  }, {})
}
